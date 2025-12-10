import { Rapport, Ouvrier, DechetCollecte } from './page';

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
  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { class: string; text: string } } = {
      'present': { class: 'status-resolved', text: 'Présent' },
      'absent': { class: 'status-new', text: 'Absent' }
    };
    
    const config = statusConfig[status] || { class: 'status-new', text: 'Inconnu' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

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
                  <th>Tournée ID</th>
                  <th>Chef de Tournée</th>
                  <th>Ouvriers</th>
                  <th>Déchets Collectés</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rapports.map((rapport) => (
                  <tr key={rapport.id}>
                    <td className="id-cell">#{rapport.id}</td>
                    <td className="date-cell">{rapport.date}</td>
                    <td>
                      <span className="type-badge">#{rapport.tourneeId}</span>
                    </td>
                    <td>
                      <div className="employee-info">
                        <div className="employee-id">ID: {rapport.chefTourneId}</div>
                      </div>
                    </td>
                    <td>
                      <div className="employees-list">
                        {rapport.ouvriers.map(ouvrier => (
                          <div key={ouvrier.id} className="employee-item">
                            <div className="employee-name">{ouvrier.prenom} {ouvrier.nom}</div>
                            <div className="employee-status">{getStatusBadge(ouvrier.status)}</div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="dechets-list">
                        {rapport.dechetsCollecte.map(dechet => (
                          <div key={dechet.id} className="dechet-item">
                            <span className="dechet-id">#{dechet.id}</span>
                            <span className="dechet-quantite">{dechet.quantite}kg</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-delete"
                          onClick={() => onDeleteRapport(rapport.id)}
                          disabled={deletingRapportId === rapport.id}
                        >
                          {deletingRapportId === rapport.id ? 'Suppression...' : 'Supprimer'}
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