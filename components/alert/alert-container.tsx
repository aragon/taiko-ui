import { FC } from "react";
import { useAlertContext } from "@/context/AlertContext";
import { AlertCard, AlertVariant, Icon, IconType } from "@aragon/ods";
import { IAlert } from "@/utils/types";

const AlertContainer: FC = () => {
  const { alerts } = useAlertContext();

  return (
    <div className="fixed bottom-0 right-0 w-96 m-10">
      {alerts.map((alert: IAlert) => (
        <AlertCard
          className="mt-4 drop-shadow-lg"
          key={alert.id}
          message={alert.message}
          description={resolveDescription(alert)}
          variant={resolveVariant(alert.type)}
        />
      ))}
    </div>
  );
};

function resolveVariant(type: IAlert["type"]) {
  let result: AlertVariant;
  switch (type) {
    case "error":
      result = "critical";
      break;
    default:
      result = type;
  }
  return result;
}

function resolveDescription(alert: IAlert) {
  if (!alert.explorerLink) {
    return <div className="">{alert.description}</div>;
  }

  return (
    <>
      <div className="">{alert.description}</div>
      <a href={alert.explorerLink} target="_blank">
        <div className="flex flex-row text-xs underline text-primary-200">
          <div className="">Show transaction</div>
          <div>
            <Icon
              className="ml-2 mt-1"
              size="sm"
              icon={IconType.LINK_EXTERNAL}
            />
          </div>
        </div>
      </a>
    </>
  );
}

export default AlertContainer;
