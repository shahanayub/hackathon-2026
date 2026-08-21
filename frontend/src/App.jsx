import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, 
  Brain, 
  AlertTriangle, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  Target,
  Code2,
  User,
  LogOut,
  Bookmark,
  BookmarkCheck,
  X
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Profile from './Profile';

const supabase = createClient(
  'https://cmvwhpbultkjchyhmfga.supabase.co',
  'sb_publishable_Q_lu-LHE5UN4Ef1U0PF8-Q_uJqH0lLg'
);

export default function App() {
  // Application State
  const [targetRole, setTargetRole] = useState('AI Engineer');
  const [currentSkills, setCurrentSkills] = useState(['Python', 'Git']);
  const [skillInput, setSkillInput] = useState('');
  const [userQuery, setUserQuery] = useState('How can I land a job in this field?');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('generator'); // 'generator' or 'profile'

  // Supabase Auth & Save State
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Listen for Supabase session changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !currentSkills.includes(skillInput.trim())) {
      setCurrentSkills([...currentSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setCurrentSkills(currentSkills.filter((s) => s !== skillToRemove));
  };

  const handleGenerateRoadmap = async () => {
    setLoading(true);
    setError(null);
    setSaveSuccess(false);
    try {
      const response = await axios.post('http://localhost:5000/api/roadmap/generate', {
        user_query: userQuery,
        current_skills: currentSkills,
        target_role: targetRole,
      });

      if (response.data.success) {
        setResult(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reach the API Gateway.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: { full_name: authFullName }
          }
        });
        if (error) throw error;
        setUser(data.user);
        setIsAuthModalOpen(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;
        setUser(data.user);
        setIsAuthModalOpen(false);
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentView('generator'); // Reset view to generator on sign out
  };

  const handleSaveRoadmap = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!result) return;

    setSaveLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/roadmaps/save', {
        user_id: user.id,
        target_role: targetRole,
        current_skills: currentSkills,
        skill_gaps: result.skill_gaps,
        readiness_score: result.score,
        action_plan: result.action_plan,
        curated_resources: result.curated_resources
      });

      if (response.data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      alert(`Could not save roadmap: ${err.response?.data?.error || err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen p-4 md:p-8 font-sans relative">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">SkillForge AI</h1>
              <p className="text-sm text-slate-400">Microservice-Powered Skill Gap Analyzer & Roadmap Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All Services Live
            </span>

            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView(currentView === 'generator' ? 'profile' : 'generator')}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-700"
                >
                  {currentView === 'generator' ? 'View Profile' : 'Back to Generator'}
                </button>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-xl text-xs">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-300 font-medium truncate max-w-[140px]">{user.email}</span>
                  <button
                    onClick={handleSignOut}
                    title="Sign Out"
                    className="ml-1 text-slate-400 hover:text-rose-400 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/20"
              >
                Sign In
              </button>
            )}
          </div>
        </header>


        {/* CONDITIONAL RENDERING: PROFILE VS GENERATOR */}
        {currentView === 'profile' && user ? (
          <Profile user={user} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Target Role & Query Form */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                <Target className="w-5 h-5" />
                <span>Career Target</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Select Target Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white"
                >
                  <option value="AI Engineer">AI Engineer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Cybersecurity Engineer">Cybersecurity Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                </select>
              </div>

              {/* Current Skills Tag Input */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Your Current Skills
                </label>
                <form onSubmit={handleAddSkill} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="e.g. Python, Git, Docker"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-white transition"
                  >
                    Add
                  </button>
                </form>

                <div className="flex flex-wrap gap-2">
                  {currentSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs rounded-lg"
                    >
                      <Code2 className="w-3 h-3" />
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 text-slate-500 hover:text-rose-400 font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Goal Query */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Specific Goal / Query
                </label>
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white"
                />
              </div>

              <button
                onClick={handleGenerateRoadmap}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running Microservices...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze Gaps & Generate
                  </>
                )}
              </button>
            </div>

            {/* Results Area */}
            <div className="lg:col-span-2 space-y-6">
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {!result && !loading && (
                <div className="h-full min-h-[350px] border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-slate-900/40">
                  <Brain className="w-12 h-12 text-slate-700 mb-3" />
                  <h3 className="text-slate-400 font-medium">No Analysis Generated Yet</h3>
                  <p className="text-slate-500 text-sm max-w-sm mt-1">
                    Add your skills and click generate to query the Python analyzer and Gemini agent.
                  </p>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  
                  {/* Score & Gaps Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Score */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                      <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">
                        Role Readiness
                      </span>
                      <div className="text-4xl font-extrabold text-indigo-400 mt-2">
                        {result.score}%
                      </div>
                      <span className="text-xs text-slate-500 mt-1">Benchmark Match</span>
                    </div>

                    {/* Missing Gaps */}
                    <div className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
                      <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider mb-3">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Identified Skill Gaps</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.skill_gaps.map((gap) => (
                          <span
                            key={gap}
                            className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium rounded-lg capitalize"
                          >
                            {gap}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Phased Action Plan */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Structured Learning Roadmap
                      </h3>

                      {/* Supabase Save Button */}
                      <button
                        onClick={handleSaveRoadmap}
                        disabled={saveLoading || saveSuccess}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          saveSuccess 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 border border-indigo-500/30'
                        }`}
                      >
                        {saveLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : saveSuccess ? (
                          <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                        <span>{saveSuccess ? 'Saved to Profile!' : 'Save Roadmap'}</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {result.action_plan.map((phase, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3.5 p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl"
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <p className="text-sm text-slate-300 leading-relaxed">{phase}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Curated Resources */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-sky-400" />
                      Recommended Study Resources
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.curated_resources.map((res, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-sm text-slate-300 hover:border-slate-700 transition"
                        >
                          <span>{res}</span>
                          <ArrowRight className="w-4 h-4 text-slate-500" />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        )} 
        {/* END CONDITIONAL RENDERING */}
        
      </div>

      {/* Supabase Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-1">
              {isSignUp ? 'Create SkillForge Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              {isSignUp ? 'Save and access your AI-generated roadmaps.' : 'Sign in to sync your saved roadmaps.'}
            </p>

            {authError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    placeholder="e.g. Alex Smith"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl font-semibold text-sm transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError(null);
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}