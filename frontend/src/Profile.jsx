import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, CheckCircle2, Loader2, Trash2, BookOpen, Clock, User as UserIcon, Upload } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Profile({ user }) {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Profile Form State
  const [profileData, setProfileData] = useState({
    full_name: '',
    education: '',
    experience_level: 'Beginner',
    projects: '',
    career_goal: ''
  });
  const [fileName, setFileName] = useState('Choose File...');

  useEffect(() => {
    if (user?.id) {
      fetchRoadmaps();
    }
  }, [user]);

  const fetchRoadmaps = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/roadmaps/${user.id}`);
      if (response.data.success) {
        setRoadmaps(response.data.roadmaps);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await axios.put(`${API_URL}/api/profile/${user.id}`, profileData);
      alert('Profile updated successfully in MongoDB!');
    } catch (err) {
      alert('Error saving profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/api/roadmaps/${id}`);
      if (response.data.success) {
        setRoadmaps(roadmaps.filter(roadmap => (roadmap._id || roadmap.id) !== id));
      }
    } catch (err) {
      alert(`Could not delete: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      
      {/* SECTION 1: Personal Details Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <UserIcon className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Student Portfolio</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Full Name</label>
              <input type="text" name="full_name" value={profileData.full_name} onChange={handleProfileChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" placeholder="e.g. Shahan" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Education / University</label>
              <input type="text" name="education" value={profileData.education} onChange={handleProfileChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" placeholder="BS Software Engineering..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Experience Level</label>
              <select name="experience_level" value={profileData.experience_level} onChange={handleProfileChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none">
                <option>Beginner (0-1 years)</option>
                <option>Intermediate (1-3 years)</option>
                <option>Advanced (3+ years)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Upload CV / Resume</label>
              <label className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 border-dashed rounded-lg p-3 text-slate-300 flex justify-center items-center gap-2 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" /> {fileName}
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setFileName(e.target.files[0].name);
                    }
                  }}
                />
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Key Projects</label>
            <textarea name="projects" value={profileData.projects} onChange={handleProfileChange} rows="2" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" placeholder="Built an AI Job Tracker, etc..." />
          </div>

          <button type="submit" disabled={saveLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50">
            {saveLoading ? 'Saving...' : 'Save Profile Settings'}
          </button>
        </form>
      </div> {/* <--- This closing div for Section 1 was the missing piece! */}

      {/* SECTION 2: Saved Roadmaps */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            My Saved Roadmaps
          </h2>
          <span className="text-sm text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            {roadmaps.length} {roadmaps.length === 1 ? 'Roadmap' : 'Roadmaps'}
          </span>
        </div>

        {roadmaps.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-slate-900/40">
            <Target className="w-12 h-12 text-slate-700 mb-3" />
            <h3 className="text-slate-400 font-medium">No roadmaps saved yet</h3>
            <p className="text-slate-500 text-sm mt-1">Generate a new roadmap and click save to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roadmaps.map((roadmap) => {
              const roadmapId = roadmap._id || roadmap.id; 
              return (
                <div key={roadmapId} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col relative group">
                  <button onClick={() => handleDelete(roadmapId)} className="absolute top-4 right-4 p-2 bg-rose-500/10 text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/20" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-500/30">
                      <span className="text-lg font-bold text-indigo-400">{roadmap.readiness_score}%</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100">{roadmap.target_role}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(roadmap.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">Skill Gaps</span>
                    <div className="flex flex-wrap gap-1.5">
                      {roadmap.skill_gaps && roadmap.skill_gaps.slice(0, 4).map(gap => (
                        <span key={gap} className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-md">{gap}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}