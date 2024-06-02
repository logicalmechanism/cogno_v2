import React from 'react';

interface SuccessTextProps {
  txHash: string | null;
}

const SuccessText: React.FC<SuccessTextProps> = ({ txHash }) => {
  return (
    <div className="border rounded my-1">
      <h3 className="text-lg font-semibold text-gray-800">Transaction Successful!</h3>
      <br />
      <h5 className="text-md font-semibold text-gray-800">Click Refresh Cogno</h5>
      <br />
      <a
        href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-700">
        View Transaction
      </a>
    </div>
  );
};

export default SuccessText;
