// server/index.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- API Routes ---
// Your API routes should come before the production catch-all
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// A simple root route for testing the server directly
app.get('/', (req, res) => {
    res.send('Node.js server is running!'); 
});

// --- Production-only routes ---
if (process.env.NODE_ENV === 'production') {
    const buildPath = path.resolve(__dirname, '../dist');
    
    // Serve static files from the Svelte build folder
    app.use(express.static(buildPath));

    // For all other non-API requests, send the Svelte app
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(buildPath, 'index.html')); 
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});