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
    <aside className="sidebar">
      {/* Removed the sidebar-header section completely */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
            type="button"
          >
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}