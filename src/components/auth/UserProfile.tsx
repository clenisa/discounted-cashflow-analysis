import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:block text-sm font-medium">
          {user.email}
        </span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.email}</p>
            <p className="text-xs text-gray-500">Signed in</p>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};