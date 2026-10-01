import React, { useState } from 'react';
import { BookOpen, Sparkles, ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface AuthPageProps {
  onNavigate: (page: string) => void;
  isRegister?: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, isRegister = false }) => {
  const { login, register, loginDemo } = useAuth();
  const { addToast } = useWorkspace();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Student Researcher');
  const [interests, setInterests] = useState('Machine Learning, NLP, AI Systems');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isRegister) {
        await register({ email, password, full_name: fullName, role, research_interests: interests });
        addToast({ 
          type: 'success', 
          title: `Account Created for ${fullName}!`, 
          description: `Logged in as ${email} (${role})` 
        });
      } else {
        await login(email, password);
        addToast({ 
          type: 'success', 
          title: 'Welcome back to ScholarPulse',
          description: `Authenticated as ${email}`
        });
      }
      onNavigate('dashboard');
    } catch (err: any) {
      addToast({ type: 'error', title: 'Authentication Error', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await loginDemo();
      addToast({ type: 'success', title: 'Logged in as Demo Researcher' });
      onNavigate('dashboard');
    } catch (err: any) {
      addToast({ type: 'error', title: 'Demo Login Failed', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-brand-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-100">
            {isRegister ? 'Create ScholarPulse Account' : 'Sign in to ScholarPulse'}
          </h2>
          <p className="text-xs text-slate-400">AI-Powered Research Paper Digest & Literature Workspace</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <>
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Academic Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="Student Researcher">Student Researcher</option>
                  <option value="College Faculty">College Faculty</option>
                  <option value="Research Scholar">Research Scholar / PhD</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="researcher@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>{isRegister ? 'Complete Registration' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Switch Link */}
        <div className="text-center text-xs text-slate-400">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button onClick={() => onNavigate('login')} className="text-brand-400 font-bold hover:underline">
                Sign In
              </button>
            </p>
          ) : (
            <p>
              New to ScholarPulse?{' '}
              <button onClick={() => onNavigate('register')} className="text-brand-400 font-bold hover:underline">
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
