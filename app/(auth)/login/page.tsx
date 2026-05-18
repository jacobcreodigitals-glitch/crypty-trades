'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (response.error) {
      setError(response.error.message);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Crypty Trades</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">Secure crypto trade tracking</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Sign in or create an account to manage your trades with Supabase.
          </p>
        </div>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>{isSignUp ? 'Create an account' : 'Sign in to continue'}</CardTitle>
            <CardDescription>
              Use your email and password to access your trade dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="********"
                />
              </div>
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="submit" disabled={loading} isLoading={loading} className="w-full sm:w-auto">
                  {isSignUp ? 'Create account' : 'Sign in'}
                </Button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-slate-300 underline-offset-4 transition hover:text-white"
                >
                  {isSignUp ? 'Have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
