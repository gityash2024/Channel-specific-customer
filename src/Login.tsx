import React, { useState, useEffect } from 'react';
import { login, getUser, initializeLocalStorage } from './lib/localStorage';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Users, Key, Copy, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  
  useEffect(() => {
    initializeLocalStorage();
  }, []);
  
  const handleLogin = () => {
    if (!email && !password) {
      setError('Please enter both email and password');
      return;
    }
    
    if (login(email || 'admin@example.com', password || 'password123')) {
      onLoginSuccess();
    } else {
      setError('Invalid email or password');
    }
  };
  
  const user = getUser();
  const demoEmail = user?.email || 'admin@example.com';
  const demoPassword = user?.password || 'password123';
  
  const copyToClipboard = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    
    if (type === 'email') {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } else {
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    }
    
    toast.success(`${type === 'email' ? 'Email' : 'Password'} copied to clipboard`);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center animate-gradient-bg">
      <Toaster position="top-right" />
      <div className="login-card p-8 rounded-xl w-full max-w-md">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-white/10 text-white">
            <Users className="w-8 h-8 glow-sm" />
          </div>
          <h2 className="text-2xl font-bold text-white glow-text mb-6">Channel-Specific Customers</h2>
          <p className="text-white mb-8 text-center high-contrast-text">
            Log in to access the customer and channel management system.
          </p>
          
          {error && (
            <div className="w-full mb-4 p-3 rounded-md bg-red-500/40 border-2 border-red-500/60 text-white text-sm font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-4 w-full">
            <div>
              <label className="text-white font-medium mb-1 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={demoEmail}
                className="search-input w-full"
              />
            </div>
            <div>
              <label className="text-white font-medium mb-1 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="search-input w-full"
              />
            </div>
            <Button 
              onClick={handleLogin}
              className="btn-primary w-full flex items-center justify-center h-10"
            >
              <Key className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
          
          <div className="mt-6 text-center text-white text-sm">
            <p className="font-semibold">Demo Credentials</p>
            <div className="mt-2 flex items-center justify-center space-x-2">
              <p className="credential-display">
                Email: {demoEmail}
              </p>
              <button 
                onClick={() => copyToClipboard(demoEmail, 'email')}
                className="copy-button"
                aria-label="Copy email"
              >
                {emailCopied ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-center space-x-2">
              <p className="credential-display">
                Password: {demoPassword}
              </p>
              <button 
                onClick={() => copyToClipboard(demoPassword, 'password')}
                className="copy-button"
                aria-label="Copy password"
              >
                {passwordCopied ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;