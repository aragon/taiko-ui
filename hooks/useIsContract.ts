import { isContract } from "@/utils/evm";
import { useEffect, useState } from "react";
import { Address, PublicClient } from "viem";

export function useIsContract(address?: Address, publicClient?: PublicClient) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const [addressIsContract, setAddressIsContract] = useState<boolean | null>(null);

  useEffect(() => {
    if (!address || !publicClient) return;

    setIsLoading(true);
    setError(undefined);

    isContract(address, publicClient)
      .then((result) => {
        setAddressIsContract(result);

        setIsLoading(false);
        setError(undefined);
      })
      .catch((err) => {
        setAddressIsContract(false);
        setIsLoading(false);
        setError(err);
      });
  }, [address, publicClient]);

  return {
    isLoading,
    error,
    isContract: addressIsContract,
  };
}
