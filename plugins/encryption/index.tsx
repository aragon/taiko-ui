import EncryptionPage from "./pages/index";
import { useUrl } from "@/hooks/useUrl";
import { NotFound } from "@/components/not-found";
// import { Address } from "viem";

export default function PluginPage() {
  // Select the inner pages to display depending on the URL hash
  const { hash } = useUrl();

  if (!hash || hash === "#/") return <EncryptionPage />;
  // else if (hash.startsWith("#/delegates/")) {
  //   const address = hash.replace("#/delegates/", "") as Address;
  //   return <></>;
  // }

  // Default not found page
  return <NotFound />;
}
