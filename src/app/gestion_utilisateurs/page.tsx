"use client";
  
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Tournee from '../gestion_tournees/tournee';
import Footer from './footer';
import Welcome from './welcome';

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
      <div className="header-container">
        <header className="header">
          <div className="header-left">
            <div className="header-logo">
              <div className="logo-icon">GB</div>
              <div className="logo-text">
                <h1 className="logo-title">GreenBin</h1>
                <p className="logo-subtitle">Municipal Services</p>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <div className="header-user">
              <div className="user-info">
                <div className="user-name">Citoyen</div>
                <div className="user-status">Connecté</div>
              </div>
              <div 
                className="user-avatar"
                onClick={() => {
                  setShowAuth(true);
                  if (!AuthComponent) {
                    import('./auth').then((m: any) => setAuthComponent(() => (m.default ?? m.AuthPage ?? m))).catch(() => {});
                  }
                }}
              >
                <img
                  src="/profile_pic.png"
                  alt="Profile"
                  className="avatar-image"
                />
                <div className="avatar-status"></div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* render auth form inline when requested */}
      {showAuth && (
        <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.4)',zIndex:2000}}>
          <div style={{width:'min(900px,96%)',maxHeight:'90vh',overflow:'auto',background:'#fff',borderRadius:8,padding:12}}>
            {AuthComponent ? <AuthComponent onClose={() => setShowAuth(false)} /> : <div>Loading...</div>}
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <main style={{ minHeight: 'calc(100vh - 200px)' }}>
        {!selectedService ? (
          <Welcome onSelectService={setSelectedService} />
        ) : (
          <div style={{ padding: 20 }}>
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
          </div>
        )}
      </main>
      
      {/* Footer - Always shows at the bottom */}
      <Footer />

      <style jsx>{`
        .header-container {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-left {
          display: flex;
          align-items: center;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
          transition: all 0.3s ease;
        }

        .header-logo:hover .logo-icon {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-size: 24px;
          font-weight: 800;
          color: #047857;
          margin: 0;
          letter-spacing: -0.5px;
          line-height: 1;
        }

        .logo-subtitle {
          font-size: 12px;
          color: #10b981;
          font-weight: 500;
          margin: 4px 0 0 0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .header-right {
          display: flex;
          align-items: center;
        }

        .header-user {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 8px 16px;
          border-radius: 12px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .header-user:hover {
          background: #f0fdf4;
        }

        .user-info {
          text-align: right;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
          margin: 0;
        }

        .user-status {
          font-size: 12px;
          color: #10b981;
          font-weight: 500;
          margin: 2px 0 0 0;
        }

        .user-avatar {
          position: relative;
        }

        .avatar-image {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          object-fit: cover;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .header-user:hover .avatar-image {
          transform: scale(1.05);
          border-color: #10b981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .avatar-status {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #10b981;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header {
            padding: 0 16px;
            height: 64px;
          }
          
          .logo-icon {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }
          
          .logo-title {
            font-size: 20px;
          }
          
          .logo-subtitle {
            font-size: 10px;
          }
          
          .user-name {
            font-size: 13px;
          }
          
          .user-status {
            font-size: 11px;
          }
          
          .avatar-image {
            width: 40px;
            height: 40px;
          }
          
          .header-user {
            gap: 12px;
            padding: 6px 12px;
          }
        }

        @media (max-width: 480px) {
          .logo-subtitle {
            display: none;
          }
          
          .user-info {
            display: none;
          }
          
          .header-user {
            padding: 8px;
          }
        }
      `}</style>
    </>
  );
}