import React, { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative">
        {mode === 'login' ? (
          <LoginForm 
            onSwitchToSignUp={() => setMode('signup')} 
            onClose={onClose} 
          />
        ) : (
          <SignUpForm 
            onSwitchToLogin={() => setMode('login')} 
            onClose={onClose} 
          />
        )}
      </div>
    </div>
  );
};
