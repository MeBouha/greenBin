interface Vehicule {
  id: string;
  matricule: string;
  chauffeur: string;
  chauffeurId: string;
  disponibilite: string;
}

interface VehiculeFormData {
  matricule: string;
  chauffeur: string;
  disponibilite: string;
}

interface GererVehiculeProps {
  vehicules: Vehicule[];
  loading: boolean;
  onDeleteVehicule: (id: string) => void;
  onModifyVehicule: (vehicule: Vehicule) => void;
  onAddVehicule: () => void;
  deletingVehiculeId: string | null;
}

export default function GererVehicule({
  vehicules,
  loading,
  onDeleteVehicule,
  onModifyVehicule,
  onAddVehicule,
  deletingVehiculeId
}: GererVehiculeProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { class: string; text: string } } = {
      'disponible': { class: 'status-resolved', text: 'Disponible' },
      'En Service': { class: 'status-in-progress', text: 'En Service' }
    };
    
    const config = statusConfig[status] || { class: 'status-new', text: 'Inconnu' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="content-card">
        <div className="loading-state">
          <p>Chargement des véhicules...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="content-card">
        <div className="section-header">
          <div>
            <h2>Liste des Véhicules</h2>
            <div className="stats-info">
              Total: {vehicules.length} véhicule{vehicules.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={onAddVehicule}
          >
            + Ajouter
          </button>
        </div>
        
        {vehicules.length === 0 ? (
          <div className="empty-state">
            <h3>Aucun véhicule trouvé</h3>
            <p>Il n'y a aucun véhicule à afficher pour le moment.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Matricule</th>
                  <th>Chauffeur ID</th>
                  <th>Disponibilité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicules.map((vehicule) => (
                  <tr key={vehicule.id}>
                    <td className="id-cell">#{vehicule.id}</td>
                    <td className="matricule-cell">
                      <div className="matricule-text">{vehicule.matricule}</div>
                    </td>
                    <td className="chauffeur-cell">
                      <div className="chauffeur-id">ID: {vehicule.chauffeurId}</div>
                    </td>
                    <td>
                      {getStatusBadge(vehicule.disponibilite)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-edit"
                          onClick={() => onModifyVehicule(vehicule)}
                        >
                          Modifier
                        </button>
                        <button 
                          className="btn btn-delete"
                          onClick={() => onDeleteVehicule(vehicule.id)}
                          disabled={deletingVehiculeId === vehicule.id}
                        >
                          {deletingVehiculeId === vehicule.id ? 'Suppression...' : 'Supprimer'}
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
          <h3>Total Véhicules</h3>
          <div className="value">{vehicules.length}</div>
        </div>
        <div className="stat-card">
          <h3>Disponibles</h3>
          <div className="value">
            {vehicules.filter(v => v.disponibilite === 'disponible').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>En Service</h3>
          <div className="value">
            {vehicules.filter(v => v.disponibilite === 'En Service').length}
          </div>
        </div>
      </div>
    </div>
  );
}