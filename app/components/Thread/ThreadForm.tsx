// components/Threads/ThreadForm.tsx

import React, { useState } from 'react';
import { BrowserWallet } from '@meshsdk/core';
import { handleThreadCreation } from './transaction';
import SuccessText from '../SuccessText';
import Notification from '../Notification';

interface ThreadFormProps {
  network: number | null;
  wallet: BrowserWallet;
}

export const ThreadForm: React.FC<ThreadFormProps> = ({ network, wallet }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [imageUrl, setImageUrl] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [lovelace, setLovelace] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessLink, setShowSuccessLink] = useState(false);
  const [submittedTxHash, setSubmittedTxHash] = useState<string | null>(null);
  const [notification, setNotification] = useState<string>('');
  const clearNotification = () => setNotification('');

  const handleSubmit = async (e: React.FormEvent) => {
    setIsSubmitting(true);
    setSubmittedTxHash('');
    setShowSuccessLink(false);
    e.preventDefault();
    const newThread = {
      title,
      content,
      category,
      imageUrl: imageUrl || '',
      tokenName: anonymous ? '' : sessionStorage.getItem('tokenName'),
      lovelace: 1_000_000 * lovelace
    };
    const result = await handleThreadCreation(network, wallet, newThread);
    if (result.success === false) {
      // something failed so notify the user of the error message
      setNotification(result.message);
      setIsSubmitting(false);
    } else {
      // the transaction was submitted and we need to show the success modal
      setSubmittedTxHash(result.message);
      setShowSuccessLink(true);
      // reset all the values
      setTitle('');
      setContent('');
      setCategory('General'); // default value
      setImageUrl('');
      setAnonymous(false);
      setLovelace(0);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="thread-form border p-4 rounded">
      {showSuccessLink && <SuccessText txHash={submittedTxHash} />}
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded w-full text-black"
          required
          autoComplete="off"
          maxLength={300}
        />
      </div>
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 rounded w-full text-black"
          required
          autoComplete="off"
          maxLength={40000}
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2">
          Category
          <span className="relative group">
            <svg
              className="w-4 h-4 inline-block ml-2 text-gray-500 cursor-pointer"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.93 12.36h-1.85v-1.85h1.85v1.85zm0-4.71h-1.85v-4.71h1.85v4.71z" />
            </svg>
            <div className="absolute bottom-0 left-0 transform translate-y-full bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-max">
              Categories help users filter threads.
            </div>
          </span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded w-full text-black"
          required
        >
          <option value="General">General</option>
          <option value="Blockchain">Blockchain</option>
          <option value="News">News</option>
          <option value="Sports">Sports</option>
          <option value="Technology">Technology</option>
          <option value="Finance">Finance</option>
          <option value="Video Games">Video Games</option>
          <option value="Music">Music</option>
          <option value="Random">Random</option>
          <option value="Adult">Adult</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2">
          Image URL (optional)
          <span className="relative group">
            <svg
              className="w-4 h-4 inline-block ml-2 text-gray-500 cursor-pointer"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.93 12.36h-1.85v-1.85h1.85v1.85zm0-4.71h-1.85v-4.71h1.85v4.71z" />
            </svg>
            <div className="absolute bottom-0 left-0 transform translate-y-full bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-max">
              A image to be attached to the content of a thread.
            </div>
          </span>
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="border p-2 rounded w-full text-black"
          autoComplete="off"
          maxLength={2000}
        />
      </div>
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="mr-2"
        />
        <label className="block text-white text-sm font-bold">
          Permanent (optional)
          <span className="relative group">
            <svg
              className="w-4 h-4 inline-block ml-2 text-gray-500 cursor-pointer"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.93 12.36h-1.85v-1.85h1.85v1.85zm0-4.71h-1.85v-4.71h1.85v4.71z" />
            </svg>
            <div className="absolute bottom-0 left-0 transform translate-y-full bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-max">
              Permanent threads can not be deleted and will be locked forever.
            </div>
          </span>
        </label>
      </div>
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2">
          Buffer Lovelace (optional)
          <span className="relative group">
            <svg
              className="w-4 h-4 inline-block ml-2 text-gray-500 cursor-pointer"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.93 12.36h-1.85v-1.85h1.85v1.85zm0-4.71h-1.85v-4.71h1.85v4.71z" />
            </svg>
            <div className="absolute bottom-0 left-0 transform translate-y-full bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-max">
              Supply Lovelace to the UTxO for free comments from other users.
            </div>
          </span>
        </label>
        <input
          type="number"
          value={lovelace}
          onChange={(e) => setLovelace(Math.max(0, Number(e.target.value)))}
          className="border p-2 rounded w-32 text-black"
          min={0}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded mt-2"
        disabled={isSubmitting}
      >
        Create Thread
      </button>
      {showSuccessLink && <SuccessText txHash={submittedTxHash} />}
      {notification && <Notification message={notification} onDismiss={clearNotification} />}
    </form>
  );
};
