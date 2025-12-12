interface Tournee {
  id: string;
  zone: string;
  date: string;
  vehiculeId: string;
  ouvrierIds: string[];
  vehiculeMatricule?: string;
  ouvrierNames?: string[];
}

interface GererTourneesProps {
  tournees: Tournee[];
  loading: boolean;
  onDeleteTournee: (id: string) => void;
  onModifyTournee: (tournee: Tournee) => void;
  onAddTournee: () => void;
  deletingTourneeId: string | null;
}

export default function GererTournees({
  tournees,
  loading,
  onDeleteTournee,
  onModifyTournee,
  onAddTournee,
  deletingTourneeId
}: GererTourneesProps) {
  if (loading) {
    return (
      <div className="content-card">
        <div className="loading-state">
          <p>Chargement des tournées...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  return (
    <div>
      <div className="content-card">
        <div className="section-header">
          <div>
            <h2>Liste des Tournées</h2>
            <div className="stats-info">
              Total: {tournees.length} tournée{tournees.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={onAddTournee}
          >
            + Ajouter une Tournée
          </button>
        </div>
        
        {tournees.length === 0 ? (
          <div className="empty-state">
            <h3>Aucune tournée trouvée</h3>
            <p>Il n'y a aucune tournée à afficher pour le moment.</p>
            <button 
              className="btn btn-primary mt-3"
              onClick={onAddTournee}
            >
              Créer une première tournée
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Zone</th>
                  <th>Date</th>
                  <th>Véhicule ID</th>
                  <th>Ouvriers</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tournees.map((tournee) => (
                  <tr key={tournee.id}>
                    <td className="id-cell">#{tournee.id}</td>
                    <td>
                      <span className="type-badge">{tournee.zone}</span>
                    </td>
                    <td className="date-cell">{formatDate(tournee.date)}</td>
                    <td>
                      <span className="type-badge">#{tournee.vehiculeId}</span>
                    </td>
                    <td>
                      <div className="items-list">
                        {tournee.ouvrierIds.map(id => (
                          <span key={id} className="item-badge">#{id}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-edit"
                          onClick={() => onModifyTournee(tournee)}
                        >
                          Modifier
                        </button>
                        <button 
                          className="btn btn-delete"
                          onClick={() => onDeleteTournee(tournee.id)}
                          disabled={deletingTourneeId === tournee.id}
                        >
                          {deletingTourneeId === tournee.id ? 'Suppression...' : 'Supprimer'}
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
          <h3>Total Tournées</h3>
          <div className="value">{tournees.length}</div>
        </div>
        <div className="stat-card">
          <h3>Tournées Aujourd'hui</h3>
          <div className="value">
            {tournees.filter(t => {
              const today = new Date().toISOString().split('T')[0];
              return t.date === today;
            }).length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Ouvriers Totaux</h3>
          <div className="value">
            {Array.from(new Set(tournees.flatMap(t => t.ouvrierIds))).length}
          </div>
        </div>
      </div>
    </div>
  );
}