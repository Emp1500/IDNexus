const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Create required directories if they don't exist
const downloadsDir = path.join(__dirname, 'downloads');
const ytDlpDir = path.join(__dirname, '..', 'yt-dlp');

if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
}
if (!fs.existsSync(ytDlpDir)) {
    fs.mkdirSync(ytDlpDir, { recursive: true });
}

// Serve the downloaded files statically
app.use('/downloads', express.static(downloadsDir));

// Root route to show server is running
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>IDNexus Server</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #2c3e50; }
          .endpoints { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>IDNexus Server is Running! 🚀</h1>
        <div class="endpoints">
          <h2>Available Endpoints:</h2>
          <ul>
            <li><code>GET /api/message</code> - Test endpoint</li>
            <li><code>POST /yt/download</code> - Download video endpoint</li>
            <li><code>GET /downloads/*</code> - Access downloaded files</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// Test endpoint
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from the server! 👋" });
});

// --- YouTube 1080p download via yt-dlp ---
app.post('/yt/download', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const safeBase = Date.now().toString();
    const outputTemplate = path.join(downloadsDir, `${safeBase}.%(ext)s`);

    // Prefer mp4; for 1080p often video+audio need merging. Use bestvideo[height<=1080]+bestaudio.
    const args = [
      '-f', 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]',
      '-o', outputTemplate,
      '--merge-output-format', 'mp4',
      '--no-playlist',
      url
    ];

    // On Windows, call yt-dlp.exe from local yt-dlp directory if present
    const ytDlpPath = path.join(__dirname, '..', 'yt-dlp', 'yt-dlp.exe');
    const bin = fs.existsSync(ytDlpPath) ? ytDlpPath : 'yt-dlp';

    const child = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });

    let stderr = '';
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('error', (err) => {
      console.error('yt-dlp failed to start:', err);
      res.status(500).json({ error: 'yt-dlp not found or failed to start' });
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.error('yt-dlp exited with code', code, stderr);
        return res.status(500).json({ error: 'Failed to download video' });
      }

      // Find the produced file `${safeBase}.mp4` (merge-output-format enforces mp4)
      const producedFile = path.join(downloadsDir, `${safeBase}.mp4`);
      if (!fs.existsSync(producedFile)) {
        return res.status(500).json({ error: 'Output file not found' });
      }
      const filename = path.basename(producedFile);
      const downloadUrl = `http://localhost:3000/downloads/${filename}`;
      return res.status(200).json({ downloadUrl, filename });
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Handle 404
app.use((req, res) => {
  res.status(404).send(`
    <html>
      <head>
        <title>404 - Not Found</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
          h1 { color: #e74c3c; }
          a { color: #3498db; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/">Go to Home</a>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`👉 Open http://localhost:${PORT} in your browser to see available endpoints`);
});