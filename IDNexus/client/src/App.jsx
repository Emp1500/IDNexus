import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [theme, setTheme] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, []);

  const validateYouTubeUrl = (url) => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    return pattern.test(url);
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    
    if (!validateYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setDownloadLink('');
    setVideoInfo(null);

    try {
      const response = await axios.post('http://localhost:3000/yt/download', { url });
      setDownloadLink(response.data.downloadUrl);
      setVideoInfo({
        filename: response.data.filename,
        quality: '1080p'
      });
    } catch (err) {
      setError('Download failed. Please check if it\'s a valid video URL.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`App ${theme}`}>
      <div className="glass-container">
        <div className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? '🌙' : '☀️'}
        </div>
        
        <header className="header">
          <div className="logo-container">
            <div className="logo-animation">▶️</div>
            <h1>IDNexus</h1>
          </div>
          <p className="subtitle">Premium Video Downloader</p>
        </header>

        <main className="main-content">
          <div className="search-container">
            <form onSubmit={handleDownload} className="download-form">
              <div className="input-wrapper">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste video URL here..."
                  className="url-input"
                  disabled={isLoading}
                />
                <button type="submit" className="download-button" disabled={isLoading}>
                  {isLoading ? (
                    <div className="loader">
                      <span className="loader-circle"></span>
                    </div>
                  ) : (
                    <span className="button-content">Download</span>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="message error-message">
                <span className="message-icon">!</span>
                {error}
              </div>
            )}

            {downloadLink && videoInfo && (
              <div className="message success-message">
                <div className="success-content">
                  <div className="pulse-animation">✓</div>
                  <div className="video-info">
                    <h3>Ready to Download</h3>
                    <p>{videoInfo.filename}</p>
                    <span className="quality-badge">{videoInfo.quality}</span>
                  </div>
                  <a href={downloadLink} download className="save-button">
                    Save Video
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="features">
            <div className="feature-card">
              <span className="feature-icon">🎥</span>
              <h3>High Quality</h3>
              <p>Download in 1080p</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⚡</span>
              <h3>Fast Download</h3>
              <p>Optimized speeds</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔒</span>
              <h3>Secure</h3>
              <p>Safe downloads</p>
            </div>
          </div>
        </main>

        <footer className="footer">
          <p>Made with ♥️ by IDNexus</p>
        </footer>
      </div>
    </div>
  );
}

export default App;