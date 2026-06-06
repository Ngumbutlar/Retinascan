import { useState } from 'react';
import axios from 'axios';

// IMPORTANT: Please ensure 'api' is configured correctly for your project.
// If you have a global Axios instance (e.g., 'src/api/index.ts'), import it here.
// Example: import api from '../api';
const api = axios.create(); // Basic axios instance, configure baseURL if needed for /api calls.

export const useDownloadPDF = () => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const downloadPDF = async (recordId: number) => {
    setDownloading(true);
    setError('');
    try {
      const response = await api.get(
        `/api/records/${recordId}/pdf`,
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RetinaScan-RS${recordId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error("PDF download error:", e);
      setError('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return { downloadPDF, downloading, error };
};