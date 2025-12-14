const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // skip I,O,0,1

export function generateRoomCode(length = 5): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * ALPHABET.length);
    out += ALPHABET[idx];
  }
  return out;
}


