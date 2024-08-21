import React, { useEffect, useState, FC } from 'react';
import { BrowserWallet, UTxO, MaestroProvider } from '@meshsdk/core';
import { parseDatumCbor } from '@meshsdk/mesh-csl';
import { hexToString } from '../utilities';
import { CloseButton } from "./CloseButton";
import { ActionButton } from "./ActionButton";
import { Switch } from './Switch';
import { ProfileForm } from './ProfileForm';
import SuccessText from '../SuccessText';
import Notification from '../Notification';
import BlurImage from '../BlurImage';
import { handleCreateCogno, handleDeleteCogno, handleUpdateCogno } from './transaction';

interface ProfileModalProps {
  cogno: UTxO | null;
  network: number | null;
  wallet: BrowserWallet;
  onClose: () => void;
  refreshCogno: () => void;
}

export const ProfileModal: FC<ProfileModalProps> = ({ cogno, network, wallet, onClose, refreshCogno }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [submittedTxHash, setSubmittedTxHash] = useState<string | null>(null);
  const [notification, setNotification] = useState<string>('');
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [details, setDetails] = useState('');

  const clearNotification = () => {
    setIsSuccessful(false);
    setNotification('')
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
      setIsSubmitting(false);
    }, maxRetries);
 
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsEditing(false);
    setSubmittedTxHash('');
    setIsSuccessful(false);
    const result = await handleCreateCogno(network, wallet, { title, image, details});
    if (result.success === false) {
      // something failed so notify the user of the error message
      setNotification(result.message);
      setIsSubmitting(false);
    } else {
      // the transaction was submitted and we need to show the success modal
      setSubmittedTxHash(result.message);
      setIsSuccessful(true);
      // this is where the actual sc interaction will be
      checkTransaction(network!, result.message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsEditing(false);
    setSubmittedTxHash('');
    setIsSuccessful(false);
    const result = await handleUpdateCogno(network, wallet, cogno, { title, image, details});
    if (result.success === false) {
      // something failed so notify the user of the error message
      setNotification(result.message);
      setIsSubmitting(false);
    } else {
      // the transaction was submitted and we need to show the success modal
      setSubmittedTxHash(result.message);
      setIsSuccessful(true);
      // this is where the actual sc interaction will be
      checkTransaction(network!, result.message);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setIsEditing(false);
    setSubmittedTxHash('');
    setIsSuccessful(false);
    const result = await handleDeleteCogno(network, wallet, cogno);
    if (result.success === false) {
      // something failed so notify the user of the error message
      setNotification(result.message);
      setIsSubmitting(false);
    } else {
      // the transaction was submitted and we need to show the success modal
      setSubmittedTxHash(result.message);
      setIsSuccessful(true);
      // this is where the actual sc interaction will be
      checkTransaction(network!, result.message);
    }
  };

  useEffect(() => {
    if (cogno) {
      const datum = parseDatumCbor(cogno.output.plutusData!);
      setTitle(hexToString(datum.fields[1].fields[0].bytes) || '');
      setImage(hexToString(datum.fields[1].fields[1].bytes) || '');
      setDetails(hexToString(datum.fields[1].fields[2].bytes) || '');
    }
  }, [cogno]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Full-screen overlay to block interactions */}
      <div className="fixed inset-0 dark-bg opacity-50 z-40"></div>

      {/* Modal content with a high z-index to ensure it's above everything */}
      <div className="relative light-bg p-5 border rounded-md light-bg lg:max-w-screen-lg w-full z-50">
        <div className='flex items-center justify-between space-x-4'>
          <h3 className="text-3xl font-medium dark-text text-nowrap text-ellipsis overflow-hidden">{title}</h3>
          {cogno && <Switch isOn={isEditing} onToggle={setIsEditing} />}
          {cogno ? (
            <ActionButton
              isSubmitting={!isEditing || isSubmitting}
              onClick={() => {}}
              className={`blue-bg ${isEditing ? 'blue-bg-hover' : ''} dark-text font-bold py-2 px-4 mx-1 rounded`}
              type="submit"
              form="profile-form"
            >
              Update
            </ActionButton>
          ) : (
            <ActionButton
              isSubmitting={isSubmitting}
              onClick={() => {}}
              className={`green-bg ${!isSubmitting ? 'green-bg-hover' : ''} dark-text font-bold py-2 px-4 mx-1 rounded`}
              type="submit"
              form="profile-form"
            >
              Create
            </ActionButton>
          )}
          {cogno && (
            <ActionButton
              isSubmitting={!isEditing || isSubmitting}
              onClick={handleDelete}
              className={`red-bg ${isEditing ? 'red-bg-hover' : ''} dark-text font-bold py-2 px-4 mx-1 rounded`}
            >
              Delete
            </ActionButton>
          )}
          <CloseButton onClose={onClose} />
        </div>
        <div className="flex items-center justify-center text-center pt-2">
          {isSuccessful && <SuccessText txHash={submittedTxHash} />}
        </div>
        <div className="flex pt-2">
          {image.trim() !== '' && (
            <div className="w-full">
              <BlurImage imageUrl={image} />
            </div>
          )}
          <ProfileForm
            isSubmitting={cogno ? !isEditing || isSubmitting : isSubmitting}
            handleSubmit={cogno ? handleUpdate : handleCreate}
            title={title}
            setTitle={setTitle}
            imageUrl={image}
            setImageUrl={setImage}
            details={details}
            setDetails={setDetails}
          />
        </div>
        <div></div>
        <div className="flex items-center justify-center pt-2">
          <ActionButton
            isSubmitting={false}
            onClick={onClose}
            className="blue-bg blue-bg-hover dark-text font-bold py-2 px-4 rounded"
          >
            Close
          </ActionButton>
        </div>
        {notification && <Notification message={notification} onDismiss={clearNotification} successful={isSuccessful} />}
      </div>
    </div>
  );
};

export default ProfileModal;
