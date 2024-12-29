import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../utils/apiClient';

async function decryptFile(encryptedFile, encryptionKey, iv) {
    // Import the encryption key
    const key = await window.crypto.subtle.importKey(
        'jwk',
        encryptionKey,
        {
            name: 'AES-GCM',
        },
        true,
        ['decrypt']
    );
    console.log("Imported Key:", key);

    // Convert IV to Uint8Array
    const ivArray = new Uint8Array(iv);
    console.log("IV Array:", ivArray);

    // Decrypt the file
    let decryptedData;
    try {
        decryptedData = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: ivArray,
            },
            key,
            encryptedFile
        );
    } catch (error) {
        console.error("Decryption Error:", error);
        throw error; // Rethrow to handle higher up if needed
    }
    

    return new Blob([new Uint8Array(decryptedData)]);
}



function DownloadPage() {
    const { uid } = useParams(); // Extract the UID from the URL
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndDecryptFile = async () => {
            try {
                // Fetch metadata for the encrypted file
                const response = await apiClient.get(`https://localhost:8000/api/files/${uid}/download/`, {
                    responseType: 'json', // Important: Ensures the file is downloaded as binary
                });

                const { encrypted_file_url, encryption_key, iv, original_filename } = response.data;
                console.log("Encrypted File URL:", encrypted_file_url); 
                // Parse key and IV
                const parsedKey = JSON.parse(encryption_key); // Parse the key
                const parsedIV = JSON.parse(iv); // Parse the IV
        
                // Fetch encrypted file
                const encryptedFileResponse = await fetch(`https://127.0.0.1:8000/`+`${encrypted_file_url}`);
                const encryptedFileBuffer = await encryptedFileResponse.arrayBuffer();
                console.log("Encrypted File Size:", encryptedFileBuffer.byteLength);
        
                // Decrypt the file
                const decryptedFile = await decryptFile(encryptedFileBuffer, parsedKey, parsedIV);
        
                // Trigger download
                const url = window.URL.createObjectURL(decryptedFile);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', original_filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (err) {
                console.error("Decryption Process Failed:", err);
            }
        };
        
        fetchAndDecryptFile();
    }, [uid]);

    if (loading) {
        return <p>Downloading your file...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return null; // Nothing to display once the file is downloaded
}

export default DownloadPage;
