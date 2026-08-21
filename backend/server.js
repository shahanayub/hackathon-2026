const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillforge';

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully...'))
    .catch(err => console.error('❌ MongoDB connection error:', err));


// --- DATABASE MODELS ---
// 1. User Profile Schema (Fulfills Role-Based & Profile requirements)
const userSchema = new mongoose.Schema({
    supabase_uid: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    full_name: String,
    role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' }, // Authorization Roles
    education: String,
    skills: [String],
    projects: [String],
    career_goal: String,
    experience_level: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// 2. Saved Roadmap Schema
const roadmapSchema = new mongoose.Schema({
    user_id: { type: String, required: true }, // Links to supabase_uid
    target_role: String,
    current_skills: [String],
    skill_gaps: [String],
    readiness_score: Number,
    action_plan: [String],
    curated_resources: [String],
    created_at: { type: Date, default: Date.now }
});

const SavedRoadmap = mongoose.model('SavedRoadmap', roadmapSchema);


// --- ROUTES ---

// 1. Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Node.js API Gateway + MongoDB' });
});

// 2. Sync Profile 
app.post('/api/profile', async (req, res) => {
    try {
        const { supabase_uid, email, full_name, role } = req.body;
        let user = await User.findOne({ supabase_uid });
        
    
        if (!user) {
            user = new User({ supabase_uid, email, full_name, role: role || 'student' });
            await user.save();
        }
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Save Roadmap to mongoDB
app.post('/api/roadmaps/save', async (req, res) => {
    try {
        const newRoadmap = new SavedRoadmap(req.body);
        await newRoadmap.save();
        res.json({ success: true, roadmap: newRoadmap });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. Get User's Saved Roadmaps
app.get('/api/roadmaps/:userId', async (req, res) => {
    try {
        const roadmaps = await SavedRoadmap.find({ user_id: req.params.userId }).sort({ created_at: -1 });
        res.json({ success: true, roadmaps });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a specific roadmap
app.delete('/api/roadmaps/:id', async (req, res) => {
    try {
        await SavedRoadmap.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Roadmap deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. Get all student profiles
app.get('/api/mentor/students', async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-__v');
        res.json({ success: true, students });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 6. Generate AI Roadmap 
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001/agent/recommend';

app.post('/api/roadmap/generate', async (req, res) => {
    try {
        const { user_query, current_skills, target_role } = req.body;
        const response = await axios.post(AI_SERVICE_URL, {
            user_query,
            current_skills,
            target_role
        });
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error forwarding to AI Service:', error.message);
        res.status(500).json({ success: false, message: 'Failed to communicate with AI Service', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 API Gateway is running on http://localhost:${PORT}`);
});