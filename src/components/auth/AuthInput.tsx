import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Unlock } from 'lucide-react';

export const AuthInput: React.FC = () => {
  const { isAuthenticated, authenticate, logout } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authenticate(inputValue);
    setInputValue('');
    setShowInput(false);
  };

  const handleLogout = () => {
    logout();
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-green-600">
          <Unlock size={16} />
          <span className="text-sm font-medium">Authenticated</span>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          Logout
        </button>
      </div>
    );
  }

  if (showInput) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter access code"
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          autoFocus
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={() => setShowInput(false)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <Lock size={16} />
      <span>Access Data</span>
    </button>
  );
};