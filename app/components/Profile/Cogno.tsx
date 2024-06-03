import React, { useState, useEffect } from 'react';
import { BrowserWallet, UTxO } from '@meshsdk/core';
import { parseDatumCbor } from '@meshsdk/mesh-csl';
import { handleCognoTransaction } from './transaction';
import BlurImage from '../BlurImage';
import Notification from '../Notification';
import SuccessText from '../SuccessText';
import { hexToString } from '../utilities';
import { MaestroProvider } from '@meshsdk/core';

interface CognoProps {
  network: number | null;
  wallet: BrowserWallet;
  cogno: UTxO | null;
  refreshCogno: () => void; // Function to refresh Cogno
}

const Cogno: React.FC<CognoProps> = ({ network, wallet, cogno, refreshCogno }) => {
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [details, setDetails] = useState('');
  const [notification, setNotification] = useState<string>('');
  const [showSuccessLink, setShowSuccessLink] = useState(false);
  const [submittedTxHash, setSubmittedTxHash] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearNotification = () => setNotification('');

  useEffect(() => {
    if (cogno) {
      const datum = parseDatumCbor(cogno.output.plutusData!)
      setTitle(hexToString(datum.fields[1].fields[0].bytes) || '');
      setImage(hexToString(datum.fields[1].fields[1].bytes) || '');
      setDetails(hexToString(datum.fields[1].fields[2].bytes) || '');
    }
  }, [cogno]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const checkTransaction = (network: number, message: string) => {
    const networkName = network === 0 ? 'Preprod' : 'Mainnet';
      const maestro = new MaestroProvider({ network: networkName, apiKey: process.env.NEXT_PUBLIC_MAESTRO!, turboSubmit: false });

      const retryDelay = 5000; // 5 seconds
      const maxRetries = 15;

      const navigateWithRetry = async (retryCount = 0): Promise<void> => {
        try {
          setNotification('Transaction Is On-Chain');
          refreshCogno();
          setTitle('');
          setImage('');
          setDetails('');
          setSubmittedTxHash('');
          setShowSuccessLink(false);
        } catch (error) {
          if (retryCount < maxRetries) {
            setTimeout(() => navigateWithRetry(retryCount + 1), retryDelay);
          } else {
            console.error(`Failed to navigate to /forum after ${maxRetries} attempts.`, error);
          }
        }
      };

      maestro.onTxConfirmed(message, async () => {
        await navigateWithRetry();
      });
  };

  const handleDelete = async () => {
    setEditMode(false);
    setSubmittedTxHash('');
    setShowSuccessLink(false);
    const result = await handleCognoTransaction(network, wallet, cogno, { title, image, details }, true);
    if (result.success === false) {
      // something failed so notify the user of the error message
      setNotification(result.message);
    } else {
      // the transaction was submitted and we need to show the success modal
      setSubmittedTxHash(result.message);
      setShowSuccessLink(true);
      // this is where the actual sc interaction will be
      checkTransaction(network!, result.message);
    }
  };

  const handleSubmit = async () => {
    setEditMode(false);
    setSubmittedTxHash('');
    setShowSuccessLink(false);
    setIsSubmitting(true);
    const result = await handleCognoTransaction(network, wallet, cogno, { title, image, details }, false);
    if (result.success === false) {
      // something failed so notify the user of the error message
      setNotification(result.message);
      setIsSubmitting(false);
    } else {
      // the transaction was submitted and we need to show the success modal
      setSubmittedTxHash(result.message);
      setShowSuccessLink(true);
      // this is where the actual sc interaction will be
      checkTransaction(network!, result.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-1 bg-white shadow-md rounded-md items-center">
      {showSuccessLink && <SuccessText txHash={submittedTxHash}/>}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Name</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={(!editMode && cogno !== null) || isSubmitting}
            autoComplete="off"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">Image URL</label>
          <input
            id="image"
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={!editMode && cogno !== null}
            autoComplete="off"
          />
          {cogno && image !== '' &&
            (
              <div className=''>
                <p className="block text-gray-700 text-sm font-bold my-2">Image Preview</p>
                <BlurImage imageUrl={image} />
              </div>
            )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="details">Details</label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={!editMode && cogno !== null}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col items-center justify-between">
          {cogno ? (
            <button
              type="button"
              onClick={handleEdit}
              className={`bg-blue-200 hover:bg-sky-400 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${editMode ? 'hidden' : ''}`}
            >
              Edit
            </button>
          ) : (
            <button
              type="submit"
              className="bg-green-200 hover:bg-teal-400 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isSubmitting}
            >
              Create Cogno
            </button>
          )}
          {editMode && cogno && (
            <div>
              <button
                type="submit"
                className="bg-blue-200 hover:bg-sky-400 text-black font-bold py-2 px-4 mx-1 rounded focus:outline-none focus:shadow-outline"
                disabled={isSubmitting}
              >
                Update Cogno
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-200 hover:bg-rose-400 text-black font-bold py-2 px-4 mx-1 rounded focus:outline-none focus:shadow-outline"
                disabled={isSubmitting}
              >
                Delete Cogno
              </button>
            </div>
          )}
        </div>
      </form>
      {notification && <Notification message={notification} onDismiss={clearNotification} />}
    </div>
  );
};

export default Cogno;
