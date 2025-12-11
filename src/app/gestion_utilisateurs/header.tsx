"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<any>(() => {
    try {
      const raw = typeof window !== 'undefined' ? sessionStorage.getItem('user') : null;
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  const [mounted, setMounted] = useState(false); // ✅ FIX 1
  const [showWelcome, setShowWelcome] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const router = useRouter();

  // ✅ FIX 2
  useEffect(() => {
    setMounted(true);
  }, []);

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
    <>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,width:'100%',margin:0,borderRadius:0,position:'sticky',top:0,zIndex:999,backgroundColor:'white',padding:'12px 24px',boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:36,height:36,borderRadius:18,background:'#10b981',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14}}>GB</div>
          <div style={{fontWeight:600,fontSize:16,color:'#333'}}>GreenBin</div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:16}}>
          {/* Profile Picture */}
          <img
            src="/profile_pic.png"
            alt="profile"
            style={{width:36,height:36,borderRadius:18,cursor:'pointer'}}
            onClick={() => setShowProfilePopup(s => !s)}
          />
        </div>
      </header>

      {showWelcome && user && (
        <div style={{ display:'flex', justifyContent:'center', marginTop:12, zIndex:1000 }}>
          <div style={{
            width:'min(640px, 92%)',
            background:'white',
            border:'1px solid #ccc',
            padding:16,
            borderRadius:10,
            boxShadow:'0 8px 24px rgba(0,0,0,0.12)',
            textAlign:'center'
          }}>
            <div style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>Bienvenue</div>
            <div style={{ fontSize:18 }}>
              {user.prenom} {user.nom} ({user.role})!
            </div>
          </div>
        </div>
      )}

      {showProfilePopup && user && (
        <div style={{ position:'fixed', right:16, top:60, zIndex:1000 }}>
          <div style={{
            width:300,
            background:'white',
            border:'1px solid #ccc',
            padding:12,
            borderRadius:8,
            boxShadow:'0 8px 24px rgba(0,0,0,0.12)'
          }}>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>Connecté</div>
            <div style={{ marginBottom:8 }}>{user.prenom} {user.nom}</div>
            <div style={{ marginBottom:12, color:'#666' }}>{user.role}</div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button type="button" onClick={() => setShowProfilePopup(false)} className="btn">Annuler</button>
              <button type="button" onClick={handleLogout} className="btn" style={{ background:'#dc2626', color:'#fff' }}>
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
