import { Button, IllustrationHuman } from "@aragon/ods";

export const MissingContentView = ({
  message,
  callToAction,
  onClick,
  isLoading,
}: {
  message: string;
  callToAction?: string;
  onClick?: () => any;
  isLoading?: boolean;
}) => {
  if (!callToAction) {
    return (
      <div className="w-full">
        <p className="text-md text-neutral-400">{message}</p>
        <Illustration />
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-md text-neutral-400">{message}</p>
      <Illustration />
      <div className="flex justify-center">
        <Button size="md" variant="primary" isLoading={!!isLoading} onClick={onClick ? onClick : () => {}}>
          <span>{callToAction}</span>
        </Button>
      </div>
    </div>
  );
};

function Illustration() {
  return <IllustrationHuman className="mx-auto mb-10 max-w-96" body="BLOCKS" expression="SMILE_WINK" hairs="CURLY" />;
}
