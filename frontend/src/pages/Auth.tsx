import React, { useState } from 'react';
import { LogIn, Shield } from 'lucide-react';

export interface DemoUser {
  id: string;
  email: string;
  role: 'AUDITOR' | 'REVIEWER' | 'ADMIN';
  displayName: string;
}

interface Props {
  onAuthenticated: (user: DemoUser) => void;
}

const DEMO_USERS: Array<DemoUser & { password: string }> = [
  { id: 'demo-auditor', email: 'auditor@demo.local', password: 'audit123', role: 'AUDITOR', displayName: 'Demo Auditor' },
  { id: 'demo-reviewer', email: 'reviewer@demo.local', password: 'review123', role: 'REVIEWER', displayName: 'Demo Reviewer' },
  { id: 'demo-admin', email: 'admin@demo.local', password: 'admin123', role: 'ADMIN', displayName: 'Demo Admin' }
];

export const Auth: React.FC<Props> = ({ onAuthenticated }) => {
  const [email, setEmail] = useState('auditor@demo.local');
  const [password, setPassword] = useState('audit123');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const user = DEMO_USERS.find(candidate =>
      candidate.email === email.trim().toLowerCase() && candidate.password === password
    );

    if (!user) {
      setError('Use one of the demo accounts shown below.');
      return;
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName
    };
    localStorage.setItem('claim_shield_demo_user', JSON.stringify(sessionUser));
    onAuthenticated(sessionUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Claim-Shield</h1>
          <p className="text-xs text-slate-500 mt-1">Demo sign-in for role-based workflow testing.</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="Demo email"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="Demo password"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
          />
        </div>

        {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

        <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-brand-600 text-white text-sm font-bold">
          <LogIn className="w-4 h-4" />
          Enter demo workspace
        </button>

        <div className="border-t border-slate-100 pt-4 space-y-2">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Demo accounts</p>
          <p className="text-xs text-slate-500">Auditor: auditor@demo.local / audit123</p>
          <p className="text-xs text-slate-500">Reviewer: reviewer@demo.local / review123</p>
          <p className="text-xs text-slate-500">Admin: admin@demo.local / admin123</p>
        </div>
      </form>
    </div>
  );
};
