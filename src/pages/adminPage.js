import React, { useEffect, useState } from 'react';
import axios from 'axios';
import apiClient from '../utils/apiClient';

const AdminFilePage = () => {
  const [files, setFiles] = useState([]);
  const token = localStorage.getItem('accessToken'); // Retrieve JWT token from storage

  // Fetch all files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await apiClient.get('http://localhost:8000/api/admin/files/', {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT in headers
          },
        });
        console.log(response.data,"api sre"); // Log the API response

        setFiles(response.data.results || response.data); // Adjust based on response format
      } catch (error) {
        console.error('Error fetching files:', error.response?.data || error.message);
      }
    };

    fetchFiles();
  }, [token]);

  // Delete a file
  const deleteFile = async (fileId) => {
    try {
      await axios.delete(`http://localhost:8000/api/admin/files/${fileId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Update the file list after deletion
      setFiles(files.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error.response?.data || error.message);
    }
  };

  return (
    <div>
      <h1>Admin: Manage Files</h1>
      <ul>
        {files.map((file) => (
          <li key={file.id}>
            {file.file} - Owner: 
            <button onClick={() => deleteFile(file.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminFilePage;
