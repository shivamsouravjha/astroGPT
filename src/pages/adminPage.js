import React, { useEffect, useState } from 'react';
import axios from 'axios';
import apiClient from '../utils/apiClient';

const AdminFilePage = () => {
  
  const [files, setFiles] = useState([]);
  const token = localStorage.getItem('accessToken'); // Retrieve JWT token from storage
  const [csrfToken, setCsrfToken] = useState(null); // State to store CSRF token

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await apiClient.get('https://localhost:8000/api/csrf/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCsrfToken(response.data.csrfToken); // Adjust based on the CSRF endpoint response format
      } catch (error) {
        console.error('Error fetching CSRF token:', error.response?.data || error.message);
      }
    };

    fetchCsrfToken();
  }, [token]);

  // Fetch all files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await apiClient.get('https://localhost:8000/api/admin/files/', {
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
    console.log(csrfToken,"csrfToken");
    try {
      await apiClient.delete(`https://localhost:8000/api/admin/files/${fileId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-csrftoken': csrfToken, // Include CSRF token
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
