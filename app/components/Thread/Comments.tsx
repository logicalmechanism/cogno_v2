import React, { useState, useEffect } from 'react';
import { BrowserWallet, UTxO } from '@meshsdk/core';
import Notification from '../Notification';
import { parseDatumCbor } from '@meshsdk/mesh-csl';
import { hexToString } from '../utilities';
import { handleCommentCreation } from './transaction';
import SuccessText from '../SuccessText';
import { MaestroProvider } from '@meshsdk/core';


interface CommentProps {
  thread: UTxO;
  network: number | null;
  wallet: BrowserWallet;
  refreshThread: () => void; // Function to refresh threads
}

interface BytesField {
  bytes: string;
}

export const Comments: React.FC<CommentProps> = ({ thread, network, wallet, refreshThread }) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<BytesField[]>([]);
  const [notification, setNotification] = useState<string>('');
  const clearNotification = () => setNotification('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTxHash, setSubmittedTxHash] = useState<string | null>(null);
  const [showSuccessLink, setShowSuccessLink] = useState(false);

  const checkTransaction = (network: number, message: string) => {
    const networkName = network === 0 ? 'Preprod' : 'Mainnet';
    const maestro = new MaestroProvider({ network: networkName, apiKey: process.env.NEXT_PUBLIC_MAESTRO!, turboSubmit: false });

    const maxRetries = 250;

    maestro.onTxConfirmed(message, async () => {
      refreshThread();
      setNotification('Transaction Is On-Chain');
      // reset all the values
      setIsSubmitting(false);
      setComment('');
      setSubmittedTxHash('');
      setShowSuccessLink(false);
    }, maxRetries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmittedTxHash('');
    setShowSuccessLink(false);
    const result = await handleCommentCreation(network, wallet, thread, comment);
    if (result.success === false) {
      // something failed so notify the user of the error message
      setNotification(result.message);
      setIsSubmitting(false);

    } else {
      // the transaction was submitted and we need to show the success modal
      setSubmittedTxHash(result.message);
      setShowSuccessLink(true);
      checkTransaction(network!, result.message);
    }
  };

  useEffect(() => {
    // Update comments when thread changes
    // console.log(thread)
    // console.log('b',comments)
    const parsedComments: BytesField[] = parseDatumCbor(thread.output.plutusData!).fields[4].list;
    setComments(parsedComments);
    // console.log('a', comments)
  }, [thread]);

  return (
    <div className="container flex flex-col">
      <div className="">
        <form onSubmit={handleSubmit} className="border p-4 rounded">
          <div className='flex flex-col text-center items-center'>
            {showSuccessLink && <SuccessText txHash={submittedTxHash}/>}
          </div>
          <div className="mb-4 max-w-full">
            <label className="block text-black text-sm font-bold mb-2">Add A Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="border p-2 rounded w-full text-black w-full"
              required
              autoComplete="off"
              maxLength={1000}
              disabled={isSubmitting}
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-200 hover:bg-sky-400 text-black px-4 py-2 rounded"
            disabled={isSubmitting}

          >
            Reply
          </button>
          {notification && <Notification message={notification} onDismiss={clearNotification} />}
        </form>
      </div>
      <div className="comments-container text-black">
        <h3 className="text-lg font-bold">Comments</h3>
        {comments.slice().reverse().map((c, index) => {
          const commentText = hexToString(c.bytes);
          return (
            <div
              key={index}
              className="text-black border border-gray-300 rounded m-1 p-1"
            >
              <p>{commentText}</p>
              <br/>
            </div>
          );
        })}
      </div>
    </div>
  );
};
