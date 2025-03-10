import React, { useState, useEffect, useRef } from 'react';
import { UTxO } from '@meshsdk/core';
import { BrowserWallet } from '@meshsdk/core';
import { parseDatumCbor } from '@meshsdk/mesh-csl';
import BlurImage from '../BlurImage';
import SuccessText from '../SuccessText';
import {Comments} from './Comments';
import { handleThreadDeletion } from './transaction';
import { hexToString } from '../utilities';
import { MaestroProvider } from '@meshsdk/core';
import Notification from '../Notification';
import type {BytesField, Datum} from './transaction'
import { findCognoFromThreadOwner } from './findThreadOwner';
import { ProfileDropdown } from '../MiniProfile';
import { findCogno } from '../utilities';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import ExternalLink from '../ExternalLink';

interface ThreadModalProps {
  network: number | null;
  wallet: BrowserWallet;
  thread: UTxO;
  onClose: () => void;
  refreshThread: () => void; // Function to refresh threads
}

export const ThreadModal: React.FC<ThreadModalProps> = ({network, wallet, thread, onClose, refreshThread }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessLink, setShowSuccessLink] = useState(false);
  const [submittedTxHash, setSubmittedTxHash] = useState<string | null>(null);
  const [notification, setNotification] = useState<string>('');
  const [parsedDatum, setParsedDatum] = useState<Datum>(parseDatumCbor(thread.output.plutusData!));
  const commentsRef = useRef<HTMLDivElement>(null);
  
  const [cogno, setCogno] = useState<UTxO | null>(null)
  
  const [showThreadOwnerInfo, setShowThreadOwnerInfo] = useState(false);

  const [threadOwnerTitle, setThreadOwnerTitle] = useState('');
  const [threadOwnerImage, setThreadOwnerImage] = useState('');
  const [threadOwnerDetails, setThreadOwnerDetails] = useState('');
  const [isFriend, setIsFriend] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  
  const clearNotification = () => setNotification('');

  const handleScrollToComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShowThreadOwnerInfo = async () => {
    findCognoFromThreadOwner(threadOwner, network!).then((threadOwnerCognoUTxO: UTxO | null) => {
      if (threadOwnerCognoUTxO !== null) {
        const datum = parseDatumCbor(threadOwnerCognoUTxO.output.plutusData!);
        setThreadOwnerTitle(hexToString(datum.fields[1].fields[0].bytes) || '');
        setThreadOwnerImage(hexToString(datum.fields[1].fields[1].bytes) || '');
        setThreadOwnerDetails(hexToString(datum.fields[1].fields[2].bytes) || '');
        setShowThreadOwnerInfo(!showThreadOwnerInfo);

        const friendList = JSON.parse(sessionStorage.getItem('friendList') ?? '[]');
        if (friendList.includes(threadOwner)) {
          setIsFriend(true);
        } else {
          setIsFriend(false);
        }
        const blockUserList = JSON.parse(sessionStorage.getItem('blockUserList') ?? '[]');
        if (blockUserList.includes(threadOwner)) {
          setIsBlocked(true);
        } else {
          setIsBlocked(false);
        }
      }
    })
  };

  useEffect(() => {
    setParsedDatum(parseDatumCbor(thread.output.plutusData!));
  }, [thread]);

  // this is the cogno that is signed in
  const tokenName = sessionStorage.getItem('cognoTokenName');
  // this is the cogno of the thread owner
  const threadOwner = (parsedDatum.fields[5] as BytesField).bytes
  console.log('threadOwner', threadOwner);
  
  const isOwner = tokenName === threadOwner;

  useEffect(() => {
    if (!isOwner) {
      findCogno(threadOwner, network!).then((threadOwnerCognoUTxO: UTxO | null) => {
        console.log('threadOwnerCognoUTxO',threadOwnerCognoUTxO);
        
        if (threadOwnerCognoUTxO) {
          setCogno(threadOwnerCognoUTxO);
        } else {
          setCogno(null);
        }
      });
    }
  }, [isOwner, threadOwner, network]);
    
  const hasTitle = (parsedDatum.fields[0] as BytesField).bytes;
  const hasContent = (parsedDatum.fields[1] as BytesField).bytes;
  const hasImage = (parsedDatum.fields[2] as BytesField).bytes;

  const checkTransaction = (network: number, message: string) => {
    const networkName = network === 0 ? 'Preprod' : 'Mainnet';
    const maestro = new MaestroProvider({ network: networkName, apiKey: process.env.NEXT_PUBLIC_MAESTRO!, turboSubmit: false });

    const maxRetries = 250;

    maestro.onTxConfirmed(message, async () => {
      refreshThread();
      setNotification('transaction is on-chain');
      // reset all the values
      setIsSubmitting(false);
      setSubmittedTxHash('');
      setShowSuccessLink(false);
      sessionStorage.setItem('threadTokenName', 'non existent token');
      onClose();
    }, maxRetries);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setSubmittedTxHash('');
    setShowSuccessLink(false);
    const result = await handleThreadDeletion(network, wallet, thread);
    if (result.success === false) {
      setNotification(result.message);
      setIsSubmitting(false);

    } else {
      // the transaction was submitted and we need to show the success modal
      setSubmittedTxHash(result.message);
      setShowSuccessLink(true);
      checkTransaction(network!, result.message);
    }
  };

  const handleBackToTop = () => {
    if (modalRef.current) {
      modalRef.current.scrollTo(0, 0);
    }
  };

  const handleAddFriend = () => {
    const friendList = JSON.parse(sessionStorage.getItem('friendList') ?? '[]');
    friendList.push(threadOwner);
    sessionStorage.setItem('friendList', JSON.stringify(friendList));
    setIsFriend(true);
  };
  const handleRemoveFriend = () => {
    const friendList = JSON.parse(sessionStorage.getItem('friendList') ?? '[]');
    const newFriendList = friendList.filter((item: string) => item !== threadOwner);
    sessionStorage.setItem('friendList', JSON.stringify(newFriendList));
    setIsFriend(false);
  };
  const handleBlockUser = () => {
    const blockUserList = JSON.parse(sessionStorage.getItem('blockUserList') ?? '[]');
    blockUserList.push(threadOwner);
    sessionStorage.setItem('blockUserList', JSON.stringify(blockUserList));
    setIsBlocked(true);
  };
  const handleUnblockUser = () => {
    const blockUserList = JSON.parse(sessionStorage.getItem('blockUserList') ?? '[]');
    const newBlockUserList= blockUserList.filter((item: string) => item !== threadOwner);
    sessionStorage.setItem('blockUserList', JSON.stringify(newBlockUserList));
    setIsBlocked(false);
  };

  return (
    <div className="fixed inset-0 bg-opacity-45 flex items-center justify-center z-50">
      <div className="light-bg p-6 rounded max-w-7xl w-full relative  max-h-[80vh] overflow-y-auto border-4 light-border" ref={modalRef}>
        {notification && <Notification message={notification} onDismiss={clearNotification} />}
        
        {/* delete button and the X close button*/}
        <div className="flex space-x-4">
          {isOwner ? (
            <button
              className="red-bg red-bg-hover dark-text px-4 py-2 mx-2 rounded w-1/4 h-10"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              Delete Thread
            </button>
          ) : (<></>)}
          <button
            className="text-6xl absolute top-0 right-1 mt-2 mr-4 w-1/4 dark-text"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Shown Add or Block Friend Button from thread owner if not the signed in cogno */}
        <div className="flex space-x-4">
          {isOwner ? (<></>) : (<ProfileDropdown cogno={cogno}></ProfileDropdown>)}
        </div>
        
        {/* Success Link Text For Transaction View*/}
        <div className='flex flex-col text-center items-center'>
          {showSuccessLink && <SuccessText txHash={submittedTxHash} />}
        </div>

        {/* title */}
        <div className="flex space-x-4">
          <div className="flex-grow"></div>
          <h2 className="text-3xl font-bold dark-text m-4">
            {hexToString(hasTitle)}
          </h2>
          <div className="flex-grow"></div>
        </div>

        {/* image + content */}
        <div className='flex space-x-4'>
          {/* Blur Image */}
          {hasImage && (
            <div className={`${hasContent ? 'w-1/3' : 'w-full'}`}>
              <div className='flex justify-center'>
                <BlurImage imageUrl={hexToString(hasImage)} />
              </div>
            </div>
          )}
          {hasContent && (
            <div className={`${hasImage ? 'w-2/3' : 'w-full'} flex-grow overflow-auto max-h-96`}>
              <ReactMarkdown
                className="prose prose-sm dark:prose-dark"
                remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                components={{
                  img: () => null, // images are not allowed in thread contents
                  a: ({ node, ...props }) => (
                    <ExternalLink {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <div {...props} /> // Replacing `<p>` with `<div>`
                  ),
                }}
              >
                {hexToString(hasContent)}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Comments here*/}
        <div ref={commentsRef}></div>
        <Comments thread={thread} network={network} wallet={wallet} refreshThread={refreshThread}/>
        <div className='items-center flex'>
          <div className="flex-grow"></div>
          <button
            onClick={handleBackToTop}
            className="blue-bg blue-bg-hover dark-text font-bold py-2 px-4 rounded"
          >
            Back to Top
          </button>
          <div className="flex-grow"></div>
          <button
            onClick={handleScrollToComments}
            className="blue-bg blue-bg-hover dark-text font-bold py-2 px-4 rounded"
          >
            Make A Comment
          </button>
          <div className="flex-grow"></div>
          <button
            onClick={onClose}
            className="blue-bg blue-bg-hover dark-text font-bold py-2 px-4 rounded"
          >
            Close Thread
          </button>
          <div className="flex-grow"></div>
        </div>
      </div>
    </div>
  );
};
