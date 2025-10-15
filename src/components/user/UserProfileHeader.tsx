import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { ChevronDown, Settings, LogOut } from 'lucide-react';

interface UserProfileHeaderProps {
  user: User | null;
  onSignOut: () => void;
  onProfileClick?: () => void;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  user,
  onSignOut,
  onProfileClick
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const userInitials = user.email?.charAt(0).toUpperCase() || 'U';
  const userName = user.email?.split('@')[0] || 'User';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {userInitials}
        </div>
        <div className="hidden text-left md:block">
          <p className="text-sm font-semibold text-slate-800">{userName}</p>
          <p className="text-xs text-slate-500 truncate max-w-32">{user.email}</p>
        </div>
        <ChevronDown size={16} className="text-slate-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20 border border-slate-200">
            <button
              onClick={() => {
                onProfileClick?.();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Settings size={16} />
              Profile Settings
            </button>
            <button
              onClick={() => {
                onSignOut();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};