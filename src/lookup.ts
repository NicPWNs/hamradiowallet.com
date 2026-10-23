// Turns an authority's bulk data into the one record a pass needs.
//
// The FCC and ISED publish completely different layouts, so each format gets
// its own reader and both return the same Licensee shape. Everything here is
// pure parsing: create_pass.ts fetches the files and builds the pass.

import { Service, normalizePostal } from "./services";

// One of the pass's three auxiliary slots: a wide row, then two half rows.
export interface AuxField {
  label: string;
  // What the web preview and Google Wallet show.
  value: string;
  // Set when the value is a date, so Apple can format it for the holder's
  // locale instead of taking the string as-is.
  isoDate?: string;
}

export interface Licensee {
  name: string;
  // Short value for the pass's secondary field.
  privileges: string;
  // Stable unique value for the pass serial number.
  serialNumber: string;
  // Normalized address codes that satisfy the holder check. Empty when the
  // authority publishes no address for this call sign, which is not the same
  // as the call sign being unknown.
  postalCodes: string[];
  aux: AuxField[];
  // Only the FCC publishes license dates. Canadian certificates are issued
  // for life, so a Canadian pass has no expiration to set.
  grantDate?: Date;
  expireDate?: Date;
}

// Seeded examples so the site can be tried without a license. No authority
// issues these prefixes in these services, so they cannot collide with a real
// call sign: the FCC issues neither M0 nor MORS, and ISED issues VA1 through
// VA7 but never VA0.
export const DEMO_CALLSIGNS: { [callsign: string]: string } = {
  M0RSE: "amateur",
  MORS001: "gmrs",
  VA0MRS: "canada",
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Format a date the way the pass and the web preview show it. The authorities
// publish calendar dates with no time zone, so they are read back in UTC:
// using the viewer's zone would move a date published as the 23rd to the 22nd
// for anyone west of UTC.
function formatDate(date: Date): string {
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

// Parse an FCC "MM/DD/YYYY" date string into a UTC Date
function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const [month, day, year] = dateStr.split("/").map(Number);
  if (isNaN(month) || isNaN(day) || isNaN(year)) return new Date();
  return new Date(Date.UTC(year, month - 1, day));
}

// Safe array field access helper
function getField(line: string | undefined, index: number): string {
  if (!line) return "";
  const fields = line.split("|");
  return fields[index] ?? "";
}

const FCC_CLASSES: { [code: string]: string } = {
  T: "Technician",
  G: "General",
  E: "Extra",
  N: "Novice",
  A: "Advanced",
  P: "Technician Plus",
};

// FCC ULS: entity rows in EN.dat, license rows in HD.dat, and for amateur an
// operator class in AM.dat, joined on the Unique System Identifier.
function lookupFcc(
  service: Service,
  callsign: string,
  files: { [name: string]: string[] },
): Licensee | null {
  const userData = files["EN.dat"] ?? [];
  const licenseData = files["HD.dat"] ?? [];
  const classData = files["AM.dat"] ?? [];

  // A callsign can appear in the FCC data more than once (renewed, re-granted
  // after a lapse, or previously held by someone else). Collect every entity
  // (EN.dat) row for the callsign so we can pick the correct license below.
  const candidateRows: number[] = [];
  for (let i = 0; i < userData.length; i++) {
    // Call sign is field index 4
    if (userData[i].split("|")[4] === callsign) {
      candidateRows.push(i);
    }
  }

  // Map each candidate's Unique System Identifier (USI) to its license (HD.dat)
  // row so we can inspect license status and expiration. Matching by USI rather
  // than by line index keeps selection correct even if EN.dat and HD.dat are
  // not perfectly aligned.
  const candidateUsis = new Set(
    candidateRows.map((i) => getField(userData[i], 1)).filter(Boolean),
  );
  const licenseByUsi: { [usi: string]: string } = {};
  if (candidateUsis.size > 0) {
    for (let i = 0; i < licenseData.length; i++) {
      const usi = licenseData[i].split("|")[1];
      if (candidateUsis.has(usi)) {
        licenseByUsi[usi] = licenseData[i];
      }
    }
  }

  // Choose the best record for the callsign: prefer an Active license
  // (HD.dat license_status, field index 5 === "A"), then the latest expiration
  // date. This avoids picking a stale Cancelled/Expired record just because it
  // sorts last in the file, which produced already-expired passes with wrong
  // grant/expiration dates.
  let row = -1;
  let bestActive = -1;
  let bestExpire = -Infinity;
  for (const i of candidateRows) {
    const usi = getField(userData[i], 1);
    const licenseLine = licenseByUsi[usi];
    const active = getField(licenseLine, 5) === "A" ? 1 : 0;
    const expire = parseDate(getField(licenseLine, 8)).getTime();
    if (
      row === -1 ||
      active > bestActive ||
      (active === bestActive && expire > bestExpire)
    ) {
      row = i;
      bestActive = active;
      bestExpire = expire;
    }
  }

  if (row === -1) {
    return null;
  }

  // The chosen record's USI and its license (HD.dat) row, matched by USI.
  const uniqueId = getField(userData[row], 1);
  const licenseLine = licenseByUsi[uniqueId];

  // Find row with matching class data. Prefer the Unique System Identifier
  // (USI, field 2 in EN/AM -> index 1) and pick the last matching AM row.
  // If no USI match is found, fall back to matching by callsign (last match).
  let classRow = -1;
  // Collect AM rows that match the USI
  const usiMatches: number[] = [];
  for (let i = 0; i < classData.length; i++) {
    const fields = classData[i].split("|");
    if (fields[1] === uniqueId) {
      usiMatches.push(i);
    }
  }

  if (usiMatches.length > 0) {
    // Prefer the last USI match (mirrors userData behavior of taking last match)
    classRow = usiMatches[usiMatches.length - 1];
  } else if (uniqueId) {
    // Fallback: search for callsign and prefer the last occurrence
    for (let i = 0; i < classData.length; i++) {
      const fields = classData[i].split("|");
      if (fields.indexOf(callsign) !== -1) {
        classRow = i;
      }
    }
  }

  // Extract class data (privileges). Try to find the callsign in the AM row
  // and take the following field as the class. Fall back to common indexes
  // if the callsign isn't present.
  let privileges = "";
  if (classRow >= 0 && classData[classRow]) {
    const fields = classData[classRow].split("|");
    const csIndex = fields.indexOf(callsign);
    if (csIndex !== -1 && fields.length > csIndex + 1) {
      privileges = fields[csIndex + 1];
    } else if (fields[16]) {
      privileges = fields[16];
    } else if (fields[5]) {
      privileges = fields[5];
    }
  }

  // A service with a single license class reports the service itself instead
  // of an operator class.
  if (service.privilegesValue) {
    privileges = service.privilegesValue;
  }

  const firstName = getField(userData[row], 8);
  const lastName = getField(userData[row], 10);
  // Clubs, businesses and government licensees have no personal name on the
  // record, only an entity name.
  const entityName = getField(userData[row], 7);
  const frn = getField(userData[row], 22);
  const grantDate = parseDate(getField(licenseLine, 7));
  const expireDate = parseDate(getField(licenseLine, 8));

  return {
    name: [firstName, lastName].filter(Boolean).join(" ") || entityName,
    privileges: FCC_CLASSES[privileges] || privileges,
    serialNumber: frn,
    postalCodes: [
      normalizePostal(service, getField(userData[row], 18).substring(0, 5)),
    ].filter((code) => service.postalRegex.test(code)),
    aux: [
      { label: "FCC REGISTRATION NUMBER", value: frn },
      {
        label: "GRANT DATE",
        value: formatDate(grantDate),
        isoDate: grantDate.toISOString(),
      },
      {
        label: "EXPIRATION DATE",
        value: formatDate(expireDate),
        isoDate: expireDate.toISOString(),
      },
    ],
    grantDate,
    expireDate,
  };
}

// The five qualifications ISED tracks, highest privilege last. Basic and
// Basic with Honours are the same exam at different marks, so a holder has
// one or the other, never both.
const ISED_QUALIFICATIONS: { index: number; short: string; long: string }[] = [
  { index: 7, short: "Basic", long: "Basic" },
  { index: 11, short: "Basic w/ Honours", long: "Basic with Honours" },
  { index: 8, short: "5 wpm", long: "Morse 5 wpm" },
  { index: 9, short: "12 wpm", long: "Morse 12 wpm" },
  { index: 10, short: "Advanced", long: "Advanced" },
];

// ISED Canada: one semicolon-delimited row per call sign, so the record is
// whichever row matches. The file carries no dates, because a Canadian
// Amateur Radio Operator Certificate is issued for life.
function lookupIsed(
  service: Service,
  callsign: string,
  files: { [name: string]: string[] },
): Licensee | null {
  const rows = files["amateur_delim.txt"] ?? [];

  let match: string[] | null = null;
  for (const line of rows) {
    const row = line.split(";");
    if ((row[0] ?? "").trim().toUpperCase() === callsign) {
      match = row;
      break;
    }
  }

  if (!match) {
    return null;
  }

  const fields = match;
  const field = (index: number) => (fields[index] ?? "").trim();

  const held = ISED_QUALIFICATIONS.filter((q) => field(q.index));
  // The secondary field reports the highest qualification held; the auxiliary
  // row below it spells out the whole set.
  const highest = held.length ? held[held.length - 1].long : "";

  const clubName = field(12);
  const name =
    [field(1), field(2)].filter(Boolean).join(" ") || clubName || callsign;

  return {
    name,
    privileges: highest,
    // ISED issues no registration number, and one row per call sign makes the
    // call sign itself a stable unique serial.
    serialNumber: callsign,
    // A holder whose own address is withheld can still be checked against
    // their club's, which is the only other address on the record.
    postalCodes: [
      normalizePostal(service, field(6)),
      normalizePostal(service, field(17)),
    ].filter((code) => service.postalRegex.test(code)),
    aux: [
      {
        label: "ALL QUALIFICATIONS",
        value: held.map((q) => q.short).join(", "),
      },
      { label: "PROVINCE", value: field(5) || "Canada" },
      { label: "VALIDITY", value: "Does Not Expire" },
    ],
  };
}

// The seeded example for a service, standing in for a real record.
function demoLicensee(service: Service): Licensee {
  if (service.format === "ised-delim") {
    return {
      name: "Samuel Morse",
      privileges: "Basic",
      serialNumber: "VA0MRS",
      postalCodes: ["A1A1A1"],
      aux: [
        { label: "ALL QUALIFICATIONS", value: "Basic" },
        { label: "PROVINCE", value: "ON" },
        { label: "VALIDITY", value: "Does Not Expire" },
      ],
    };
  }

  const grantDate = new Date();
  // setFullYear mutates its receiver, so expireDate is derived from a copy to
  // keep the grant date where it is.
  const expireDate = new Date(grantDate);
  expireDate.setFullYear(expireDate.getFullYear() + 10);

  return {
    name: "Samuel Morse",
    privileges: service.privilegesValue ?? "Technician",
    serialNumber: "0123456789",
    postalCodes: ["02720"],
    aux: [
      { label: "FCC REGISTRATION NUMBER", value: "0123456789" },
      {
        label: "GRANT DATE",
        value: formatDate(grantDate),
        isoDate: grantDate.toISOString(),
      },
      {
        label: "EXPIRATION DATE",
        value: formatDate(expireDate),
        isoDate: expireDate.toISOString(),
      },
    ],
    grantDate,
    expireDate,
  };
}

// Find a call sign in its service's data, or null if the authority does not
// list it.
export function lookupLicensee(
  service: Service,
  callsign: string,
  files: { [name: string]: string[] },
): Licensee | null {
  if (DEMO_CALLSIGNS[callsign] === service.id) {
    return demoLicensee(service);
  }

  return service.format === "ised-delim"
    ? lookupIsed(service, callsign, files)
    : lookupFcc(service, callsign, files);
}
