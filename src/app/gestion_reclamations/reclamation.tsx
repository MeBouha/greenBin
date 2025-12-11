"use client";
  
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../gestion_utilisateurs/header';

interface ReclamationData {
  id: number;
  citoyen: string;
  contenu: string;
  date: string;
  status: 'new' | 'in-progress' | 'resolved';
  type: string;
}

interface Props {
  onClose?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  'new': '#ef4444',
  'in-progress': '#f59e0b',
  'resolved': '#10b981',
};

const STATUS_LABELS: Record<string, string> = {
  'new': 'Nouvelle',
  'in-progress': 'En cours',
  'resolved': 'Résolue',
};

export default function Reclamation({ onClose }: Props) {
  const router = useRouter();
  const [reclamations, setReclamations] = useState<ReclamationData[]>([]);
  const [filteredReclamations, setFilteredReclamations] = useState<ReclamationData[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectedUser, setConnectedUser] = useState<any>(null);

  // Load reclamations from XML
  useEffect(() => {
    const loadReclamations = async () => {
      try {
        setLoading(true);
        const res = await fetch('/data/reclamation.xml');
        if (!res.ok) throw new Error('Failed to load reclamations');
        
        const xmlText = await res.text();
        
        // Parse XML manually since we're on client
        const reclamationElements = xmlText.match(/<reclamation[^>]*>[\s\S]*?<\/reclamation>/g) || [];
        const data: ReclamationData[] = reclamationElements.map((recXml) => {
          const idMatch = recXml.match(/id="(\d+)"/);
          const id = idMatch ? parseInt(idMatch[1]) : 0;
          
          const citoyenMatch = recXml.match(/<citoyen[^>]*>([^<]+)<\/citoyen>/);
          const citoyen = citoyenMatch ? citoyenMatch[1].trim() : '';
          
          const contenuMatch = recXml.match(/<contenu>([^<]+)<\/contenu>/);
          const contenu = contenuMatch ? contenuMatch[1].trim() : '';
          
          const dateMatch = recXml.match(/<date>([^<]+)<\/date>/);
          const date = dateMatch ? dateMatch[1].trim() : '';
          
          const statusMatch = recXml.match(/<status>([^<]+)<\/status>/);
          const status = (statusMatch ? statusMatch[1].trim() : 'new') as 'new' | 'in-progress' | 'resolved';
          
          const typeMatch = recXml.match(/<type>([^<]+)<\/type>/);
          const type = typeMatch ? typeMatch[1].trim() : '';
          
          return { id, citoyen, contenu, date, status, type };
        });
        
        setReclamations(data);
        setFilteredReclamations([]);
        setError(null);
      } catch (err: any) {
        console.error('Error loading reclamations:', err);
        setError(err?.message || 'Erreur lors du chargement des réclamations');
      } finally {
        setLoading(false);
      }
    };

    loadReclamations();
  }, []);

  // Filter reclamations based on search text
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredReclamations([]);
    } else {
      const lowerSearch = searchText.toLowerCase();
      const filtered = reclamations.filter((r) =>
        r.citoyen.toLowerCase().includes(lowerSearch)
      );
      setFilteredReclamations(filtered);
    }
  }, [searchText, reclamations]);

  if (loading) {
    return (
      <div>
        <Header />
        <main className="container" style={{ marginTop: 16, textAlign: 'center', padding: 20 }}>
          <div>Chargement des réclamations...</div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="container" style={{ marginTop: 16 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Réclamations</h1>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onClose) {
                  onClose();
                } else {
                  router.push('/gestion_tournees');
                }
              }}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 12px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              ← Retour
            </button>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 16, border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          {/* Search bar */}
          <div style={{ marginBottom: 24, background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
              Rechercher par nom et prénom
            </label>
            <input
              type="text"
              placeholder="Ex: Pierre Lambert, Sophie Bernard..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input"
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, borderRadius: 6, border: '1px solid #d1d5db' }}
            />
          </div>

          {/* Results count or prompt */}
          <div style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>
            {searchText.trim() ? (
              <span>{filteredReclamations.length} réclamation{filteredReclamations.length !== 1 ? 's' : ''} trouvée{filteredReclamations.length !== 1 ? 's' : ''}</span>
            ) : (
              <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>Veuillez saisir un nom et prénom pour rechercher des réclamations</span>
            )}
          </div>

          {/* Reclamations list */}
          {filteredReclamations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
              <div style={{ fontSize: 16, marginBottom: 8 }}>Aucune réclamation trouvée</div>
              {searchText && <div style={{ fontSize: 14 }}>Essayez une autre recherche</div>}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {filteredReclamations.map((reclamation) => (
                <div
                  key={reclamation.id}
                  style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: 16,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  {/* Header with status and date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 }}>
                        #{reclamation.id} — {reclamation.citoyen}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#fff',
                            background: STATUS_COLORS[reclamation.status],
                          }}
                        >
                          {STATUS_LABELS[reclamation.status]}
                        </span>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 4,
                            fontSize: 12,
                            background: '#f0f9ff',
                            color: '#0369a1',
                            border: '1px solid #bae6fd',
                          }}
                        >
                          {reclamation.type}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#666', textAlign: 'right' }}>
                      {new Date(reclamation.date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ marginTop: 12, padding: '12px', background: '#f9fafb', borderRadius: 6, borderLeft: '4px solid #3b82f6' }}>
                    <p style={{ margin: 0, color: '#374151', lineHeight: 1.6, fontSize: 14 }}>
                      {reclamation.contenu}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}