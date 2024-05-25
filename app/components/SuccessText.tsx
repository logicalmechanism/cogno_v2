import React from 'react';

interface SuccessTextProps {
  txHash: string | null;
}

const SuccessText: React.FC<SuccessTextProps> = ({ txHash }) => {
  return (
    <div className="">
      <h3 className="text-lg font-semibold text-gray-800">Transaction Successful!</h3>
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
