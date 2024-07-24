import NextLink from "next/link";
import { ComponentProps } from "react";

const CustomLink: React.FC<ComponentProps<"a">> = ({ href = {}, ...otherProps }) => (
  <NextLink href={href} {...otherProps} />
);

export const odsCoreProviderValues = { Link: CustomLink };
