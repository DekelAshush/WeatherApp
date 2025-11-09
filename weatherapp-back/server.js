import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getWeather } from './Controllers/GetWeather.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration for production
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ ok: true });
});

// POST /api/whatsapp/send - delegate to controller
app.post('/api/getWeather/send', sendMessage);

app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
});