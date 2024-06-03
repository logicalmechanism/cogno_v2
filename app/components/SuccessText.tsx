import React from 'react';

interface SuccessTextProps {
  txHash: string | null;
}

const SuccessText: React.FC<SuccessTextProps> = ({ txHash }) => {
  return (
    <div className="border rounded my-1">
      <h3 className="text-lg font-semibold text-gray-800">Transaction Successful!</h3>
      <br />
      <h5 className="text-md font-semibold text-gray-800">
        Wait For The Transaction To Get On-Chain Then Click Refresh Cogno<br />Or<br />Track The Status By<br/>
        <a
        href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-700">
        Viewing The Transaction
      </a>
      </h5>
    </div>
  );
};

export default SuccessText;
