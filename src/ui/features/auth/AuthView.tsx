import React, { useState } from 'react';
import { Card } from '../../components/Card.tsx';
import { Input } from '../../components/Input.tsx';
import { Button } from '../../components/Button.tsx';
import { Disclaimer } from '../../components/Disclaimer.tsx';
import { ShieldCheck, Lock, User, Mail } from 'lucide-react';

export interface AuthViewProps {
  mode: 'login' | 'register';
  onToggleMode: () => void;
  onSubmitLogin: (creds: { email: string; password: string }) => Promise<void>;
  onSubmitRegister: (data: { email: string; password: string; username: string; fullName: string }) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

export const AuthView: React.FC<AuthViewProps> = ({
  mode,
  onToggleMode,
  onSubmitLogin,
  onSubmitRegister,
  isLoading,
  errorMessage,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      onSubmitLogin({ email, password });
    } else {
      onSubmitRegister({ email, password, username, fullName });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-mono">
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900 border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              {mode === 'login' ? 'Candidate Authentication' : 'Register Diagnostic Profile'}
            </h1>
            <p className="text-xs text-slate-400">
              Zero client trust gateway with server-enforced security policies
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-lg text-rose-300 text-xs font-medium space-y-1"
            >
              <div className="font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Security Gate Notice</span>
              </div>
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="auth-email"
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@cloudfix.edu"
              disabled={isLoading}
            />

            <Input
              id="auth-password"
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText={
                mode === 'register'
                  ? 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special symbol'
                  : undefined
              }
              placeholder="••••••••••••"
              disabled={isLoading}
            />

            {mode === 'register' && (
              <>
                <Input
                  id="auth-username"
                  label="Username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="cloud_architect_01"
                  disabled={isLoading}
                />
                <Input
                  id="auth-fullname"
                  label="Full Name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  disabled={isLoading}
                />
              </>
            )}

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {mode === 'login' ? 'Authenticate Session' : 'Create Candidate Profile'}
            </Button>

            {mode === 'login' && (
              <Button
                type="button"
                variant="outline"
                className="w-full text-xs text-cyan-300 border-cyan-700/60 hover:bg-cyan-950/40"
                onClick={() => {
                  setEmail('candidate@cloudfix.edu');
                  setPassword('P@ssword123!');
                  onSubmitLogin({ email: 'candidate@cloudfix.edu', password: 'P@ssword123!' });
                }}
                disabled={isLoading}
              >
                ⚡ 1-Click Demo Login (Candidate: Jane Doe)
              </Button>
            )}
          </form>

          <div className="border-t border-slate-800 pt-4 text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-2 py-1"
            >
              {mode === 'login'
                ? "Don't have an account? Register new candidate"
                : 'Already registered? Return to candidate login'}
            </button>
          </div>
        </Card>
      </main>

      <Disclaimer />
    </div>
  );
};
