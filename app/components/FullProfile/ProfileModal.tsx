import React, { useEffect, useState, FC } from 'react';
import { BrowserWallet, UTxO, MaestroProvider } from '@meshsdk/core';
import { parseDatumCbor } from '@meshsdk/mesh-csl';
import { hexToString, OutputAmount } from '../utilities';
//
import { CloseButton } from "./CloseButton";
import { ActionButton } from "./ActionButton";
import { Switch } from './Switch';
import { ProfileForm } from './ProfileForm';
import { Dropdown } from './Dropdown';
import { Moderation } from './Moderation';
// 
import SuccessText from '../SuccessText';
import Notification from '../Notification';
import BlurImage from '../BlurImage';
import { handleCreateCogno, handleDeleteCogno, handleUpdateCogno } from './transaction';

interface ProfileModalProps {
  thisCogno: UTxO | null;
  network: number | null;
  wallet: BrowserWallet;
  onClose: () => void;
  refreshCogno: () => void;
}



export const ProfileModal: FC<ProfileModalProps> = ({ thisCogno, network, wallet, onClose, refreshCogno }) => {
  const [cogno, setCogno] = useState<UTxO | null>(thisCogno)
  const [isThisYourCogno, setIsThisYourCogno] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [submittedTxHash, setSubmittedTxHash] = useState<string | null>(null);
  const [notification, setNotification] = useState<string>('');
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [details, setDetails] = useState('');

  const policyId = process.env.NEXT_PUBLIC_COGNO_MINTER_SCRIPT_HASH!;
  const cognoOwner = sessionStorage.getItem('cognoTokenName');

  console.log(isThisYourCogno);
  

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
      // this is true if you are looking at this cogno
      setIsThisYourCogno(cogno!.output.amount.some((asset: OutputAmount) => asset.unit.includes(policyId+cognoOwner)));
    }
  }, [cogno]);

  useEffect(() => {
    // Update cogno state whenever thisCogno changes
    setCogno(thisCogno);
    if (thisCogno) {
      setIsThisYourCogno(thisCogno!.output.amount.some((asset: OutputAmount) => asset.unit.includes(policyId+cognoOwner)));
    } else {
      setIsThisYourCogno(false);
    }

  }, [thisCogno]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto">
      {/* Full-screen overlay to block interactions */}
      <div className="fixed inset-0 dark-bg opacity-50 z-40"></div>
      {/* Modal content with a high z-index to ensure it's above everything */}
      <div className="relative light-bg p-5 border rounded-md light-bg lg:max-w-screen-lg w-full z-50 max-h-[90vh] overflow-y-auto">
        <div className='flex items-center justify-between space-x-4'>
          <h3 className="text-3xl font-medium dark-text text-nowrap text-ellipsis overflow-hidden">{title}</h3>
          {isThisYourCogno && cogno ? (
            <Switch isOn={isEditing} onToggle={setIsEditing} />) : (
              cogno ? (
                <ActionButton
                isSubmitting={false}
                onClick={() => {setCogno(thisCogno)}}
                className={`blue-bg blue-bg-hover dark-text font-bold py-2 px-4 mx-1 rounded`}
                type="button"
                >
                  Back
                </ActionButton>
              ): null
            )}
          {isThisYourCogno && cogno ? (
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
            !isThisYourCogno &&  cogno  ? (
              null
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
            )
          )}
          {isThisYourCogno && cogno && (
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
        {isThisYourCogno && 
          <div className='flex items-center justify-between pt-2'>
            <Dropdown title='Friends'><Moderation title='friendList' isEditing={isEditing} setCogno={setCogno} network={network}></Moderation></Dropdown>
            <Dropdown title='Blocked Users'><Moderation title='blockUserList' isEditing={isEditing} setCogno={setCogno} network={network}></Moderation></Dropdown>
            <Dropdown title='Blocked Threads'><Moderation title='blockThreadList' isEditing={isEditing}></Moderation></Dropdown>
          </div>
        }
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
