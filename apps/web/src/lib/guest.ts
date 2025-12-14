export type GuestIdentity = {
  guestId: string;
  guestName: string;
};

const GUEST_ID_KEY = "thinkinghat_guest_id";
const GUEST_NAME_KEY = "thinkinghat_guest_name";

function randomId() {
  // Prefer UUID when available.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `guest_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function getOrCreateGuestIdentity(): GuestIdentity {
  if (typeof window === "undefined") {
    return { guestId: "guest_ssr", guestName: "Guest" };
  }

  const existingId = window.localStorage.getItem(GUEST_ID_KEY);
  const existingName = window.localStorage.getItem(GUEST_NAME_KEY);

  const guestId = existingId ?? randomId();
  if (!existingId) window.localStorage.setItem(GUEST_ID_KEY, guestId);

  const guestName = existingName ?? `Guest${guestId.slice(0, 4).toUpperCase()}`;
  if (!existingName) window.localStorage.setItem(GUEST_NAME_KEY, guestName);

  return { guestId, guestName };
}

export function setGuestName(nextName: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_NAME_KEY, nextName);
}


