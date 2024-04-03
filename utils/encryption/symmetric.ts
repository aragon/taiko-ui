import sodium from "libsodium-wrappers";
import { concatenate } from "./util";

export function getSymKey() {
  return sodium.from_hex(
    "724b092810ec86d7e35c9d067702b31ef90bc43a7b598626749914d6a3e033ed"
  );
}

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

  return sodium.crypto_secretbox_open_easy(ciphertext, nonce, symmetricKey);
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
    "text"
  );
}
