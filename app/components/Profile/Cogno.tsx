import React, { useState, useEffect } from 'react';
import { BrowserWallet, UTxO } from '@meshsdk/core';
import { parseDatumCbor } from '@meshsdk/mesh-csl';
import { handleCognoTransaction } from './transaction';
import BlurImage from '../BlurImage';
import Notification from '../Notification';
import SuccessText from '../SuccessText';
import { hexToString } from '../utilities';
import { MaestroProvider } from '@meshsdk/core';
import { BytesField } from './transaction';
import Moderation from './Moderation';

interface CognoProps {
  network: number | null;
  wallet: BrowserWallet;
  cogno: UTxO | null;
  refreshCogno: () => void; // Function to refresh Cogno
  onClose: () => void; // function to close the profile modal
}

const Cogno: React.FC<CognoProps> = ({ network, wallet, cogno, refreshCogno, onClose }) => {
  const [editMode, setEditMode] = useState(false);
  // profile info from the cogno utxo
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [details, setDetails] = useState('');
  // states for updating and dispalying
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

    const maxRetries = 250;

    maestro.onTxConfirmed(message, async () => {
      refreshCogno();
      setNotification('transaction is on-chain');
      setTitle('');
      setImage('');
      setDetails('');
      setSubmittedTxHash('');
      setShowSuccessLink(false);
      setIsSubmitting(false);
    }, maxRetries);
 
  };

  const handleDelete = async () => {
    setEditMode(false);
    setSubmittedTxHash('');
    setShowSuccessLink(false);
    const result = await handleCognoTransaction(network, wallet, cogno, { title, image, details}, true);
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
    const result = await handleCognoTransaction(network, wallet, cogno, { title, image, details}, false);
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
    <div className="max-w-lg mx-auto py-1 light-bg rounded items-center">
      {showSuccessLink && <SuccessText txHash={submittedTxHash}/>}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div className="mb-2">
          <label className="block dark-text text-sm font-bold mb-2" htmlFor="title">Name</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="appearance-none border rounded w-full py-2 px-3 dark-text text-center"
            disabled={(!editMode && cogno !== null) || isSubmitting}
            autoComplete="off"
            maxLength={300}
            required
          />
        </div>
        <div className="mb-2">
          <label className="block dark-text text-sm font-bold mb-2" htmlFor="image">Image URL</label>
          <input
            id="image"
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="appearance-none border rounded w-full py-2 px-3 dark-text"
            disabled={(!editMode && cogno !== null) || isSubmitting}
            autoComplete="off"
            maxLength={2048}
          />
          {cogno && image !== '' &&
            (
              <div className=''>
                <p className="block dark-text text-sm font-bold my-2">Image Preview</p>
                <BlurImage imageUrl={image} />
              </div>
            )}
        </div>
        <div className="mb-2">
          <label className="block dark-text text-sm font-bold mb-2" htmlFor="details">Details</label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="appearance-none border rounded w-full py-2 px-3 dark-text"
            disabled={(!editMode && cogno !== null) || isSubmitting}
            autoComplete="off"
            maxLength={40000}
          />
        </div>
        <div className="flex flex-col items-center justify-between">
          {cogno ? (
            <button
              type="button"
              onClick={handleEdit}
              className={`blue-bg blue-bg-hover dark-text font-bold py-2 px-4 rounded ${editMode ? 'hidden' : ''}`}
            >
              Edit
            </button>
          ) : (
            <button
              type="submit"
              className="green-bg green-bg-hover dark-text font-bold py-2 px-4 rounded"
              disabled={isSubmitting}
            >
              Create Cogno
            </button>
          )}
          {editMode && cogno && (
            <div>
              <button
                type="submit"
                className="blue-bg blue-bg-hover dark-text font-bold py-2 px-4 mx-1 rounded"
                disabled={isSubmitting}
              >
                Update Cogno
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="red-bg red-bg-hover dark-text font-bold py-2 px-4 mx-1 rounded"
                disabled={isSubmitting}
              >
                Delete Cogno
              </button>
            </div>
          )}
        </div>
        <div><p className='mt-2 dark-text flex flex-col items-center justify-between'>Moderation Settings Are Saved On-Chain By Updating</p></div>
        <Moderation/>
        <button
            type='button'
            onClick={onClose}
            className="blue-bg blue-bg-hover dark-text font-bold py-2 px-4 rounded"
          >
            Close
          </button>
      </form>
      {notification && <Notification message={notification} onDismiss={clearNotification} />}
    </div>
  );
};

export default Cogno;
