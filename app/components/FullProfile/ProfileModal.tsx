import React, { useEffect, useState, FC } from 'react';
import { BrowserWallet, UTxO } from '@meshsdk/core';
import { parseDatumCbor } from '@meshsdk/mesh-csl';
import { hexToString } from '../utilities';
import { CloseButton } from "./CloseButton";
import { ActionButton } from "./ActionButton";
import { Switch } from './Switch';
import { ProfileForm } from './ProfileForm';
import SuccessText from '../SuccessText';
import Notification from '../Notification';
import BlurImage from '../BlurImage';

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

  const clearNotification = () => setNotification('');

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
      <div className="relative bg-white p-5 border rounded-md light-bg lg:max-w-screen-lg w-full z-50">
        <div className='flex items-center justify-between space-x-4'>
          <h3 className="text-3xl font-medium dark-text">{title}</h3>
          {cogno && <Switch isOn={isEditing} onToggle={setIsEditing} />}
          {cogno ? (
            <ActionButton
              isSubmitting={!isEditing || isSubmitting}
              onClick={() => console.log("Update")}
              className={`blue-bg ${isEditing ? 'blue-bg-hover' : ''} dark-text font-bold py-2 px-4 mx-1 rounded`}
            >
              Update
            </ActionButton>
          ) : (
            <ActionButton
              isSubmitting={isSubmitting}
              onClick={() => console.log("Create")}
              className="green-bg green-bg-hover dark-text font-bold py-2 px-4 mx-1 rounded"
            >
              Create
            </ActionButton>
          )}
          {cogno && (
            <ActionButton
              isSubmitting={!isEditing || isSubmitting}
              onClick={() => console.log("Delete")}
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
            handleSubmit={() => console.log("Submit Tx")}
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
        {notification && <Notification message={notification} onDismiss={clearNotification} />}
      </div>
    </div>
  );
};

export default ProfileModal;
