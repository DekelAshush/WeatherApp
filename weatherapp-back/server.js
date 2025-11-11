import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getWeather } from './Controllers/GetWeather.js';
import { initializeDatabase } from './config/database.js';
import weatherHistoryRoutes from './routes/weatherHistory.js';

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

// Initialize database connection and verify table
initializeDatabase().catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ ok: true });
});

// POST /api/getWeather/send - delegate to controller
app.post('/api/getWeather/send', getWeather);

// Weather history CRUD routes
app.use('/weather/history', weatherHistoryRoutes);

app.listen(port, async () => {
    console.log(`Backend listening on http://localhost:${port}`);
});