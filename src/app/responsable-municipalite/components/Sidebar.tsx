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
      <div className="sidebar-header">
        <h2>Tableau de Bord</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}