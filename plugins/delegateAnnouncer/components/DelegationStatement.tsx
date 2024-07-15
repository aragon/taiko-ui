// import { proseClasses } from "@/features/proposals";
import { CardCollapsible, DocumentParser, Heading } from "@aragon/ods";
import React from "react";

interface IDelegationStatementProps {
  message: string | undefined;
}

export const DelegationStatement: React.FC<IDelegationStatementProps> = ({ message }) => {
  if (!message) return;

  return (
    <>
      <Heading size="h2">Delegation statement</Heading>
      <CardCollapsible
        buttonLabelClosed="Read more"
        buttonLabelOpened="Read less"
        collapsedSize="md"
        className="shadow-neutral"
      >
        <DocumentParser document={message} />
      </CardCollapsible>
    </>
  );
};
