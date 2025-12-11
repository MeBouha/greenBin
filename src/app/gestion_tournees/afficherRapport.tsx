"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RapportPage from "./creerRapport";

export default function Page() {
    const [user, setUser] = useState<any>(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showProfilePopup, setShowProfilePopup] = useState(false);
    const router = useRouter();

    // Read user from sessionStorage on mount only
    useEffect(() => {
      try {
        const raw = sessionStorage.getItem('user');
        if (raw) {
          setUser(JSON.parse(raw));
        }
      } catch (e) {
        console.error('Failed to load user:', e);
      }
    }, []);

    // Show welcome banner when user is loaded
    useEffect(() => {
      if (user) {
        setShowWelcome(true);
        const t = setTimeout(() => setShowWelcome(false), 3000);
        return () => clearTimeout(t);
      }
    }, [user]);

  const handleLogout = () => {
    try { sessionStorage.removeItem('user'); } catch (e) {}
    setShowProfilePopup(false);
    setShowWelcome(false);
    setUser(null);
    try { router.push('/'); } catch (e) { window.location.href = '/'; }
  };
  return (
    <div>
      <header className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:36,height:36,borderRadius:18,background:'#10b981',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>GB</div>
          <div style={{fontWeight:600}}>GreenBin</div>
        </div>
        <div style={{fontWeight:600}}>Dashboard {user ? (user.role || '') : ''}</div>
        <div>
          <img
            src="/profile_pic.png"
            alt="profile"
            style={{width:36,height:36,borderRadius:18,cursor:'pointer'}}
            onClick={() => setShowProfilePopup(s => !s)}
          />
        </div>
      </header>
      {/* profile popup (logout) shown only when clicking the profile image */}
      {showProfilePopup && user && (
        <div style={{ position: 'fixed', right: 16, top: 60, zIndex: 1000 }}>
          <div style={{
            width: 300,
            background: 'white',
            border: '1px solid #ccc',
            padding: 12,
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Connecté</div>
            <div style={{ marginBottom: 8 }}>{user.prenom} {user.nom}</div>
            <div style={{ marginBottom: 12, color: '#666' }}>{user.role}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowProfilePopup(false)} className="btn">Annuler</button>
              <button type="button" onClick={handleLogout} className="btn" style={{ background: '#dc2626', color: '#fff' }}>Se déconnecter</button>
            </div>
          </div>
        </div>
      )}
  <RapportPage />
    </div>
);
}