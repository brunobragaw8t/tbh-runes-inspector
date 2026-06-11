import { SAVE_PASSWORD } from "@/constants/save-password";

export async function decryptES3(file: ArrayBuffer): Promise<unknown> {
  const bytes = new Uint8Array(file);

  if (bytes.length <= 16) {
    throw new Error("File too small to be an .es3 save");
  }

  const iv = bytes.subarray(0, 16);
  const encrypted = bytes.subarray(16);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SAVE_PASSWORD),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: iv, iterations: 100, hash: "SHA-1" },
    keyMaterial,
    { name: "AES-CBC", length: 128 },
    false,
    ["decrypt"],
  );

  const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, encrypted);
  const text = new TextDecoder().decode(decrypted);
  const json = JSON.parse(text) as unknown;

  return json;
}
