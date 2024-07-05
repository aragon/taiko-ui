import DelegationPage from "./pages/index";
// import DelegateProfile from "./pages/DelegateProfile";
import { useUrl } from "@/hooks/useUrl";
import { NotFound } from "@/components/not-found";

export default function PluginPage() {
  // Select the inner pages to display depending on the URL hash
  const { hash } = useUrl();

  if (!hash || hash === "#/") return <DelegationPage />;
  // else if (hash.startsWith("#/delegates/")) {
  //   const id = hash.replace("#/delegates/", "");
  //   return <DelegateProfile id={id} />;
  // }

  // Default not found page
  return <NotFound />;
}
