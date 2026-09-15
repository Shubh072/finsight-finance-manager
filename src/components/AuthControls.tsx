'use client';

import { useEffect, useState } from 'react';
import { LogIn, LogOut, ShieldCheck, UploadCloud, X } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function AuthControls() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!configured) return;
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function auth(action: 'signIn' | 'signUp') {
    if (!configured) { setMessage('Add Supabase public keys to enable login.'); return; }
    setBusy(true); setMessage('');
    const supabase = createSupabaseBrowserClient();
    const result = action === 'signIn' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
    setMessage(result.error?.message ?? (action === 'signUp' ? 'Check your email to confirm your account.' : 'Signed in.'));
    setBusy(false);
  }

  async function backup() {
    setBusy(true); setMessage('Creating encrypted backup…');
    const response = await fetch('/api/backups', { method: 'POST' });
    const result = await response.json();
    setMessage(response.ok ? `Backup saved: ${result.backup.fileName}` : result.error);
    setBusy(false);
  }

  async function signOut() { const supabase = createSupabaseBrowserClient(); await supabase.auth.signOut(); setUser(null); }

  if (!configured) return <button className="auth-pill" onClick={() => setOpen(true)}><LogIn size={14}/> Connect account</button>;
  if (user) return <div className="auth-actions"><button className="backup-btn" onClick={backup} disabled={busy}><UploadCloud size={14}/> Backup</button><button className="auth-pill" onClick={signOut}><LogOut size={14}/> {user.email?.split('@')[0]}</button></div>;
  return <><button className="auth-pill" onClick={() => setOpen(true)}><LogIn size={14}/> Sign in</button>{open && <div className="auth-overlay"><div className="auth-modal"><button className="close-auth" onClick={() => setOpen(false)}><X size={16}/></button><div className="auth-icon"><ShieldCheck size={18}/></div><div className="eyebrow">SECURE BY SUPABASE</div><h2>Keep your finances yours.</h2><p>Sign in to sync transactions and create private backups in your Supabase Storage vault.</p><input placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} type="email"/><input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password"/><button className="auth-submit" onClick={() => auth('signIn')} disabled={busy}>Sign in</button><button className="auth-secondary" onClick={() => auth('signUp')} disabled={busy}>Create account</button>{message && <div className="auth-message">{message}</div>}</div></div>}</>;
}
