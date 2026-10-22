// The FCC ULS radio services this project issues passes for.
//
// Both services publish a weekly complete-database archive with identical
// EN.dat (entity) and HD.dat (license) layouts, so the only things that differ
// per service are the archive to pull, where its files live in the data bucket,
// which call signs belong to it, and how the pass reports the license.

export type ServiceId = "amateur" | "gmrs";

export interface Service {
  id: ServiceId;
  // Weekly complete-database archive from FCC ULS.
  url: string;
  // The .dat entries worth keeping out of that archive.
  files: string[];
  // Key prefix for this service's objects in the data bucket. Amateur is
  // unprefixed so the objects already in the bucket keep working.
  prefix: string;
  // Call sign formats the FCC assigns to this service.
  callsignRegex: RegExp;
  // Label for the pass's secondary field.
  privilegesLabel: string;
  // Value for that field when the service has no license class to report.
  privilegesValue?: string;
  // Pass description, read by VoiceOver and shown in Wallet's pass list.
  description: string;
}

// Call signs are matched against these in order. The two formats cannot
// collide: amateur call signs end in letters (K1ABC) and GMRS call signs end
// in digits (WRAB123), so a call sign identifies its own service.
export const SERVICES: Service[] = [
  {
    id: "amateur",
    url: "https://data.fcc.gov/download/pub/uls/complete/l_amat.zip",
    files: ["EN.dat", "HD.dat", "AM.dat"],
    prefix: "",
    callsignRegex: /^(?:[KNWM]|A[A-L]|[KNW][A-Z])[0-9][A-Z]{1,3}$/,
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
    // Current call signs are four letters and three digits (WRAB123); the
    // legacy KA-series licenses still in the data are three and four
    // (KAF3550).
    callsignRegex: /^(?:[A-Z]{4}[0-9]{3}|[A-Z]{3}[0-9]{4})$/,
    privilegesLabel: "SERVICE",
    privilegesValue: "GMRS",
    description: "FCC GMRS License.",
  },
];

// Resolve the service a call sign belongs to, or undefined if it is not a
// valid call sign for any service we handle.
export function serviceForCallsign(callsign: string): Service | undefined {
  return SERVICES.find((service) => service.callsignRegex.test(callsign));
}
