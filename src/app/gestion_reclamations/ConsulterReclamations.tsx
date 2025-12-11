import type { Reclamation } from '../gestion_utilisateurs/responsable_municipalite/page';

interface ConsulterReclamationsProps {
  reclamations: Reclamation[];
  loading: boolean;
  onDeleteReclamation: (id: string) => void;
  onMarkAsResolved: (id: string) => void;
  deletingId: string | null;
  updatingId: string | null;
}

export default function ConsulterReclamations({
  reclamations,
  loading,
  onDeleteReclamation,
  onMarkAsResolved,
  deletingId,
  updatingId
}: ConsulterReclamationsProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { class: string; text: string } } = {
      'new': { class: 'status-new', text: 'Nouveau' },
      'in-progress': { class: 'status-in-progress', text: 'En Cours' },
      'resolved': { class: 'status-resolved', text: 'Résolu' }
    };
    
    const config = statusConfig[status] || { class: 'status-new', text: 'Nouveau' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="content-card">
        <div className="loading-state">
          <p>Chargement des réclamations...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="content-card">
        <div className="section-header">
          <h2>Liste des Réclamations</h2>
          <div className="stats-info">
            Total: {reclamations.length} réclamation{reclamations.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {reclamations.length === 0 ? (
          <div className="empty-state">
            <h3>Aucune réclamation trouvée</h3>
            <p>Il n'y a aucune réclamation à afficher pour le moment.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Citoyen</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Contenu</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reclamations.map((reclamation) => (
                  <tr key={reclamation.id}>
                    <td className="id-cell">#{reclamation.id}</td>
                    <td className="citizen-info">
                      <div className="citizen-name">{reclamation.citoyen}</div>
                      <div className="citizen-id">ID: {reclamation.citoyenId}</div>
                    </td>
                    <td>
                      <span className="type-badge">{reclamation.type}</span>
                    </td>
                    <td className="date-cell">{reclamation.date}</td>
                    <td className="content-cell">
                      <div className="content-text" title={reclamation.contenu}>
                        {reclamation.contenu.length > 100 
                          ? `${reclamation.contenu.substring(0, 100)}...` 
                          : reclamation.contenu
                        }
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(reclamation.status)}
                    </td>
                    <td>
                      <div className="action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {reclamation.status !== 'resolved' && (
                          <button 
                            className="btn btn-resolve"
                            onClick={() => onMarkAsResolved(reclamation.id)}
                            disabled={updatingId === reclamation.id}
                          >
                            {updatingId === reclamation.id ? 'Mise à jour...' : 'Terminé'}
                          </button>
                        )}
                        <button 
                          className="btn btn-delete"
                          onClick={() => onDeleteReclamation(reclamation.id)}
                          disabled={deletingId === reclamation.id}
                        >
                          {deletingId === reclamation.id ? 'Suppression...' : 'Supprimer'}
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
          <h3>Total Réclamations</h3>
          <div className="value">{reclamations.length}</div>
        </div>
        <div className="stat-card">
          <h3>Nouvelles</h3>
          <div className="value">
            {reclamations.filter(r => r.status === 'new').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>En Cours</h3>
          <div className="value">
            {reclamations.filter(r => r.status === 'in-progress').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Résolues</h3>
          <div className="value">
            {reclamations.filter(r => r.status === 'resolved').length}
          </div>
        </div>
      </div>
    </div>
  );
}