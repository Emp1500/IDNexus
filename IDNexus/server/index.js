const express = require('express');
const cors = require('cors');
const axios = require('axios'); // We need axios now
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// Create a 'downloads' directory if it doesn't exist
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

// Serve the downloaded files statically
app.use('/downloads', express.static(downloadsDir));

// This is our original test endpoint, we can keep it for now
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from the server! 👋" });
});

// --- NEW DOWNLOAD ROUTE ---
app.post('/download', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream' // Important for handling large files
    });

    // Extract filename from URL or headers
    const parsedUrl = new URL(url);
    const filename = path.basename(parsedUrl.pathname) || 'downloaded-file';
    const localFilePath = path.join(downloadsDir, filename);

    const writer = fs.createWriteStream(localFilePath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      console.log('File downloaded successfully:', filename);
      const downloadUrl = `http://localhost:${PORT}/downloads/${filename}`;
      res.status(200).json({ downloadUrl });
    });

    writer.on('error', (err) => {
      console.error('Error writing file:', err);
      res.status(500).json({ error: 'Failed to save the file' });
    });

  } catch (error) {
    console.error('Error downloading from URL:', error.message);
    res.status(500).json({ error: 'Failed to download from the provided URL' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});