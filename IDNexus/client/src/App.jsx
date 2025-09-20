import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setDownloadLink('');

    try {
      const response = await axios.post('http://localhost:3001/download', { url });
      setDownloadLink(response.data.downloadUrl);
    } catch (err) {
      setError('Download failed. Please check the URL and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Internet Download Manager</h1>
        <form onSubmit={handleDownload} className="download-form">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter file URL to download"
            className="url-input"
            disabled={isLoading}
          />
          <button type="submit" className="download-button" disabled={isLoading}>
            {isLoading ? 'Downloading...' : 'Download'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {downloadLink && (
          <div className="download-ready">
            <h2>Download Ready!</h2>
            <a href={downloadLink} download className="download-link">
              Click here to save your file
            </a>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;