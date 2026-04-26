import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { C, FD, FS, FM } from "@/lib/tokens";
import { K2Logo } from "@/components/Layout";
import { useIsMobile } from "@/hooks/useMobile";

// Only allow same-origin paths as a return target — never an external URL.
function safeNext(raw: string | null): string {
  if (!raw) return '/';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/';
  return raw;
}

export default function Auth() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<'main' | 'magic'>('main');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const isMobile = useIsMobile();

  const nextPath = safeNext(
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('next')
      : null
  );
  const redirectBack = `${window.location.origin}/auth${nextPath !== '/' ? `?next=${encodeURIComponent(nextPath)}` : ''}`;

  if (isAuthenticated) {
    setLocation(nextPath);
    return null;
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectBack },
      });
      if (error) throw error;
      setMagicSent(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectBack },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: `1px solid ${C.hairline}`, background: C.linen,
    fontFamily: FS, fontSize: 14, color: C.bark, outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 200ms',
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: FM, fontSize: 10, letterSpacing: '0.18em',
    textTransform: 'uppercase', color: C.mocha, display: 'block', marginBottom: 6,
  };

  const formPad = isMobile ? '40px 24px' : '56px 48px';

  return (
    <div style={{ background: C.linen, minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: isMobile ? '24px 16px' : '40px 20px' }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        maxWidth: 900, width: '100%', borderRadius: 24,
        overflow: 'hidden', boxShadow: '0 8px 48px rgba(43,29,20,0.10)' }}>

        {/* Brand panel — compact on mobile, full on desktop */}
        <div style={{
          flex: isMobile ? 'none' : 1,
          background: C.bark,
          padding: isMobile ? '32px 24px' : '56px 48px',
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'column',
          alignItems: isMobile ? 'center' : undefined,
          justifyContent: isMobile ? 'space-between' : 'space-between',
        }}>
          {/* Logo + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <K2Logo size={isMobile ? 20 : 24} color={C.ivory} />
            <span style={{ fontFamily: FD, fontSize: isMobile ? 14 : 16, color: C.ivory }}>K2 Coffee</span>
          </div>

          {/* Tagline — hidden on mobile to save space */}
          {!isMobile && (
            <div>
              <h2 style={{ fontFamily: FD, fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 400,
                color: C.ivory, lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: '18ch',
                margin: '0 0 20px' }}>
                The morning is worth something.
              </h2>
              <p style={{ fontFamily: FS, fontSize: 14, color: C.dust, lineHeight: 1.75, maxWidth: '38ch' }}>
                Join K2 and every cup you brew funds a named ministry partner. Not a vague cause —
                a specific name, a specific place, a specific job.
              </p>
            </div>
          )}

          {/* Stats — condensed on mobile */}
          {!isMobile ? (
            <div style={{ borderTop: `1px solid rgba(255,255,255,0.08)`, paddingTop: 28 }}>
              <div style={{ display: 'flex', gap: 32, marginBottom: 20 }}>
                {[['100%', 'Faith Driven'], ['1,847m', 'Origin']].map(([v, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: FM, fontSize: 16, color: C.crema }}>{v}</div>
                    <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.mocha, marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.mocha }}>
                Rooted in Humility. Rising with Purpose.
              </p>
            </div>
          ) : (
            <p style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.mocha }}>
              Faith Driven · 1,847m
            </p>
          )}
        </div>

        {/* Form panel */}
        <div style={{ flex: 1, background: C.ivory, padding: formPad }}>

          {mode === 'magic' && magicSent ? (
            <>
              <h1 style={{ fontFamily: FD, fontSize: isMobile ? 24 : 28, fontWeight: 400, color: C.bark, margin: '0 0 6px' }}>
                Check your inbox.
              </h1>
              <p style={{ fontFamily: FS, fontSize: 14, color: C.mocha, marginBottom: 32 }}>
                We sent a sign-in link to <strong>{email}</strong>.
              </p>
              <div style={{ background: C.linen, borderRadius: 16, padding: '24px', textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✉️</div>
                <p style={{ fontFamily: FS, fontSize: 14, color: C.mocha, lineHeight: 1.7, margin: 0 }}>
                  Click the link in your email to sign in. No password needed.
                </p>
              </div>
              <button onClick={() => { setMagicSent(false); setEmail(''); setMode('main'); }}
                style={{ width: '100%', padding: '14px', background: 'transparent', color: C.mocha,
                  border: `1px solid ${C.hairline}`, borderRadius: 9999, fontFamily: FS, fontSize: 14,
                  cursor: 'pointer', boxSizing: 'border-box' }}>
                Use a different email
              </button>
            </>

          ) : mode === 'magic' ? (
            <>
              <h1 style={{ fontFamily: FD, fontSize: isMobile ? 24 : 28, fontWeight: 400, color: C.bark, margin: '0 0 6px' }}>
                Magic link.
              </h1>
              <p style={{ fontFamily: FS, fontSize: 14, color: C.mocha, marginBottom: 32 }}>
                No password needed — we'll email you a sign-in link.
              </p>
              <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" style={inputStyle} required
                    onFocus={e => (e.target.style.borderColor = C.crema)}
                    onBlur={e => (e.target.style.borderColor = C.hairline)}/>
                </div>
                <button type="submit" disabled={loading}
                  style={{ padding: '14px', background: C.bark, color: C.ivory, border: 'none',
                    borderRadius: 9999, fontFamily: FS, fontSize: 14, fontWeight: 500,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1, transition: 'background 200ms' }}>
                  {loading ? 'Sending…' : 'Send Magic Link'}
                </button>
              </form>
              <p style={{ fontFamily: FS, fontSize: 13, color: C.mocha, textAlign: 'center', marginTop: 20 }}>
                <button onClick={() => setMode('main')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FS,
                    fontSize: 13, color: C.bark, fontWeight: 600, padding: 0, textDecoration: 'underline' }}>
                  ← Back
                </button>
              </p>
            </>

          ) : (
            <>
              <h1 style={{ fontFamily: FD, fontSize: isMobile ? 24 : 28, fontWeight: 400, color: C.bark, margin: '0 0 6px' }}>
                Welcome.
              </h1>
              <p style={{ fontFamily: FS, fontSize: 14, color: C.mocha, marginBottom: 32 }}>
                Sign in or create your account.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button onClick={handleGoogleAuth} disabled={loading}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12,
                    border: `1px solid ${C.hairline}`, background: 'white', cursor: 'pointer',
                    fontFamily: FS, fontSize: 14, color: C.bark, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 10, boxSizing: 'border-box',
                    opacity: loading ? 0.6 : 1 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                <button onClick={() => { setMode('magic'); setMagicSent(false); }} disabled={loading}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12,
                    border: `1px solid ${C.hairline}`, background: C.linen, cursor: 'pointer',
                    fontFamily: FS, fontSize: 14, color: C.bark, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 10, boxSizing: 'border-box',
                    opacity: loading ? 0.6 : 1 }}>
                  ✉️ Continue with Magic Link
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
