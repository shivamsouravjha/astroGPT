import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const FileSharingPage = () => {
  const { fileId } = useParams();
  const [sharedWith, setSharedWith] = useState('');

  const handleShare = async () => {
    try {
      await axios.post(
        `https://localhost:8000/api/files/${fileId}/share/`,
        { userId: sharedWith },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      alert('File shared successfully!');
    } catch (error) {
      console.error('Failed to share file:', error);
    }
  };

  return (
    <div>
      <h1>Share File</h1>
      <input
        type="text"
        placeholder="Enter user ID to share with"
        value={sharedWith}
        onChange={(e) => setSharedWith(e.target.value)}
      />
      <button onClick={handleShare}>Share</button>
    </div>
  );
};

export default FileSharingPage;
