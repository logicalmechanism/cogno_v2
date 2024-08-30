import React from 'react';

interface ProfileInfoProps {
  title: string;
  imageUrl: string;
  details: string;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ 
  title,
  imageUrl,
  details,
}) => {
  return (
    <div className="flex flex-col w-full">
      <div className="m-2">
        <label className="block dark-text text-sm font-bold mb-2">Username</label>
        <input
          type="text"
          value={title}
          className="border p-2 rounded w-full dark-text"
          required
          autoComplete="off"
          maxLength={300}
          disabled={true}
          data-gramm="false"
        />
      </div>
      <div className="m-2">
        <label className="block dark-text text-sm font-bold mb-2">
          Image URL
        </label>
        <input
          type="url"
          value={imageUrl}
          className="border p-2 rounded w-full dark-text"
          autoComplete="off"
          maxLength={2000}
          disabled={true}
          data-gramm="false"
        />
      </div>
      <div className="m-2">
        <label className="block dark-text text-sm font-bold mb-2">Details</label>
        <textarea
          value={details}
          className="border p-2 rounded w-full dark-text"
          autoComplete="off"
          maxLength={40000}
          disabled={true}
          data-gramm="false"
        ></textarea>
      </div>
    </div>
  );
};
