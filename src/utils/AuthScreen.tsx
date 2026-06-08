import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Mail, Lock, ArrowRight, Shield, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (session: any) => void;
  onBypass?: () => void;
}

export function AuthScreen({ onAuthSuccess, onBypass }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isConfigured = isSupabaseConfigured();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          // Supabase config check if auto-confirmed or email verification required
          if (data.session) {
            setSuccessMsg('Account registered successfully! Logging you in...');
            setTimeout(() => {
              onAuthSuccess(data.session);
            }, 1500);
          } else {
            setSuccessMsg('Registration successful! Please check your email inbox to verify your account.');
            // Clear inputs
            setEmail('');
            setPassword('');
            setConfirmPassword('');
          }
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data.session) {
          setSuccessMsg('Logged in successfully! Redirecting...');
          setTimeout(() => {
            onAuthSuccess(data.session);
          }, 1000);
        } else {
          setErrorMsg('An unexpected login error occurred. Please try again.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred triggering Google SSO.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Decorative blurred backgrounds */}
      <div style={styles.glowBlob1} />
      <div style={styles.glowBlob2} />

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <Shield size={28} style={styles.logoIcon} />
          </div>
          <h1 style={styles.title}>Pricing Intelligence</h1>
          <p style={styles.subtitle}>Operating System (PIOS)</p>
        </div>

        {/* Tab Selection */}
        <div style={styles.tabsContainer}>
          <button
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            style={{
              ...styles.tabButton,
              ...(isSignUp ? {} : styles.tabActive),
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            style={{
              ...styles.tabButton,
              ...(isSignUp ? styles.tabActive : {}),
            }}
          >
            Create Account
          </button>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div style={styles.errorAlert}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={styles.successAlert}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...styles.input, paddingRight: '42px' }}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#cbd5e1')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={16} style={styles.inputIcon} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ ...styles.input, paddingRight: '42px' }}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#cbd5e1')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? (
              <span style={styles.loadingSpinner}>Loading...</span>
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Divider if Google SSO is enabled */}
        {isConfigured && (
          <>
            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>or continue with</span>
              <span style={styles.dividerLine}></span>
            </div>

            {/* Google SSO Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              style={styles.ssoButton}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Sign in with Google SSO</span>
            </button>
          </>
        )}

      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    background: 'radial-gradient(ellipse at bottom, #1e293b 0%, #0f172a 100%)',
    fontFamily: "'Inter', sans-serif",
    zIndex: 99999,
    overflowY: 'auto',
    padding: '40px 20px',
    boxSizing: 'border-box',
  },
  glowBlob1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(79, 124, 255, 0.15) 0%, rgba(79, 124, 255, 0) 70%)',
    top: '-10%',
    left: '-10%',
    pointerEvents: 'none',
  },
  glowBlob2: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0) 70%)',
    bottom: '-20%',
    right: '-10%',
    pointerEvents: 'none',
  },
  card: {
    margin: 'auto',
    position: 'relative',
    width: '100%',
    maxWidth: '440px',
    padding: '40px',
    background: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    boxSizing: 'border-box',
    animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #4F7CFF 0%, #3a63db 100%)',
    boxShadow: '0 8px 16px -4px rgba(79, 124, 255, 0.4)',
    marginBottom: '8px',
  },
  logoIcon: {
    color: '#ffffff',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.025em',
  },
  subtitle: {
    fontSize: '0.88rem',
    color: '#94a3b8',
    margin: 0,
    fontWeight: 500,
  },
  tabsContainer: {
    display: 'flex',
    padding: '4px',
    background: 'rgba(255, 255, 255, 0.04)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  tabButton: {
    flex: 1,
    padding: '10px 0',
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    color: '#fca5a5',
    fontSize: '0.82rem',
    lineHeight: '1.4',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 16px',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '12px',
    color: '#a7f3d0',
    fontSize: '0.82rem',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: 500,
    color: '#cbd5e1',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#64748b',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 16px 12px 42px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.25s ease',
    boxSizing: 'border-box',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 0',
    background: '#4F7CFF',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.92rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    marginTop: '6px',
  },
  loadingSpinner: {
    display: 'inline-block',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '8px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  ssoButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px 0',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  ssoIcon: {
    color: '#ffffff',
  },
  eyeButton: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    outline: 'none',
    transition: 'color 0.2s',
  },
};
