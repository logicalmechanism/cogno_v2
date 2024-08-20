import React, { useState } from 'react';

interface ProfileFormProps {
  isSubmitting: boolean;
  handleSubmit: () => void; // Function to refresh threads
  title: string;
  setTitle: (value: string) => void;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  details: string;
  setDetails: (value: string) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ 
  isSubmitting,
  handleSubmit, 
  title,
  setTitle,
  imageUrl,
  setImageUrl,
  details,
  setDetails, 
}) => {
  return (
    <form onSubmit={handleSubmit} className="flex flex-col border w-full" id="profile-form">
      <div className="m-2">
        <label className="block dark-text text-sm font-bold mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded w-full dark-text"
          required
          autoComplete="off"
          maxLength={300}
          disabled={isSubmitting}
          data-gramm="false"
        />
      </div>
      <div className="m-2">
        <label className="block dark-text text-sm font-bold mb-2">
          Image URL (Optional)
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="border p-2 rounded w-full dark-text"
          autoComplete="off"
          maxLength={2000}
          disabled={isSubmitting}
          data-gramm="false"
        />
      </div>
      <div className="m-2">
        <label className="block dark-text text-sm font-bold mb-2">Details (Optional)</label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="border p-2 rounded w-full dark-text h-32"
          autoComplete="off"
          maxLength={40000}
          disabled={isSubmitting}
          data-gramm="false"
        ></textarea>
      </div>
    </form>
  );
};
