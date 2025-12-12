"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Only access sessionStorage on the client side
    try {
      const raw = sessionStorage.getItem('user');
      if (raw) {
        const userData = JSON.parse(raw);
        setUser(userData);
      }
    } catch (e) {
      console.error('Error reading user from sessionStorage:', e);
    }
  }, []);

  useEffect(() => {
    if (user && mounted) {
      setShowWelcome(true);
      const t = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(t);
    }
  }, [user, mounted]);

  const handleLogout = () => {
    try { 
      sessionStorage.removeItem('user'); 
    } catch (e) {}
    setShowProfilePopup(false);
    setShowWelcome(false);
    setUser(null);
    try { 
      router.push('/'); 
    } catch (e) { 
      window.location.href = '/'; 
    }
  };

  // Function to get role display text
  const getRoleDisplay = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrateur',
      'chef de tournee': 'Chef de Tournée',
      'ouvrier': 'Ouvrier',
      'responsable municipalite': 'Responsable Municipalité',
      'responsable service d\'environnement': 'Responsable Service Environnement',
      'responsable service de voirie': 'Responsable Service Voirie'
    };
    return roleMap[role] || role;
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
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
        </header>
      </div>
    );
  }

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
          
          {user && (
            <div className="header-right">
              <div className="header-user" onClick={() => setShowProfilePopup(s => !s)}>
                <div className="user-info">
                  <div className="user-name">{user.prenom} {user.nom}</div>
                  <div className="user-role">{getRoleDisplay(user.role)}</div>
                </div>
                <div className="user-avatar">
                  <img
                    src="/profile_pic.png"
                    alt="Profile"
                    className="avatar-image"
                  />
                  <div className="avatar-status"></div>
                </div>
              </div>
            </div>
          )}
        </header>
      </div>

      {/* Welcome Notification */}
      {showWelcome && user && (
        <div className="welcome-notification">
          <div className="welcome-content">
            <div className="welcome-icon">👋</div>
            <div className="welcome-text">
              <h3 className="welcome-title">Bienvenue sur GreenBin</h3>
              <p className="welcome-message">
                Bonjour <span className="user-highlight">{user.prenom} {user.nom}</span> !
                Vous êtes connecté en tant que <span className="role-highlight">{getRoleDisplay(user.role)}</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Popup */}
      {showProfilePopup && user && (
        <div className="profile-popup-overlay" onClick={() => setShowProfilePopup(false)}>
          <div className="profile-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <div className="popup-avatar">
                <img
                  src="/profile_pic.png"
                  alt="Profile"
                  className="popup-avatar-image"
                />
                <div className="popup-avatar-status"></div>
              </div>
              <div className="popup-user-info">
                <h3 className="popup-user-name">{user.prenom} {user.nom}</h3>
                <div className="popup-user-role">{getRoleDisplay(user.role)}</div>
                <div className="popup-user-id">ID: {user.id}</div>
              </div>
            </div>
            
            <div className="popup-details">
              <div className="detail-item">
                <div className="detail-label">Statut</div>
                <div className="detail-value">
                  <span className="status-badge active">Actif</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Disponibilité</div>
                <div className="detail-value">
                  <span className="availability-badge available">Disponible</span>
                </div>
              </div>
            </div>
            
            <div className="popup-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowProfilePopup(false)}
              >
                Fermer
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={handleLogout}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Header Styles */
        .header-container {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header {
          max-width: 100%;
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
          position: relative;
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

        .user-role {
          font-size: 12px;
          color: #10b981;
          font-weight: 500;
          margin: 2px 0 0 0;
          text-transform: capitalize;
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

        /* Welcome Notification */
        .welcome-notification {
          position: fixed;
          top: 92px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          width: min(640px, 92%);
          animation: slideDown 0.5s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .welcome-content {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.15);
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .welcome-icon {
          font-size: 40px;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0fdf4;
          border-radius: 12px;
          color: #10b981;
          flex-shrink: 0;
        }

        .welcome-text {
          flex-grow: 1;
        }

        .welcome-title {
          font-size: 20px;
          font-weight: 700;
          color: #047857;
          margin: 0 0 8px 0;
        }

        .welcome-message {
          font-size: 16px;
          color: #4a5568;
          margin: 0;
          line-height: 1.5;
        }

        .user-highlight {
          font-weight: 600;
          color: #2d3748;
        }

        .role-highlight {
          font-weight: 600;
          color: #10b981;
          text-transform: capitalize;
        }

        /* Profile Popup */
        .profile-popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          z-index: 10000;
          padding-top: 80px;
          padding-right: 24px;
          backdrop-filter: blur(4px);
        }

        .profile-popup {
          width: 360px;
          background: white;
          border: 1px solid #e2e8f0;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.2);
          animation: popIn 0.3s ease-out;
        }

        @keyframes popIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .popup-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .popup-avatar {
          position: relative;
        }

        .popup-avatar-image {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          object-fit: cover;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .popup-avatar-status {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #10b981;
          border: 2px solid white;
        }

        .popup-user-info {
          flex-grow: 1;
        }

        .popup-user-name {
          font-size: 20px;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 4px 0;
        }

        .popup-user-role {
          font-size: 14px;
          color: #10b981;
          font-weight: 600;
          margin: 0 0 4px 0;
          text-transform: capitalize;
        }

        .popup-user-id {
          font-size: 12px;
          color: #718096;
          font-weight: 500;
        }

        .popup-details {
          margin-bottom: 24px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
        }

        .detail-item:not(:last-child) {
          border-bottom: 1px solid #f1f5f9;
        }

        .detail-label {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .detail-value {
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
        }

        .status-badge, .availability-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge.active {
          background: #f0fdf4;
          color: #10b981;
          border: 1px solid #a7f3d0;
        }

        .availability-badge.available {
          background: #f0f9ff;
          color: #0369a1;
          border: 1px solid #bae6fd;
        }

        .popup-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.3s ease;
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
        }

        .btn-secondary:hover {
          background: #e2e8f0;
          transform: translateY(-1px);
        }

        .btn-danger {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
        }

        .btn-danger:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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
          
          .user-role {
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
          
          .welcome-notification {
            top: 76px;
          }
          
          .welcome-content {
            padding: 16px;
            gap: 16px;
          }
          
          .welcome-icon {
            width: 48px;
            height: 48px;
            font-size: 32px;
          }
          
          .welcome-title {
            font-size: 18px;
          }
          
          .welcome-message {
            font-size: 14px;
          }
          
          .profile-popup-overlay {
            padding: 0;
            align-items: center;
            justify-content: center;
          }
          
          .profile-popup {
            width: 90%;
            max-width: 320px;
            margin: 16px;
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
          
          .popup-header {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }
          
          .popup-actions {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}