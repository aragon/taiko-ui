import { compactNumber } from "@/utils/numbers";
import { FC, ReactNode } from "react";

interface VoteTallyProps {
  approvalCount: number;
  approvalPercentage: number;
}

const ApprovalTally: FC<VoteTallyProps> = ({ approvalCount, approvalPercentage }) => (
  <Card>
    <div className="space-between flex flex-row pb-2">
      <p className={`flex-grow text-xl font-semibold text-primary-500`}>Approved</p>
      <p className="text-xl font-semibold">{compactNumber(approvalCount)}</p>
    </div>
    <div className={`h-4 w-full rounded bg-primary-100`}>
      <div className={`h-4 rounded bg-primary-700`} style={{ width: `${Math.min(approvalPercentage, 100)}%` }} />
    </div>
  </Card>
);

// This should be encapsulated as soon as ODS exports this widget
const Card = function ({ children }: { children: ReactNode }) {
  return (
    <div
      className="box-border flex w-full flex-col space-y-6 rounded-xl
    border border-neutral-100 bg-neutral-0
    p-4 xl:p-6"
    >
      {children}
    </div>
  );
};

export default ApprovalTally;
