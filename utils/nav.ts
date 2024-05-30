import { type IBreadcrumbsLink } from "@aragon/ods";

export function generateBreadcrumbs(pathname: string): IBreadcrumbsLink[] {
  const paths = pathname.split("/").filter(Boolean);
  let pathAccumulator = "";

  return paths.map((path) => {
    pathAccumulator += `/${path}`;
    return {
      label: capitalizeFirstLetter(path),
      href: pathAccumulator,
    };
  });
}

function capitalizeFirstLetter(str: string) {
  if (!str) return str; // Return the original string if it's empty or undefined
  return str.charAt(0).toUpperCase() + str.slice(1);
}
