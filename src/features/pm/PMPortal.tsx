import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { pmSupabase } from "../../services/supabase";
import { getPMProfile, type PMProfile } from "../../services/pm";
import HomeWordmark from "../../components/brand/HomeWordmark";
import PMDashboard from "../../screens/pm/PMDashboard";
import PMCaseDetail from "../../screens/pm/PMCaseDetail";
import "./pm.css";

export default function PMPortal() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [profile, setProfile] = useState<PMProfile | null>(null);
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const { data } = pmSupabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    setProfile(null); setVerifiedToken(null); setError(false);
    if (!session) return;
    const controller = new AbortController();
    getPMProfile(session.user.id, controller.signal).then(value => {
      if (!controller.signal.aborted) { setProfile(value); setVerifiedToken(session.access_token); }
    }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [session, attempt]);
  async function signOut() {
    setSigningOut(true); setError(false);
    const { error: failure } = await pmSupabase.auth.signOut({ scope: "local" });
    setSigningOut(false);
    if (failure) setError(true);
  }
  const login = location.pathname === "/pm/login";
  let body: React.ReactNode;
  if (session === undefined) body = <p role="status">Checking your session…</p>;
  else if (!session) body = login ? <PMLogin /> : <Navigate to="/pm/login" replace state={{ from: location.pathname }} />;
  else if (error) body = <div role="alert"><p>We couldn't verify your access. Please try again.</p><button className="pm-button" onClick={() => setAttempt(a => a + 1)}>Retry</button><button className="pm-button" disabled={signingOut} onClick={signOut}>Sign out</button></div>;
  else if (verifiedToken !== session.access_token) body = <p role="status">Checking PM access…</p>;
  else if (!profile) body = <div role="alert"><h1>PM access required</h1><p>This account is not linked to a property manager.</p><button className="pm-button" disabled={signingOut} onClick={signOut}>Sign out</button></div>;
  else if (login) {
    const from = (location.state as { from?: string } | null)?.from;
    body = <Navigate to={from?.startsWith("/pm/") && from !== "/pm/login" ? from : "/pm"} replace />;
  } else return <div className="pm-portal">
    <header className="pm-topbar"><Link to="/pm" className="pm-brand"><HomeWordmark /><span>PM PORTAL</span></Link>
      <div className="pm-account"><span className="pm-avatar">{profile.name.split(" ").map(n => n[0]).join("")}</span><div><strong>{profile.name}</strong><small>{profile.agency_name}</small></div><button className="pm-button" onClick={signOut} disabled={signingOut}>{signingOut ? "Signing out…" : "Sign out"}</button></div>
    </header>
    <Routes><Route index element={<PMDashboard profile={profile} />} /><Route path="cases/:caseKey" element={<PMCaseDetail />} /><Route path="*" element={<Navigate to="/pm" replace />} /></Routes>
  </div>;
  return <div className="pm-portal pm-auth"><div className="pm-card pm-auth-card"><div className="pm-brand"><HomeWordmark /><span>PM PORTAL</span></div>{body}</div></div>;
}

function PMLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  return <form onSubmit={async e => {
    e.preventDefault(); if (pending) return;
    setPending(true); setError(false);
    try {
      const { error: failure } = await pmSupabase.auth.signInWithPassword({ email: email.trim(), password });
      setPassword(""); setError(Boolean(failure));
    } catch { setError(true); } finally { setPending(false); }
  }}><h1>Sign in</h1><p>Access your maintenance cases.</p>
    <label>Email<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} disabled={pending} /></label>
    <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} disabled={pending} /></label>
    {error && <p role="alert">Unable to sign in. Check your email and password, then try again.</p>}
    <button className="pm-button pm-primary" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
  </form>;
}
