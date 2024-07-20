import React from 'react';

interface SuccessTextProps {
  txHash: string | null;
}

const SuccessText: React.FC<SuccessTextProps> = ({ txHash }) => {
  return (
    <div className="border rounded m-2">
      <h3 className="text-lg font-semibold dark-text">Transaction Successful!</h3>
      <br />
      <h5 className="text-md font-semibold dark-text">
        Waiting For The Transaction To Get On-Chain <br />
        <a
          href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="medium-text blue-text-hover"
        >
          View The Transaction
        </a>
      </h5>
    </div>
  );
};

export default SuccessText;
