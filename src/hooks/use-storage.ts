import { useState } from 'react';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

/**
 * Custom hook for uploading files to storage
 */
export function useStorage() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Upload a file to a pre-signed URL
   * 
   * @param url The pre-signed URL from Convex
   * @param file The file to upload (can be a File object, Blob, or base64 string)
   * @returns The URL of the uploaded file
   */
  const uploadFile = async (url: string, file: File | Blob | string): Promise<string> => {
    setStatus('uploading');
    setProgress(0);
    setError(null);
    
    try {
      // Convert base64 to blob if needed
      let fileToUpload: Blob;
      if (typeof file === 'string' && file.startsWith('data:')) {
        const response = await fetch(file);
        fileToUpload = await response.blob();
      } else if (file instanceof Blob) {
        fileToUpload = file;
      } else {
        throw new Error('Invalid file format');
      }
      
      // Create a FormData object if needed
      const formData = new FormData();
      formData.append('file', fileToUpload);
      
      // Upload the file
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      });
      
      // Return a promise that resolves when the upload is complete
      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setStatus('success');
            setProgress(100);
            resolve(url); // Return the URL where the file was uploaded
          } else {
            setStatus('error');
            const error = new Error(`HTTP Error: ${xhr.status}`);
            setError(error);
            reject(error);
          }
        };
        
        xhr.onerror = () => {
          setStatus('error');
          const error = new Error('Network error occurred');
          setError(error);
          reject(error);
        };
      });
      
      // Start the upload
      xhr.open('PUT', url);
      xhr.send(fileToUpload);
      
      return await uploadPromise;
    } catch (err) {
      setStatus('error');
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    }
  };

  return {
    uploadFile,
    status,
    progress,
    error,
    isUploading: status === 'uploading',
  };
}
