import React, { useState, useEffect } from 'react';

const Moderation: React.FC = () => {
  const [friendList, setFriendList] = useState<string[]>([]);
  const [blockedUserList, setBlockedUserList] = useState<string[]>([]);
  const [blockedThreadList, setBlockedThreadList] = useState<string[]>([]);
  const [showFriendList, setShowFriendList] = useState(false);
  const [showBlockedUserList, setShowBlockedUserList] = useState(false);
  const [showBlockedThreadList, setShowBlockedThreadList] = useState(false);


  useEffect(() => {
    const storedFriendList = JSON.parse(sessionStorage.getItem('friendList') || '[]');
    const storedBlockedUserList = JSON.parse(sessionStorage.getItem('blockUserList') || '[]');
    const storedBlockedThreadList = JSON.parse(sessionStorage.getItem('blockThreadList') || '[]');

    setFriendList(storedFriendList);
    setBlockedUserList(storedBlockedUserList);
    setBlockedThreadList(storedBlockedThreadList);
  }, []);

  const handleRemove = (listName: string, item: string, setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    const updatedList = (prevList: string[]) => prevList.filter((i) => i !== item);
    setList((prevList) => {
      const result = updatedList(prevList);
      // console.log(result); // Log the updated list
      sessionStorage.setItem(listName, JSON.stringify(result));
      return result;
    });
  };

  // how to render out each moderation list
  const renderList = (
    title: string,
    list: string[],
    listName: string,
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    showList: boolean,
    setShowList: React.Dispatch<React.SetStateAction<boolean>>
  ) => (
    <div className="mb-2">
      <button
        type='button'
        onClick={() => setShowList(!showList)}
        className="green-bg green-bg-hover dark-text font-bold py-1 px-2 rounded mb-1"
      >
        {showList ? `Hide ${title}` : `View ${title}`}
      </button>
      {showList && (
        <div className="border rounded p-2 items-center flex flex-col">
          {list.length === 0 ? (
            <p className="dark-text">No items in this list.</p>
          ) : (
            list.map((item, index) => (
              <div key={index} className="flex justify-between items-center mb-1">
                <span className="dark-text">{item}</span>
                <button
                  type='button'
                  onClick={() => handleRemove(listName, item, setList)}
                  className="red-bg red-bg-hover dark-text font-bold py-1 px-2 ml-2 rounded"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <div>
      {renderList('Friend List', friendList, 'friendList', setFriendList, showFriendList, setShowFriendList)}
      {renderList('Blocked User List', blockedUserList, 'blockUserList', setBlockedUserList, showBlockedUserList, setShowBlockedUserList)}
      {renderList('Blocked Thread List', blockedThreadList, 'blockThreadList', setBlockedThreadList, showBlockedThreadList, setShowBlockedThreadList)}
    </div>
  );
};

export default Moderation;
