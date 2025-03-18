import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';
import { Button } from './components/ui/button';
import App from './App';

const AuthWrapper = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    // For demo purposes, create an anonymous session
    // In production, you should implement proper authentication
    const { error } = await supabase.auth.signInWithPassword({
      email: 'dev@example.com',
      password: 'password123',
    });

    if (error) {
      console.error('Error signing in:', error);
      // If auth fails, try the anonymous route for demo
      await supabase.auth.signUp({
        email: 'dev@example.com',
        password: 'password123',
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-xl border border-white/20 shadow-2xl">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-300 mb-4" />
            <h2 className="text-xl font-bold text-white">Initializing...</h2>
            <p className="text-indigo-200 mt-2">Setting up your environment</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-xl border border-white/20 shadow-2xl max-w-md w-full">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-6">Channel-Specific Customers</h2>
            <p className="text-indigo-200 mb-8 text-center">
              To access the customer and channel management system, please sign in.
            </p>
            <Button 
              onClick={handleSignIn}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3"
            >
              Sign In / Initialize Demo
            </Button>
            <p className="text-xs text-indigo-300 mt-4 text-center">
              For demo purposes, this will create a test account automatically.
              In production, implement proper authentication.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <App />;
};

export default AuthWrapper;