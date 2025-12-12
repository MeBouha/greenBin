import React from 'react';

interface WelcomeProps {
  onSelectService: (service: string) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onSelectService }) => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-header">
          <div className="welcome-brand">
            <div className="welcome-logo">GB</div>
            <div className="welcome-brand-text">
              <h1 className="welcome-title">GreenBin</h1>
              <p className="welcome-subtitle">Municipal Services Platform</p>
            </div>
          </div>
          
          <div className="welcome-hero">
            <h2 className="welcome-hero-title">
              Bienvenue sur <span className="highlight">GreenBin</span>
            </h2>
            <p className="welcome-hero-subtitle">
              Votre plateforme unique pour tous les services municipaux
            </p>
            <p className="welcome-description">
              Connectez-vous à une ville plus intelligente, plus propre et plus verte. 
              Gérez vos interactions municipales en toute simplicité.
            </p>
          </div>
        </div>

        <div className="services-section">
          <div className="section-header">
            <h3 className="section-title">Nos Services Municipaux</h3>
            <p className="section-subtitle">Choisissez un service pour commencer</p>
          </div>

          <div className="services-grid">
            {/* Service Propreté - Active */}
            <div 
              className="service-card active"
              onClick={() => onSelectService('service_proprete')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectService('service_proprete');
                }
              }}
            >
              <div className="service-card-inner">
                <div className="service-icon-wrapper">
                  <div className="service-icon">♻️</div>
                  <div className="service-badge">Disponible</div>
                </div>
                
                <div className="service-content">
                  <h4 className="service-title">Service Propreté</h4>
                  <p className="service-description">
                    Gestion des déchets, nettoyage urbain, points de collecte, 
                    tournées de ramassage et signalements.
                  </p>
                  
                  <div className="service-features">
                    <span className="feature-tag">🗑️ Points de collecte</span>
                    <span className="feature-tag">🚛 Tournées</span>
                    <span className="feature-tag">📝 Réclamations</span>
                  </div>
                </div>
                
                <div className="service-action">
                  <span className="action-text">Accéder</span>
                  <div className="action-arrow">→</div>
                </div>
              </div>
              
              <div className="service-hover-effect"></div>
            </div>

            {/* Service Administratif - Coming Soon */}
            <div className="service-card coming-soon">
              <div className="service-card-inner">
                <div className="service-icon-wrapper">
                  <div className="service-icon">📋</div>
                  <div className="service-badge">Bientôt</div>
                </div>
                
                <div className="service-content">
                  <h4 className="service-title">Service Administratif</h4>
                  <p className="service-description">
                    Documents administratifs, certificats, permis, 
                    et procédures en ligne.
                  </p>
                  
                  <div className="service-features">
                    <span className="feature-tag">📄 Documents</span>
                    <span className="feature-tag">🏛️ Permis</span>
                    <span className="feature-tag">📋 Formulaires</span>
                  </div>
                </div>
                
                <div className="service-action">
                  <span className="action-text">Prochainement</span>
                  <div className="coming-soon-icon">⏳</div>
                </div>
              </div>
            </div>

            {/* Service Citoyen - Coming Soon */}
            <div className="service-card coming-soon">
              <div className="service-card-inner">
                <div className="service-icon-wrapper">
                  <div className="service-icon">👥</div>
                  <div className="service-badge">Bientôt</div>
                </div>
                
                <div className="service-content">
                  <h4 className="service-title">Service Citoyen</h4>
                  <p className="service-description">
                    Relations citoyennes, consultations publiques, 
                    et participation à la vie municipale.
                  </p>
                  
                  <div className="service-features">
                    <span className="feature-tag">🗳️ Consultations</span>
                    <span className="feature-tag">💬 Suggestions</span>
                    <span className="feature-tag">👥 Communauté</span>
                  </div>
                </div>
                
                <div className="service-action">
                  <span className="action-text">Prochainement</span>
                  <div className="coming-soon-icon">⏳</div>
                </div>
              </div>
            </div>

            {/* Service Urbanisme - Coming Soon */}
            <div className="service-card coming-soon">
              <div className="service-card-inner">
                <div className="service-icon-wrapper">
                  <div className="service-icon">🏙️</div>
                  <div className="service-badge">Bientôt</div>
                </div>
                
                <div className="service-content">
                  <h4 className="service-title">Service Urbanisme</h4>
                  <p className="service-description">
                    Planification urbaine, aménagement du territoire, 
                    et projets de développement.
                  </p>
                  
                  <div className="service-features">
                    <span className="feature-tag">🗺️ Plans</span>
                    <span className="feature-tag">🏗️ Projets</span>
                    <span className="feature-tag">🌳 Aménagement</span>
                  </div>
                </div>
                
                <div className="service-action">
                  <span className="action-text">Prochainement</span>
                  <div className="coming-soon-icon">⏳</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="welcome-footer">
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Disponibilité</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">100%</div>
              <div className="stat-label">Numérique</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">Éco</div>
              <div className="stat-label">Responsable</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .welcome-container {
          width: 100%;
          position: relative;
          overflow: hidden;
          background: transparent;
        }

        .welcome-content {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          padding: 40px 24px;
        }

        .welcome-header {
          margin-bottom: 60px;
        }

        .welcome-brand {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 40px;
        }

        .welcome-logo {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 24px;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
        }

        .welcome-brand-text {
          display: flex;
          flex-direction: column;
        }

        .welcome-title {
          font-size: 32px;
          font-weight: 800;
          color: #047857;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .welcome-subtitle {
          font-size: 14px;
          color: #10b981;
          font-weight: 500;
          margin: 4px 0 0 0;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .welcome-hero {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .welcome-hero-title {
          font-size: 56px;
          font-weight: 800;
          color: #1a202c;
          margin: 0 0 20px 0;
          line-height: 1.1;
          letter-spacing: -1px;
        }

        .welcome-hero-title .highlight {
          background: linear-gradient(90deg, #10b981, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .welcome-hero-subtitle {
          font-size: 22px;
          color: #4a5568;
          font-weight: 500;
          margin: 0 0 24px 0;
          line-height: 1.4;
        }

        .welcome-description {
          font-size: 18px;
          color: #718096;
          line-height: 1.6;
          margin: 0 auto;
          max-width: 600px;
        }

        /* Services Section */
        .services-section {
          margin-bottom: 60px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .section-title {
          font-size: 36px;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 12px 0;
        }

        .section-subtitle {
          font-size: 16px;
          color: #718096;
          margin: 0;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .service-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 2px;
          position: relative;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .service-card.active {
          cursor: pointer;
        }

        .service-card.coming-soon {
          opacity: 0.8;
          cursor: not-allowed;
        }

        .service-card.active:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 48px rgba(16, 185, 129, 0.15);
          border-color: #10b981;
        }

        .service-card-inner {
          background: white;
          border-radius: 18px;
          padding: 24px;
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .service-hover-effect {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 1;
        }

        .service-card.active:hover .service-hover-effect {
          opacity: 0.05;
        }

        .service-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .service-icon {
          font-size: 40px;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0fdf4;
          border-radius: 12px;
          color: #10b981;
          transition: all 0.3s ease;
        }

        .service-card.active:hover .service-icon {
          transform: scale(1.1) rotate(5deg);
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          color: white;
        }

        .service-badge {
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .service-card.active .service-badge {
          background: #10b981;
          color: white;
        }

        .service-card.coming-soon .service-badge {
          background: #e2e8f0;
          color: #718096;
        }

        .service-content {
          flex-grow: 1;
          margin-bottom: 20px;
        }

        .service-title {
          font-size: 20px;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 12px 0;
          transition: color 0.3s ease;
        }

        .service-card.active:hover .service-title {
          color: #047857;
        }

        .service-description {
          font-size: 14px;
          color: #718096;
          line-height: 1.5;
          margin: 0 0 16px 0;
        }

        .service-features {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .feature-tag {
          font-size: 12px;
          padding: 4px 8px;
          background: #f7fafc;
          border-radius: 6px;
          color: #4a5568;
          border: 1px solid #e2e8f0;
        }

        .service-card.active:hover .feature-tag {
          background: #f0fdf4;
          border-color: #10b981;
          color: #047857;
        }

        .service-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          margin-top: auto;
        }

        .action-text {
          font-size: 14px;
          font-weight: 600;
          color: #4a5568;
          transition: color 0.3s ease;
        }

        .service-card.active:hover .action-text {
          color: #10b981;
        }

        .action-arrow {
          font-size: 20px;
          color: #cbd5e0;
          transition: all 0.3s ease;
        }

        .service-card.active:hover .action-arrow {
          color: #10b981;
          transform: translateX(8px);
        }

        .coming-soon-icon {
          font-size: 20px;
          color: #cbd5e0;
        }

        /* Footer Stats */
        .welcome-footer {
          text-align: center;
          padding-top: 40px;
        }

        .stats-container {
          display: flex;
          justify-content: center;
          gap: 48px;
          flex-wrap: wrap;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: #10b981;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .welcome-content {
            padding: 32px 20px;
          }
          
          .welcome-hero-title {
            font-size: 40px;
          }
          
          .welcome-hero-subtitle {
            font-size: 18px;
          }
          
          .welcome-description {
            font-size: 16px;
          }
          
          .section-title {
            font-size: 28px;
          }
          
          .services-grid {
            grid-template-columns: 1fr;
          }
          
          .stat-value {
            font-size: 24px;
          }
          
          .welcome-logo {
            width: 50px;
            height: 50px;
            font-size: 20px;
          }
          
          .welcome-title {
            font-size: 28px;
          }
        }

        @media (max-width: 480px) {
          .welcome-content {
            padding: 24px 16px;
          }
          
          .welcome-hero-title {
            font-size: 32px;
          }
          
          .welcome-hero-subtitle {
            font-size: 16px;
          }
          
          .welcome-title {
            font-size: 24px;
          }
          
          .welcome-logo {
            width: 48px;
            height: 48px;
            font-size: 18px;
          }
          
          .service-card-inner {
            padding: 20px;
          }
          
          .service-icon {
            width: 56px;
            height: 56px;
            font-size: 36px;
          }
          
          .services-grid {
            gap: 16px;
          }
          
          .stats-container {
            gap: 32px;
          }
        }
      `}</style>
    </div>
  );
};

export default Welcome;