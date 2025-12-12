"use client";

import React from 'react';

interface MenuItem {
  id: string;
  label: string;
}

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  menuItems: MenuItem[];
}

export default function Sidebar({ activeSection, setActiveSection, menuItems }: SidebarProps) {
  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo-text">
            <h3 className="sidebar-title">Dashboard</h3>
            <p className="sidebar-subtitle">Gestion Municipale</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="section-label">Navigation</div>
            <div className="nav-items">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                  type="button"
                >
                  <span className="nav-label">{item.label}</span>
                  {activeSection === item.id && (
                    <div className="nav-active-indicator"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <div className="sidebar-stats">
            <div className="stat-item">
              <div className="stat-number">{menuItems.length}</div>
              <div className="stat-label">Sections</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">✓</div>
              <div className="stat-label">Actif</div>
            </div>
          </div>
        </div>
      </aside>

      <style jsx>{`
        .sidebar {
          width: 260px;
          background: #f8faf9;
          border-right: 1px solid #e2e8f0;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          z-index: 90;
          margin: 0;
          padding: 0;
        }

        .sidebar-brand {
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
          background: white;
          margin-top: 72px; /* Height of the header */
        }

        .sidebar-logo-text {
          display: flex;
          flex-direction: column;
        }

        .sidebar-title {
          font-size: 20px;
          font-weight: 700;
          color: #047857;
          margin: 0;
          line-height: 1;
        }

        .sidebar-subtitle {
          font-size: 12px;
          color: #10b981;
          font-weight: 500;
          margin: 6px 0 0 0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .sidebar-nav {
          flex: 1;
          padding: 24px 0;
          overflow-y: auto;
        }

        .nav-section {
          padding: 0 20px;
        }

        .section-label {
          font-size: 12px;
          color: #718096;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
          padding-left: 8px;
        }

        .nav-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: transparent;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          text-align: left;
          color: #4a5568;
          font-size: 14px;
          font-weight: 500;
          width: 100%;
        }

        .nav-item:hover {
          background: #f0fdf4;
          color: #047857;
          padding-left: 20px;
        }

        .nav-item.active {
          background: white;
          color: #047857;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
          border: 1px solid #e2e8f0;
        }

        .nav-item.active:hover {
          background: white;
          padding-left: 16px;
        }

        .nav-label {
          flex: 1;
          text-align: left;
        }

        .nav-active-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          margin-left: 8px;
          flex-shrink: 0;
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid #e2e8f0;
          background: white;
        }

        .sidebar-stats {
          display: flex;
          align-items: center;
          justify-content: space-around;
          gap: 16px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex: 1;
        }

        .stat-number {
          font-size: 18px;
          font-weight: 700;
          color: #10b981;
        }

        .stat-label {
          font-size: 11px;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-divider {
          width: 1px;
          height: 24px;
          background: #e2e8f0;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .sidebar {
            width: 240px;
          }
          
          .sidebar-brand {
            padding: 20px;
          }
          
          .nav-section {
            padding: 0 16px;
          }
          
          .nav-item {
            padding: 12px 14px;
            font-size: 13px;
          }
          
          .nav-item:hover {
            padding-left: 18px;
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 220px;
          }
          
          .sidebar-brand {
            padding: 16px;
            margin-top: 64px; /* Adjusted for mobile header */
          }
          
          .sidebar-title {
            font-size: 18px;
          }
          
          .sidebar-subtitle {
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          
          .sidebar.mobile-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}