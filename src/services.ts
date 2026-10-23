// The radio services this project issues passes for.
//
// The two FCC services publish a weekly complete-database archive with
// identical EN.dat (entity) and HD.dat (license) layouts. ISED publishes one
// semicolon-delimited file for Canada, rebuilt daily, so a service differs in
// how its data is laid out as well as which archive to pull, where its files
// live in the data bucket, which call signs belong to it, and how the pass
// reports the license.

export type ServiceId = "amateur" | "gmrs" | "canada";

// Layout of a service's bulk data, which decides how it is parsed.
export type ServiceFormat = "fcc-uls" | "ised-delim";

export interface Service {
  id: ServiceId;
  // Complete-database archive published by the licensing authority.
  url: string;
  // The entries worth keeping out of that archive.
  files: string[];
  // Key prefix for this service's objects in the data bucket. Amateur is
  // unprefixed so the objects already in the bucket keep working.
  prefix: string;
  // Layout of the files above.
  format: ServiceFormat;
  // Call sign formats the authority assigns to this service.
  callsignRegex: RegExp;
  // Format of the address code that stands in for proof the request came from
  // the license holder, checked after normalizePostal.
  postalRegex: RegExp;
  // What to call that code in the UI, and how long it can be.
  postalLabel: string;
  postalMaxLength: number;
  // Authority to name when the code does not match.
  authority: string;
  // Label for the pass's secondary field.
  privilegesLabel: string;
  // Value for that field when the service has no license class to report.
  privilegesValue?: string;
  // Pass description, read by VoiceOver and shown in Wallet's pass list.
  description: string;
}

// Call signs are matched against these in order. The three formats cannot
// collide: FCC amateur call signs end in letters (K1ABC), GMRS call signs end
// in digits (WRAB123), and Canadian call signs start with a V prefix the FCC
// does not issue (VE3ABC), so a call sign identifies its own service.
export const SERVICES: Service[] = [
  {
    id: "amateur",
    url: "https://data.fcc.gov/download/pub/uls/complete/l_amat.zip",
    files: ["EN.dat", "HD.dat", "AM.dat"],
    prefix: "",
    format: "fcc-uls",
    callsignRegex: /^(?:[KNWM]|A[A-L]|[KNW][A-Z])[0-9][A-Z]{1,3}$/,
    postalRegex: /^[0-9]{5}$/,
    postalLabel: "ZIP Code",
    postalMaxLength: 5,
    authority: "FCC",
    privilegesLabel: "PRIVILEGES",
    description: "FCC Amateur Radio License.",
  },
  {
    id: "gmrs",
    url: "https://data.fcc.gov/download/pub/uls/complete/l_gmrs.zip",
    // GMRS has one license class and no exam, so its archive ships no AM.dat
    // and there is no operator class to look up.
    files: ["EN.dat", "HD.dat"],
    prefix: "gmrs/",
    format: "fcc-uls",
    // Current call signs are four letters and three digits (WRAB123); the
    // legacy KA-series licenses still in the data are three and four
    // (KAF3550).
    callsignRegex: /^(?:[A-Z]{4}[0-9]{3}|[A-Z]{3}[0-9]{4})$/,
    postalRegex: /^[0-9]{5}$/,
    postalLabel: "ZIP Code",
    postalMaxLength: 5,
    authority: "FCC",
    privilegesLabel: "SERVICE",
    privilegesValue: "GMRS",
    description: "FCC GMRS License.",
  },
  {
    id: "canada",
    url: "https://apc-cap.ic.gc.ca/datafiles/amateur_delim.zip",
    // One row per call sign, so there is nothing to join.
    files: ["amateur_delim.txt"],
    prefix: "canada/",
    format: "ised-delim",
    // ISED issues VA, VE, VO and VY to amateurs, always with a two or three
    // letter suffix. Special event call signs live in a separate file this
    // project does not read.
    callsignRegex: /^V[AEOY][0-9][A-Z]{2,3}$/,
    postalRegex: /^[A-Z][0-9][A-Z][0-9][A-Z][0-9]$/,
    postalLabel: "Postal Code",
    postalMaxLength: 6,
    authority: "ISED",
    // Canada grants independent qualifications rather than a license class;
    // the pass reports the highest one held.
    privilegesLabel: "QUALIFICATION",
    description: "ISED Amateur Radio Certificate.",
  },
];

// Resolve the service a call sign belongs to, or undefined if it is not a
// valid call sign for any service we handle.
export function serviceForCallsign(callsign: string): Service | undefined {
  return SERVICES.find((service) => service.callsignRegex.test(callsign));
}

// Whether this service's address code is digits only, which lets a phone open
// the numeric keypad. Unknown services get the full keyboard rather than one
// that cannot type half of what they might need.
export function postalIsNumeric(service: Service | undefined): boolean {
  return service !== undefined && service.format === "fcc-uls";
}

// Drop characters the authority's address code cannot contain, so the input
// never holds something that could not become valid. Before a call sign
// resolves to a service, both formats are allowed rather than silently eating
// what someone has started typing.
export function sanitizePostal(
  service: Service | undefined,
  value: string,
): string {
  const allowed =
    !service || service.format === "ised-delim" ? /[^0-9A-Z]/g : /[^0-9]/g;
  return value
    .toUpperCase()
    .replace(allowed, "")
    .slice(0, service ? service.postalMaxLength : 6);
}

// Normalize an address code so the same value typed either way compares equal.
// Canadian postal codes are written with or without the middle space, and the
// published data holds a few dozen records where O was typed for 0 (or I for
// 1) in a digit position, so each half of the pair is coerced to the shape
// Canada Post uses. Shared with the browser so client and server agree.
export function normalizePostal(service: Service, value: string): string {
  const raw = value.toUpperCase().replace(/[\s-]/g, "");

  if (service.format !== "ised-delim" || raw.length !== 6) {
    return raw;
  }

  // A1A1A1: even positions are letters, odd positions are digits.
  const asDigit: { [char: string]: string } = { O: "0", I: "1" };
  const asLetter: { [char: string]: string } = { "0": "O", "1": "I" };
  return raw
    .split("")
    .map((char, i) =>
      i % 2 === 1 ? (asDigit[char] ?? char) : (asLetter[char] ?? char),
    )
    .join("");
}
