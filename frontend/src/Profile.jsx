import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, CheckCircle2, AlertTriangle, Loader2, Trash2, BookOpen, Clock } from 'lucide-react';

export default function Profile({ user }) {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchRoadmaps();
    }
  }, [user]);

  const fetchRoadmaps = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/roadmaps/${user.id}`);
      if (response.data.success) {
        setRoadmaps(response.data.roadmaps);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/roadmaps/${id}`);
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
        <p>Loading your saved roadmaps from MongoDB...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl">
        <p>Error loading profile: {error}</p>
      </div>
    );
  }

  return (
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
            // MongoDB uses _id, fallback to id if needed
            const roadmapId = roadmap._id || roadmap.id; 
            
            return (
              <div key={roadmapId} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col relative group">
                
                <button 
                  onClick={() => handleDelete(roadmapId)}
                  className="absolute top-4 right-4 p-2 bg-rose-500/10 text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/20"
                  title="Delete Roadmap"
                >
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
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">Skill Gaps to Close</span>
                  <div className="flex flex-wrap gap-1.5">
                    {roadmap.skill_gaps && roadmap.skill_gaps.slice(0, 4).map(gap => (
                      <span key={gap} className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-md">
                        {gap}
                      </span>
                    ))}
                    {roadmap.skill_gaps && roadmap.skill_gaps.length > 4 && (
                      <span className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-500 text-xs rounded-md">
                        +{roadmap.skill_gaps.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-800/80">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Action Plan Preview
                  </span>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {roadmap.action_plan && roadmap.action_plan[0] ? roadmap.action_plan[0] : 'No action plan available.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}