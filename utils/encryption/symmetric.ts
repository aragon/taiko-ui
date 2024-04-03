import sodium from "libsodium-wrappers";
import { concatenate } from "./util";

const SYM_KEY_LENGTH = 32;

export function encrypt(
  message: string | Uint8Array,
  symmetricKey: Uint8Array
) {
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  return concatenate([
    nonce,
    sodium.crypto_secretbox_easy(message, nonce, symmetricKey),
  ]);
}

export function decryptString(
  nonce_and_ciphertext: Uint8Array,
  symmetricKey: Uint8Array
) {
  const minLength =
    sodium.crypto_secretbox_NONCEBYTES + sodium.crypto_secretbox_MACBYTES;
  if (nonce_and_ciphertext.length < minLength) {
    throw "Invalid encrypted payload";
  }

  const nonce = nonce_and_ciphertext.slice(
    0,
    sodium.crypto_secretbox_NONCEBYTES
  );
  const ciphertext = nonce_and_ciphertext.slice(
    sodium.crypto_secretbox_NONCEBYTES
  );

  return sodium.crypto_secretbox_open_easy(
    ciphertext,
    nonce,
    symmetricKey,
    "text"
  );
}

export function decryptBytes(
  nonce_and_ciphertext: Uint8Array,
  symmetricKey: Uint8Array
) {
  const minLength =
    sodium.crypto_secretbox_NONCEBYTES + sodium.crypto_secretbox_MACBYTES;
  if (nonce_and_ciphertext.length < minLength) {
    throw "Invalid encrypted payload";
  }

  const nonce = nonce_and_ciphertext.slice(
    0,
    sodium.crypto_secretbox_NONCEBYTES
  );
  const ciphertext = nonce_and_ciphertext.slice(
    sodium.crypto_secretbox_NONCEBYTES
  );

  return sodium.crypto_secretbox_open_easy(
    ciphertext,
    nonce,
    symmetricKey,
    "uint8array"
  );
}

// Key helpers

export function generateSymmetricKey(size: number = SYM_KEY_LENGTH) {
  return sodium.randombytes_buf(size, "uint8array");
}
