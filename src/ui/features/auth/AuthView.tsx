import React, { useState } from 'react';
import { Card } from '../../components/Card.tsx';
import { Input } from '../../components/Input.tsx';
import { Button } from '../../components/Button.tsx';
import { Disclaimer } from '../../components/Disclaimer.tsx';
import { ThemeToggle } from '../../theme/ThemeContext.tsx';
import { ShieldCheck, Lock, User, Mail, Check, X, Sparkles, KeyRound } from 'lucide-react';

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
  const [clientError, setClientError] = useState<string | null>(null);

  // Live password policy checks
  const ruleMinLength = password.length >= 8;
  const ruleUppercase = /[A-Z]/.test(password);
  const ruleLowercase = /[a-z]/.test(password);
  const ruleNumber = /[0-9]/.test(password);
  const ruleSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = ruleMinLength && ruleUppercase && ruleLowercase && ruleNumber && ruleSpecial;

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    const strong = 'CloudFix!' + Math.floor(1000 + Math.random() * 9000);
    setPassword(strong);
    setClientError(null);
  };

  const handleFillDemoCandidate = () => {
    const demoEmail = 'alex.architect@cloudfix.edu';
    const demoPass = 'P@ssword123!';
    const demoUser = 'alex_architect';
    const demoName = 'Alex Architect';

    setEmail(demoEmail);
    setPassword(demoPass);
    setUsername(demoUser);
    setFullName(demoName);
    setClientError(null);

    onSubmitRegister({
      email: demoEmail,
      password: demoPass,
      username: demoUser,
      fullName: demoName,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setClientError('Please enter a valid email address.');
      return;
    }

    if (mode === 'login') {
      if (!password) {
        setClientError('Please enter your password.');
        return;
      }
      onSubmitLogin({ email: trimmedEmail, password });
    } else {
      // Auto-sanitize registration payload
      const sanitizedUsername = (username.trim() || trimmedEmail.split('@')[0] || 'candidate_user').replace(/\s+/g, '_');
      const sanitizedFullName = fullName.trim() || sanitizedUsername || 'Candidate User';

      // Pre-validate password client-side for immediate user feedback
      if (!isPasswordValid) {
        const missing: string[] = [];
        if (!ruleMinLength) missing.push('at least 8 characters');
        if (!ruleUppercase) missing.push('1 uppercase letter (A-Z)');
        if (!ruleLowercase) missing.push('1 lowercase letter (a-z)');
        if (!ruleNumber) missing.push('1 digit (0-9)');
        if (!ruleSpecial) missing.push('1 special symbol (!@#$%^&*)');
        setClientError(`Password requires: ${missing.join(', ')}.`);
        return;
      }

      onSubmitRegister({
        email: trimmedEmail,
        password,
        username: sanitizedUsername,
        fullName: sanitizedFullName,
      });
    }
  };

  const activeError = clientError || errorMessage;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-mono transition-colors">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 mb-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {mode === 'login' ? 'Candidate Authentication' : 'Register Diagnostic Profile'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Zero client trust gateway with server-enforced security policies
            </p>
          </div>

          {activeError && (
            <div
              role="alert"
              className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/50 rounded-lg text-rose-800 dark:text-rose-300 text-xs font-medium space-y-1.5"
            >
              <div className="font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Security Gate Notice</span>
              </div>
              <p className="leading-relaxed">{activeError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="auth-email"
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setClientError(null);
              }}
              placeholder="candidate@cloudfix.edu"
              disabled={isLoading}
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="auth-password" className="text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-between w-full">
                  <span>Password</span>
                  {mode === 'register' && (
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-normal"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Suggest Compliant Password</span>
                    </button>
                  )}
                </label>
              </div>

              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setClientError(null);
                }}
                placeholder="••••••••••••"
                disabled={isLoading}
                className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 min-h-[44px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
              />

              {mode === 'register' && (
                <div className="p-2.5 bg-slate-100 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5 text-[11px]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">Password Requirements:</span>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <span className={`flex items-center gap-1 ${ruleMinLength ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      {ruleMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 8+ Characters
                    </span>
                    <span className={`flex items-center gap-1 ${ruleUppercase ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      {ruleUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Uppercase (A-Z)
                    </span>
                    <span className={`flex items-center gap-1 ${ruleLowercase ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      {ruleLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Lowercase (a-z)
                    </span>
                    <span className={`flex items-center gap-1 ${ruleNumber ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      {ruleNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Number (0-9)
                    </span>
                    <span className={`flex items-center gap-1 col-span-2 ${ruleSpecial ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      {ruleSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Special Symbol (!@#$%^&*)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {mode === 'register' && (
              <>
                <Input
                  id="auth-username"
                  label="Username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.replace(/\s+/g, '_'));
                    setClientError(null);
                  }}
                  helperText="Alphanumeric with underscores or dashes"
                  placeholder="cloud_architect_01"
                  disabled={isLoading}
                />
                <Input
                  id="auth-fullname"
                  label="Full Name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setClientError(null);
                  }}
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

            {mode === 'login' ? (
              <Button
                type="button"
                variant="outline"
                className="w-full text-xs text-cyan-700 dark:text-cyan-300 border-cyan-400 dark:border-cyan-700/60 hover:bg-cyan-50 dark:hover:bg-cyan-950/40"
                onClick={() => {
                  setEmail('candidate@cloudfix.edu');
                  setPassword('P@ssword123!');
                  setClientError(null);
                  onSubmitLogin({ email: 'candidate@cloudfix.edu', password: 'P@ssword123!' });
                }}
                disabled={isLoading}
              >
                ⚡ 1-Click Demo Login (Candidate: Jane Doe)
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full text-xs text-cyan-700 dark:text-cyan-300 border-cyan-400 dark:border-cyan-700/60 hover:bg-cyan-50 dark:hover:bg-cyan-950/40"
                onClick={handleFillDemoCandidate}
                disabled={isLoading}
              >
                ⚡ 1-Click Register Demo Candidate (Alex Architect)
              </Button>
            )}
          </form>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setClientError(null);
                onToggleMode();
              }}
              className="text-xs text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded px-2 py-1"
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
