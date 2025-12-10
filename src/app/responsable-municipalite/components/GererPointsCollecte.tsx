import { TrashCan, TrashCanFormData } from '../page';

interface GererPointsCollecteProps {
  trashCans: TrashCan[];
  loading: boolean;
  onDeleteTrashCan: (id: string) => void;
  onModifyTrashCan: (trashCan: TrashCan) => void;
  onAddTrashCan: () => void;
  deletingTrashCanId: string | null;
}

export default function GererPointsCollecte({
  trashCans,
  loading,
  onDeleteTrashCan,
  onModifyTrashCan,
  onAddTrashCan,
  deletingTrashCanId
}: GererPointsCollecteProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { class: string; text: string } } = {
      'vide': { class: 'status-resolved', text: 'Vide' },
      'moitie': { class: 'status-in-progress', text: 'Moitié' },
      'pleine': { class: 'status-new', text: 'Pleine' }
    };
    
    const config = statusConfig[status] || { class: 'status-new', text: 'Inconnu' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const getTypeBadge = (type: string) => {
    return <span className="type-badge">{type}</span>;
  };

  if (loading) {
    return (
      <div className="content-card">
        <div className="loading-state">
          <p>Chargement des points de collecte...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="content-card">
        <div className="section-header">
          <div>
            <h2>Liste des Points de Collecte</h2>
            <div className="stats-info">
              Total: {trashCans.length} point{trashCans.length !== 1 ? 's' : ''} de collecte
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={onAddTrashCan}
          >
            + Ajouter
          </button>
        </div>
        
        {trashCans.length === 0 ? (
          <div className="empty-state">
            <h3>Aucun point de collecte trouvé</h3>
            <p>Il n'y a aucun point de collecte à afficher pour le moment.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Adresse</th>
                  <th>Coordonnées</th>
                  <th>Type de Déchet</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trashCans.map((trashCan) => (
                  <tr key={trashCan.id}>
                    <td className="id-cell">#{trashCan.id}</td>
                    <td className="address-info">
                      <div className="address-text">{trashCan.adresse}</div>
                    </td>
                    <td className="coordinates-cell">
                      <div className="coordinates">
                        <div>Lat: {trashCan.latitude}</div>
                        <div>Long: {trashCan.longitude}</div>
                      </div>
                    </td>
                    <td>
                      {getTypeBadge(trashCan.typeDechet)}
                    </td>
                    <td>
                      {getStatusBadge(trashCan.status)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-edit"
                          onClick={() => onModifyTrashCan(trashCan)}
                        >
                          Modifier
                        </button>
                        <button 
                          className="btn btn-delete"
                          onClick={() => onDeleteTrashCan(trashCan.id)}
                          disabled={deletingTrashCanId === trashCan.id}
                        >
                          {deletingTrashCanId === trashCan.id ? 'Suppression...' : 'Supprimer'}
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
          <h3>Total Points</h3>
          <div className="value">{trashCans.length}</div>
        </div>
        <div className="stat-card">
          <h3>Poubelles Vides</h3>
          <div className="value">
            {trashCans.filter(t => t.status === 'vide').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Poubelles à Moitié</h3>
          <div className="value">
            {trashCans.filter(t => t.status === 'moitie').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Poubelles Pleines</h3>
          <div className="value">
            {trashCans.filter(t => t.status === 'pleine').length}
          </div>
        </div>
      </div>
    </div>
  );
}