import { PUB_IPFS_ENDPOINT, PUB_PINATA_JWT } from "@/constants";
import { Hex, fromHex, toBytes } from "viem";
import { CID } from "multiformats/cid";
import * as raw from "multiformats/codecs/raw";
import { sha256 } from "multiformats/hashes/sha2";

export function fetchJsonFromIpfs(ipfsUri: string) {
  return fetchFromIPFS(ipfsUri).then((res) => res.json());
}

export async function uploadToPinata(strBody: string) {
  const blob = new Blob([strBody], { type: "text/plain" });
  const file = new File([blob], "metadata.json");
  const data = new FormData();
  data.append("file", file);
  data.append("pinataMetadata", JSON.stringify({ name: "metadata.json" }));
  data.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PUB_PINATA_JWT}`,
    },
    body: data,
  });

  const resData = await res.json();

  if (resData.error) throw new Error("Request failed: " + resData.error);
  else if (!resData.IpfsHash) throw new Error("Could not pin the metadata");
  return "ipfs://" + resData.IpfsHash;
}

export async function getContentCid(strMetadata: string) {
  const bytes = raw.encode(toBytes(strMetadata));
  const hash = await sha256.digest(bytes);
  const cid = CID.create(1, raw.code, hash);
  return "ipfs://" + cid.toV1().toString();
}

async function fetchFromIPFS(ipfsUri: string): Promise<Response> {
  if (!ipfsUri) throw new Error("Invalid IPFS URI");
  else if (ipfsUri.startsWith("0x")) {
    // fallback
    ipfsUri = fromHex(ipfsUri as Hex, "string");

    if (!ipfsUri) throw new Error("Invalid IPFS URI");
  }

  const path = resolvePath(ipfsUri);
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 800);
  const response = await fetch(`${PUB_IPFS_ENDPOINT}/${path}`, {
    method: "GET",
    signal: controller.signal,
  });
  clearTimeout(id);
  if (!response.ok) {
    throw new Error("Could not connect to the IPFS endpoint");
  }
  return response; // .json(), .text(), .blob(), etc.
}

function resolvePath(uri: string) {
  const path = uri.includes("ipfs://") ? uri.substring(7) : uri;
  return path;
}
