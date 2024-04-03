import sodium, { KeyPair } from "libsodium-wrappers";
export type { KeyPair } from "libsodium-wrappers";

export function encrypt(
  message: string | Uint8Array,
  recipientPubKey: Uint8Array
) {
  return sodium.crypto_box_seal(message, recipientPubKey, "uint8array");
}

export function decryptString(ciphertext: Uint8Array, keyPair: KeyPair) {
  return sodium.crypto_box_seal_open(
    ciphertext,
    keyPair.publicKey,
    keyPair.privateKey,
    "text"
  );
}

export function decryptBytes(
  ciphertext: Uint8Array,
  keyPair: KeyPair
): Uint8Array {
  return sodium.crypto_box_seal_open(
    ciphertext,
    keyPair.publicKey,
    keyPair.privateKey,
    "uint8array"
  );
}

// Key management

export function generateKeyPair() {
  return sodium.crypto_box_keypair();
}

export function getSeededKeyPair(hexSeed: string) {
  if (!hexSeed.match(/^[0-9a-fA-F]+$/)) {
    throw new Error("Invalid hexadecimal seed");
  } else if (hexSeed.length % 2 !== 0) {
    throw new Error("The hexadecimal seed cannot have an odd length");
  }
  const bytesSeed = sodium.from_hex(hexSeed);
  return sodium.crypto_box_seed_keypair(bytesSeed);
}

export function computePublicKey(secretKey: Uint8Array) {
  return sodium.crypto_scalarmult_base(secretKey);
}
