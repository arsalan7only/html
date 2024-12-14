const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use('/files', express.static(__dirname));

// Serve static HTML file for the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API to create or edit a file
app.post('/create-file', (req, res) => {
    const { filename, url } = req.body;

    if (!filename || !url) {
        return res.status(400).json({ message: 'Filename and URL are required.' });
    }

    const sanitizedFilename = filename.endsWith('.html') ? filename : `${filename}.html`;
    const filePath = path.join(__dirname, sanitizedFilename);

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="0;url=${url}">
    <title>Redirecting...</title>
</head>
<body>
</body>
</html>`;

    fs.writeFile(filePath, htmlContent, (err) => {
        if (err) {
            console.error('Error creating or editing the file:', err);
            return res.status(500).json({ message: 'Failed to create or edit the file.' });
        }

        res.status(200).json({ message: `File "${sanitizedFilename}" created/edited successfully.` });
    });
});

// API to list all HTML files in the directory
app.get('/list-files', (req, res) => {
    const directoryPath = __dirname;

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading the directory:', err);
            return res.status(500).json({ message: 'Failed to list files.' });
        }

        const htmlFiles = files.filter((file) => file.endsWith('.html'));
        res.status(200).json(htmlFiles);
    });
});

// API to get file content
app.get('/file-content', (req, res) => {
    const { filename } = req.query;

    if (!filename) {
        return res.status(400).json({ message: 'Filename is required.' });
    }

    const filePath = path.join(__dirname, filename);

    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.status(500).json({ message: 'Failed to read the file.' });
        }

        // Extract URL from the HTML content
        const match = data.match(/<meta http-equiv="refresh" content="0;url=(.*?)">/);
        const url = match ? match[1] : '';

        res.status(200).json({ content: data, url });
    });
});

// API to edit file content
app.post('/edit-file', (req, res) => {
    const { filename, url } = req.body;

    if (!filename || !url) {
        return res.status(400).json({ message: 'Filename and URL are required.' });
    }

    const sanitizedFilename = filename.endsWith('.html') ? filename : `${filename}.html`;
    const filePath = path.join(__dirname, sanitizedFilename);

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="0;url=${url}">
    <title>Redirecting...</title>
</head>
<body>
</body>
</html>`;

    fs.writeFile(filePath, htmlContent, (err) => {
        if (err) {
            console.error('Error saving the file:', err);
            return res.status(500).json({ message: 'Failed to save the file.' });
        }

        res.status(200).json({ message: `File "${sanitizedFilename}" updated successfully.` });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
