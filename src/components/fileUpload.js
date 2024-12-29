import React, { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient'; // Import the Axios instance
import jwtDecode from 'jwt-decode';

async function encryptFile(file) {
    const key = await window.crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization vector

    const fileBuffer = await file.arrayBuffer();
    const encryptedData = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv,
        },
        key,
        fileBuffer
    );

    // Export the encryption key for server-side decryption
    const exportedKey = await window.crypto.subtle.exportKey('jwk', key);

    return {
        encryptedFile: new Blob([new Uint8Array(encryptedData)]), // Encrypted file
        encryptionKey: exportedKey,
        iv: Array.from(iv), // Send IV to the server
        originalFilename: file.name, // Include the original filename
    };
}
function FileUpload() {
    const [file, setFile] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken'); // Adjust based on how you store the token
        if (token) {
            const decoded = jwtDecode(token);
            console.log(decoded.role, "decoded");
            setUserRole(decoded.role); // Extract the role from the token
        }
    }, []);


    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        const { encryptedFile, encryptionKey, iv, originalFilename } = await encryptFile(file);

        const formData = new FormData();
        formData.append('file', encryptedFile, originalFilename); // Encrypted file
        formData.append('key', JSON.stringify(encryptionKey)); // Encryption key
        formData.append('iv', JSON.stringify(iv)); // Initialization vector
        console.log(JSON.stringify(encryptionKey), "key");
        console.log(JSON.stringify(iv), "iv");
        try {
            const response = await apiClient.post('/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('File uploaded successfully:', response.data);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div>
            {userRole !== 'guest' && (
                <>
                    <input type="file" onChange={handleFileChange} />
                    <button onClick={handleUpload}>Upload</button>
                </>
            )}
        </div>
    );

}
export default FileUpload;
