import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-section brand-section">
          <div className="footer-brand">
            <div className="footer-logo">
              <span>GB</span>
            </div>
            <div className="footer-brand-info">
              <h3 className="footer-title">GreenBin</h3>
              <p className="footer-tagline">Ville plus propre, Futur plus vert</p>
            </div>
          </div>
          <p className="footer-description">
            Nous travaillons ensemble pour créer un environnement urbain plus propre et plus durable. 
            Votre contribution fait la différence.
          </p>
          <div className="footer-social">
            <a href="#" className="social-link" aria-label="Facebook">
              <div className="social-icon-wrapper">
                <div className="social-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </div>
              </div>
              <span className="social-text">Facebook</span>
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              <div className="social-icon-wrapper">
                <div className="social-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </div>
              </div>
              <span className="social-text">Instagram</span>
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <div className="social-icon-wrapper">
                <div className="social-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                  </svg>
                </div>
              </div>
              <span className="social-text">Twitter</span>
            </a>
          </div>
        </div>

        {/* Services Section */}
        <div className="footer-section">
          <h4 className="footer-subtitle">Nos Services</h4>
          <div className="footer-links-grid">
            <div className="footer-link-container">
              <Link href="/services/proprete" className="footer-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="link-content">
                  <div className="link-icon">♻️</div>
                  <span className="link-text">Service Propreté</span>
                </div>
              </Link>
            </div>
            <div className="footer-link-container">
              <Link href="/services/administratif" className="footer-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="link-content">
                  <div className="link-icon">📋</div>
                  <span className="link-text">Service Administratif</span>
                </div>
              </Link>
            </div>
            <div className="footer-link-container">
              <Link href="/services/citoyen" className="footer-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="link-content">
                  <div className="link-icon">👥</div>
                  <span className="link-text">Service Citoyen</span>
                </div>
              </Link>
            </div>
            <div className="footer-link-container">
              <Link href="/services/urbanisme" className="footer-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="link-content">
                  <div className="link-icon">🏙️</div>
                  <span className="link-text">Service Urbanisme</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="footer-section">
          <h4 className="footer-subtitle">Liens Rapides</h4>
          <div className="footer-links-grid">
            <div className="footer-link-container">
              <Link href="/reclamations" className="footer-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="link-content">
                  <div className="link-icon">📝</div>
                  <span className="link-text">Déposer une réclamation</span>
                </div>
              </Link>
            </div>
            <div className="footer-link-container">
              <Link href="/tournees" className="footer-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="link-content">
                  <div className="link-icon">🚛</div>
                  <span className="link-text">Suivre les tournées</span>
                </div>
              </Link>
            </div>
            <div className="footer-link-container">
              <Link href="/points-collecte" className="footer-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="link-content">
                  <div className="link-icon">🗺️</div>
                  <span className="link-text">Points de collecte</span>
                </div>
              </Link>
            </div>
            <div className="footer-link-container">
              <Link href="/contact" className="footer-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="link-content">
                  <div className="link-icon">📞</div>
                  <span className="link-text">Contactez-nous</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="footer-section">
          <h4 className="footer-subtitle">Contact</h4>
          <div className="footer-contact-grid">
            <div className="contact-item">
              <a href="mailto:contact@greenbin.tn" className="contact-link" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className="contact-content">
                  <div className="contact-icon">✉️</div>
                  <div className="contact-info">
                    <div className="contact-label">Email</div>
                    <div className="contact-value">contact@greenbin.tn</div>
                  </div>
                </div>
              </a>
            </div>
            <div className="contact-item">
              <a href="tel:+21671000000" className="contact-link" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className="contact-content">
                  <div className="contact-icon">📱</div>
                  <div className="contact-info">
                    <div className="contact-label">Téléphone</div>
                    <div className="contact-value">+216 71 000 000</div>
                  </div>
                </div>
              </a>
            </div>
            <div className="contact-item">
              <a href="https://maps.google.com/?q=Tunis,Tunisie" target="_blank" className="contact-link" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className="contact-content">
                  <div className="contact-icon">📍</div>
                  <div className="contact-info">
                    <div className="contact-label">Adresse</div>
                    <div className="contact-value">Tunis, Tunisie</div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <div className="copyright">
            &copy; {new Date().getFullYear()} GreenBin. Tous droits réservés.
          </div>
          <div className="footer-bottom-links">
            <div className="footer-bottom-link-container">
              <Link href="/privacy" className="footer-bottom-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                Politique de confidentialité
              </Link>
            </div>
            <div className="footer-bottom-link-container">
              <Link href="/terms" className="footer-bottom-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                Conditions d&apos;utilisation
              </Link>
            </div>
            <div className="footer-bottom-link-container">
              <Link href="/accessibility" className="footer-bottom-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                Accessibilité
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Global footer reset */
        .footer {
          background: #f8faf9;
          color: #2d3748;
          padding-top: 60px;
          margin-top: 60px;
          border-top: 1px solid #e2e8f0;
        }

        .footer * {
          box-sizing: border-box;
        }

        /* Fix for Next.js Link styles */
        .footer :global(a) {
          text-decoration: none !important;
          color: inherit !important;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px 48px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }

        @media (min-width: 768px) {
          .footer-container {
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 48px;
          }
        }

        .footer-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .brand-section {
          grid-column: 1 / -1;
        }

        @media (min-width: 768px) {
          .brand-section {
            grid-column: 1;
          }
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 12px;
        }

        .footer-logo {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
        }

        .footer-brand-info {
          display: flex;
          flex-direction: column;
        }

        .footer-title {
          font-size: 24px;
          font-weight: 700;
          color: #047857;
          margin: 0;
        }

        .footer-tagline {
          color: #10b981;
          font-size: 14px;
          font-weight: 500;
          margin: 4px 0 0 0;
        }

        .footer-description {
          color: #4a5568;
          line-height: 1.6;
          font-size: 15px;
          margin: 0;
          max-width: 400px;
        }

        .footer-subtitle {
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
          margin: 0 0 16px 0;
          position: relative;
          padding-bottom: 8px;
        }

        .footer-subtitle::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 3px;
          background: linear-gradient(90deg, #10b981, #34d399);
          border-radius: 2px;
        }

        /* ====== Service & Quick Links ====== */
        .footer-links-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-link-container {
          width: 100%;
        }

        /* Fix for Link hover animation - use a wrapper */
        .footer-link-wrapper {
          display: block;
          width: 100%;
          text-decoration: none;
          color: inherit;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          z-index: 1;
        }

        /* Direct hover on the wrapper */
        .footer-link-container:hover .footer-link-wrapper {
          transform: translateY(-6px);
        }

        /* Target the Link element directly */
        .footer-link-container:hover :global(.footer-link) {
          transform: translateY(-6px);
        }

        .link-content {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: white;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          min-height: 60px;
          width: 100%;
          color: #4a5568;
        }

        /* Apply hover styles to the content when container is hovered */
        .footer-link-container:hover .link-content {
          border-color: #10b981;
          background: #f0fdf4;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
        }

        .footer-link-container:hover .link-icon {
          transform: scale(1.1);
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          color: white;
        }

        .link-icon {
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: #f0fdf4;
          border-radius: 8px;
          color: #10b981;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .link-text {
          font-size: 14px;
          font-weight: 500;
          color: #4a5568;
          line-height: 1.4;
          flex-grow: 1;
          transition: color 0.3s ease;
        }

        .footer-link-container:hover .link-text {
          color: #047857;
          font-weight: 600;
        }

        /* ====== Social Media Links ====== */
        .footer-social {
          display: flex;
          gap: 12px;
          margin-top: 20px;
          width: 100%;
        }

        .social-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          text-decoration: none;
          color: #4a5568;
          padding: 16px 12px;
          background: white;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          font-size: 14px;
          font-weight: 500;
          flex: 1;
          min-height: 80px;
          gap: 8px;
        }

        /* Social link hover */
        .social-link:hover {
          transform: translateY(-6px);
          background: #f0fdf4;
          border-color: #10b981;
          color: #047857;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
        }

        .social-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
        }

        .social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #10b981;
          transition: all 0.3s ease;
        }

        .social-link:hover .social-icon {
          transform: scale(1.1);
          color: #10b981;
        }

        .social-text {
          font-size: 13px;
          font-weight: 500;
          line-height: 1.2;
        }

        .social-link:hover .social-text {
          color: #047857;
          font-weight: 600;
        }

        /* ====== Contact Section ====== */
        .footer-contact-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .contact-item {
          width: 100%;
        }

        /* Fix contact link hover */
        .contact-link {
          display: block;
          width: 100%;
          text-decoration: none;
          color: inherit;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Contact link hover animation */
        .contact-item:hover .contact-link {
          transform: translateY(-6px);
        }

        .contact-content {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: white;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          min-height: 72px;
          width: 100%;
          color: #4a5568;
        }

        .contact-item:hover .contact-content {
          border-color: #10b981;
          background: #f0fdf4;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
          color: #047857;
        }

        .contact-icon {
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #f0fdf4;
          border-radius: 10px;
          color: #10b981;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .contact-item:hover .contact-icon {
          transform: scale(1.1);
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          color: white;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          min-width: 0;
        }

        .contact-label {
          font-size: 12px;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .contact-value {
          font-size: 14px;
          font-weight: 500;
          color: #2d3748;
          transition: color 0.3s ease;
        }

        .contact-item:hover .contact-value {
          color: #047857;
          font-weight: 600;
        }

        /* ====== Bottom Bar ====== */
        .footer-bottom {
          border-top: 1px solid #e2e8f0;
          padding: 32px 0;
          background: white;
        }

        .footer-bottom-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        @media (min-width: 768px) {
          .footer-bottom-container {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .copyright {
          color: #718096;
          font-size: 14px;
          font-weight: 500;
        }

        .footer-bottom-links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }

        @media (max-width: 767px) {
          .footer-bottom-links {
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
        }

        .footer-bottom-link-container {
          position: relative;
        }

        /* Fix bottom link hover */
        .footer-bottom-link {
          text-decoration: none;
          color: #4a5568 !important;
          font-size: 14px;
          font-weight: 500;
          padding: 10px 20px;
          background: white;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: block;
          min-width: 160px;
          text-align: center;
        }

        /* Bottom link hover animation */
        .footer-bottom-link-container:hover .footer-bottom-link {
          transform: translateY(-6px);
          color: #10b981 !important;
          background: #f0fdf4;
          border-color: #10b981;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
          font-weight: 600;
        }

        /* ====== Performance Optimizations ====== */
        .footer-link-container,
        .social-link,
        .contact-item,
        .footer-bottom-link-container {
          will-change: transform;
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* ====== Force remove all link decorations ====== */
        .footer a,
        .footer a:hover,
        .footer a:focus,
        .footer a:active,
        .footer a:visited {
          text-decoration: none !important;
          color: inherit !important;
        }

        /* Additional specificity for Next.js Links */
        .footer :global(a[class*="footer-"]),
        .footer :global(a[href^="/"]),
        .footer :global(a[href^="mailto:"]),
        .footer :global(a[href^="tel:"]),
        .footer :global(a[target="_blank"]) {
          text-decoration: none !important;
          color: inherit !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .footer-social {
            flex-direction: column;
          }
          
          .social-link {
            width: 100%;
          }
          
          .footer-bottom-link {
            min-width: 140px;
          }
        }

        @media (max-width: 480px) {
          .footer-bottom-link {
            min-width: 120px;
            padding: 8px 16px;
            font-size: 13px;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;