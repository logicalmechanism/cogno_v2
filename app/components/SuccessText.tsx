import React from "react";
import ExternalLink from "./ExternalLink";

interface SuccessTextProps {
  txHash: string | null;
}

const SuccessText: React.FC<SuccessTextProps> = ({ txHash }) => {
  if (!txHash) {
    return null;
  }

  return (
    <div className="border rounded m-2 p-4">
      <h3 className="text-lg font-semibold dark-text">
        Transaction Successful!
      </h3>
      <p className="text-md font-semibold dark-text mt-2">
        Waiting For The Transaction To Get On-Chain
      </p>
      <ExternalLink
        href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
        className="dark-text blue-text-hover mt-2 inline-block"
      >
        View The Transaction
      </ExternalLink>
    </div>
  );
};

export default SuccessText;
