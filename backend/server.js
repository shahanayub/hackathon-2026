const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// 1. Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Node.js API Gateway' });
});

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001/agent/recommend';

app.post('/api/roadmap/generate', async (req, res) => {
    try {
        const { user_query, current_skills, target_role } = req.body;

        const response = await axios.post(AI_SERVICE_URL, {
            user_query,
            current_skills,
            target_role
        });

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Error forwarding to AI Service:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to communicate with AI Service',
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`API Gateway is running on http://localhost:${PORT}`);
});