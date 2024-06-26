import { ReactNode } from "react";
import dayjs from "dayjs";

interface ProposalDetailsProps {
  minVetoRatio?: number;
  snapshotTimestamp?: bigint;
}

const ProposalDetails: React.FC<ProposalDetailsProps> = ({ minVetoRatio, snapshotTimestamp }) => {
  return (
    <>
      <Card>
        <h2 className="flex-grow pr-6 text-xl font-semibold text-neutral-600">Minimum veto ratio</h2>
        <div className="items-right flex-wrap text-right">
          <span className="text-xl font-semibold">{minVetoRatio ? (minVetoRatio / 10000).toFixed(2) : null}%</span>{" "}
        </div>
      </Card>
      <Card>
        <h2 className="flex-grow pr-6 text-xl font-semibold text-neutral-600">Snapshot</h2>
        <div className="items-right flex-wrap text-right">
          <p className="text-neutral-600">Taken on</p>
          <span className="mr-2 text-xl font-semibold">
            {dayjs(Number(snapshotTimestamp) * 1000).format("D MMM YYYY HH:mm")}h
          </span>
        </div>
      </Card>
    </>
  );
};

// This should be encapsulated as soon as ODS exports this widget
const Card = function ({ children }: { children: ReactNode }) {
  return (
    <div
      className="box-border flex w-full flex-col space-y-6 rounded-xl
    border border-neutral-100 bg-neutral-0
    p-4 focus:outline-none focus:ring
    focus:ring-primary xl:p-6"
    >
      {children}
    </div>
  );
};

export default ProposalDetails;
