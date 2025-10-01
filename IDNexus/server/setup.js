const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');

const YT_DLP_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
const ytDlpDir = path.join(__dirname, '..', 'yt-dlp');
const ytDlpPath = path.join(ytDlpDir, 'yt-dlp.exe');

async function setup() {
    try {
        // Create yt-dlp directory if it doesn't exist
        if (!fs.existsSync(ytDlpDir)) {
            fs.mkdirSync(ytDlpDir, { recursive: true });
        }
        
        // Download yt-dlp if it doesn't exist
        if (!fs.existsSync(ytDlpPath)) {
            console.log('Downloading yt-dlp...');
            await downloadFile(YT_DLP_URL, ytDlpPath);
            console.log('yt-dlp downloaded successfully!');
        }

        // Create downloads directory if it doesn't exist
        const downloadsDir = path.join(__dirname, 'downloads');
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
        }
        console.log('Downloads directory created/verified!');

        console.log('Setup completed successfully!');
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, response => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', error => {
            fs.unlink(dest);
            reject(error);
        });
    });
}

setup();