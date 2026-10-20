import React, { useState } from 'react';
import { AuthView } from './AuthView.tsx';
import { useAuth } from '../../hooks/useAuth.ts';

export interface AuthScreenProps {
  onAuthenticated?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { login, register, isLoggingIn, isRegistering, loginError, registerError } = useAuth();

  const handleLogin = async (creds: { email: string; password: string }) => {
    try {
      await login(creds);
      onAuthenticated?.();
    } catch {
      // Error handled via hook state
    }
  };

  const handleRegister = async (data: {
    email: string;
    password: string;
    username: string;
    fullName: string;
  }) => {
    try {
      await register(data);
      onAuthenticated?.();
    } catch {
      // Error handled via hook state
    }
  };

  return (
    <AuthView
      mode={mode}
      onToggleMode={() => setMode((prev) => (prev === 'login' ? 'register' : 'login'))}
      onSubmitLogin={handleLogin}
      onSubmitRegister={handleRegister}
      isLoading={isLoggingIn || isRegistering}
      errorMessage={mode === 'login' ? loginError : registerError}
    />
  );
};
