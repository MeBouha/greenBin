"use client";
  
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Tournee from '../gestion_tournees/tournee';
export default function Citoyen() {
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [AuthComponent, setAuthComponent] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const services = [
    { img: '/icons/service_proprete.png', alt: 'service propreté', label: 'service propreté' },
    { img: '/icons/service_administratif.png', alt: 'service administratif', label: 'service administratif' },
    { img: '/icons/Service_citoyen.png', alt: 'service citoyen', label: 'service citoyen' },
    { img: '/icons/service_urbanisme.png', alt: 'service urbanisme', label: 'service urbanisme' },
  ];
  return (
    <>
      <header className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:36,height:36,borderRadius:18,background:'#10b981',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>GB</div>
          <div style={{fontWeight:600}}>GreenBin</div>
        </div>
        <div>
          <img
            src="/profile_pic.png"
            alt="profile"
            style={{width:36,height:36,borderRadius:18,cursor:'pointer'}}
            onClick={() => {
              setShowAuth(true);
              if (!AuthComponent) {
                import('./auth').then((m: any) => setAuthComponent(() => (m.default ?? m.AuthPage ?? m))).catch(() => {});
              }
            }}
          />
        </div>
      </header>

      {/* render auth form inline when requested */}
      {showAuth && (
        <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.4)',zIndex:2000}}>
          <div style={{width:'min(900px,96%)',maxHeight:'90vh',overflow:'auto',background:'#fff',borderRadius:8,padding:12}}>
            {AuthComponent ? <AuthComponent onClose={() => setShowAuth(false)} /> : <div>Loading...</div>}
          </div>
        </div>
      )}
      <main style={{ padding: 20 }}>
        <section style={{ width: '100%', maxWidth: 1100, margin: '0 auto', padding: '24px 0' }}>
          {selectedService === 'service_proprete' ? (
            <div>
              <Tournee />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 40, alignItems: 'start', justifyItems: 'center' }}>
              {services.map((s) => (
                <div
                  key={s.img}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: s.img.includes('service_proprete') ? 'pointer' : 'default' }}
                  onClick={() => s.img.includes('service_proprete') && setSelectedService('service_proprete')}
                  role={s.img.includes('service_proprete') ? 'button' : undefined}
                  tabIndex={s.img.includes('service_proprete') ? 0 : undefined}
                  onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && s.img.includes('service_proprete')) setSelectedService('service_proprete'); }}
                >
                  <div style={{ width: 80, height: 80, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.03)', marginBottom: 12 }}>
                    <img src={s.img} alt={s.alt} style={{ width: 36, height: 36, objectFit: 'contain' }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
