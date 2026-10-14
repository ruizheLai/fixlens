export interface RenterIdentity { name: string; email: string | null; phone: string | null }
export interface DemoPersona extends RenterIdentity { firstName: string; initials: string; email: string; phone: string }

// Version 1 exhibition labels. Keep order/algorithm stable: existing cases store
// the session ID, and authorized PM reads derive the same identity from that ID.
const firstNames = "Alex Jordan Casey Taylor Morgan Riley Avery Jamie Cameron Quinn Hayden Parker Rowan Finley Reese Bailey Charlie Dakota Emerson Skyler Sage River Sidney Robin Drew Devon Ellis Frankie Harper Jules Kai Kendall Lane Logan Marley Micah Noel Oakley Peyton Remy Rory Sam Shiloh Spencer Sydney Terry Tristan Wesley Adrian Ashton Blair Eden Elliot Emery Jaden Jesse Kennedy Lee Lennox Milan Phoenix Ryan Sasha".split(" ");
const lastNames = "Taylor Parker Morgan Bennett Brooks Carter Davis Ellis Foster Gray Hayes James Kelly Lane Miller Nelson Owen Perry Reed Scott Turner Walker Young Adams Baker Bell Blake Brown Clark Cole Collins Cooper Evans Fisher Ford Green Hall Harris Hill Howard Hughes Jackson King Lewis Marshall Mason Moore Morris Murphy Palmer Phillips Price Quinn Roberts Ross Shaw Smith Stone Sullivan Thomas Ward West White Wilson Woods".split(" ");

export function demoPersona(sessionId: string): DemoPersona {
  if (!sessionId) throw new Error("Demo session required");
  let hash = 2166136261;
  for (const char of sessionId.toLowerCase()) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  hash >>>= 0;
  const firstName = firstNames[hash % firstNames.length];
  const lastName = lastNames[(hash >>> 6) % lastNames.length];
  const middle = String.fromCharCode(65 + (hash >>> 12) % 26);
  return { firstName, name: `${firstName} ${middle}. ${lastName}`, initials: firstName[0] + lastName[0],
    email: `${firstName}.${middle}.${lastName}@example.com`.toLowerCase(), phone: "Not provided (Demo)" };
}

export function caseRenterIdentity(sessionId: string | null | undefined, historical: RenterIdentity | null): RenterIdentity | null {
  return sessionId ? demoPersona(sessionId) : historical;
}
