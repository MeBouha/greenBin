// Local interfaces to match /api/rapport payload shape
import { useState } from 'react';

interface Ouvrier {
  id: string;
  nom: string;
  prenom: string;
  status: string;
}

interface DechetCollecte {
  id: string;
  quantite: string;
}

interface Rapport {
  id: string;
  date: string;
  tourneeId: string;
  chefTourneId: string;
  ouvriers: Ouvrier[];
  dechetsCollecte: DechetCollecte[];
  vehiculeMatricule?: string;
  tourneeZone?: string;
}

interface ConsulterRapportsProps {
  rapports: Rapport[];
  loading: boolean;
  onDeleteRapport: (id: string) => void;
  deletingRapportId: string | null;
}

export default function ConsulterRapports({
  rapports,
  loading,
  onDeleteRapport,
  deletingRapportId
}: ConsulterRapportsProps) {
  const [selectedRapport, setSelectedRapport] = useState<Rapport | null>(null);

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { class: string; text: string } } = {
      'present': { class: 'status-resolved', text: 'Présent' },
      'absent': { class: 'status-new', text: 'Absent' }
    };
    
    const config = statusConfig[status] || { class: 'status-new', text: 'Inconnu' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (selectedRapport) {
    return (
      <div className="content-card">
        <div className="section-header">
          <h2>Résumé récapitulatif - Rapport #{selectedRapport.id}</h2>
          <button className="btn btn-cancel" onClick={() => setSelectedRapport(null)}>
            Retour
          </button>
        </div>
        
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3>Informations de la tournée</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
              <div>
                <strong>Date:</strong> {selectedRapport.date}
              </div>
              <div>
                <strong>Zone:</strong> {selectedRapport.tourneeZone || 'N/A'}
              </div>
              <div>
                <strong>Véhicule:</strong> {selectedRapport.vehiculeMatricule || 'N/A'}
              </div>
              <div>
                <strong>Chef de tournée ID:</strong> {selectedRapport.chefTourneId}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3>Ouvriers ({selectedRapport.ouvriers.length})</h3>
            <div style={{ marginTop: '12px' }}>
              {selectedRapport.ouvriers.length === 0 ? (
                <p>Aucun ouvrier</p>
              ) : (
                <table className="table" style={{ marginTop: '8px' }}>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRapport.ouvriers.map(ouvrier => (
                      <tr key={ouvrier.id}>
                        <td>{ouvrier.nom}</td>
                        <td>{ouvrier.prenom}</td>
                        <td>{getStatusBadge(ouvrier.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div>
            <h3>Déchets collectés ({selectedRapport.dechetsCollecte.length})</h3>
            <div style={{ marginTop: '12px' }}>
              {selectedRapport.dechetsCollecte.length === 0 ? (
                <p>Aucun déchet collecté</p>
              ) : (
                <table className="table" style={{ marginTop: '8px' }}>
                  <thead>
                    <tr>
                      <th>Point de collecte</th>
                      <th>Quantité (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRapport.dechetsCollecte.map(dechet => (
                      <tr key={dechet.id}>
                        <td>#{dechet.id}</td>
                        <td>{dechet.quantite} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="content-card">
        <div className="loading-state">
          <p>Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="content-card">
        <div className="section-header">
          <div>
            <h2>Liste des Rapports</h2>
            <div className="stats-info">
              Total: {rapports.length} rapport{rapports.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        
        {rapports.length === 0 ? (
          <div className="empty-state">
            <h3>Aucun rapport trouvé</h3>
            <p>Il n'y a aucun rapport à afficher pour le moment.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Matricule Véhicule</th>
                  <th>Zone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rapports.map((rapport) => (
                  <tr key={rapport.id}>
                    <td className="id-cell">#{rapport.id}</td>
                    <td className="date-cell">{rapport.date}</td>
                    <td>
                      <span className="type-badge">{rapport.vehiculeMatricule || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="type-badge">{rapport.tourneeZone || 'N/A'}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-primary"
                          onClick={() => setSelectedRapport(rapport)}
                        >
                          Visualiser
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Rapports</h3>
          <div className="value">{rapports.length}</div>
        </div>
        <div className="stat-card">
          <h3>Rapports Aujourd'hui</h3>
          <div className="value">
            {rapports.filter(r => {
              const today = new Date().toISOString().split('T')[0];
              return r.date === today;
            }).length}
          </div>
        </div>
      </div>
    </div>
  );
}