import { useState, useEffect } from 'react';

interface Tournee {
  id: string;
  zone: string;
  date: string;
  vehiculeId: string;
  ouvrierIds: string[];
}

interface Vehicule {
  id: string;
  matricule: string;
  chauffeur: string;
  chauffeurId: string;
  disponibilite: string;
}

interface User {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  login: string;
  etat: string;
}

interface ModifierTourneeProps {
  tournee?: Tournee | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  isEditing: boolean;
  vehicules: Vehicule[];
  ouvriers: User[];
}

export default function ModifierTournee({
  tournee,
  onSave,
  onCancel,
  isEditing,
  vehicules = [],
  ouvriers = []
}: ModifierTourneeProps) {
  const [formData, setFormData] = useState({
    id: tournee?.id || '',
    zone: tournee?.zone || '',
    date: tournee?.date || '',
    vehiculeId: tournee?.vehiculeId || '',
    ouvrierIds: tournee?.ouvrierIds || []
  });

  const [availableVehicules, setAvailableVehicules] = useState<Vehicule[]>(vehicules);
  const [availableOuvriers, setAvailableOuvriers] = useState<User[]>(ouvriers);

  // Filter available workers (only ouvriers)
  useEffect(() => {
    if (ouvriers.length > 0) {
      const filteredOuvriers = ouvriers.filter(user => 
        user.role.toLowerCase().includes('ouvrier')
      );
      setAvailableOuvriers(filteredOuvriers);
    }
  }, [ouvriers]);

  // Filter available vehicles (only disponible ones)
  useEffect(() => {
    if (vehicules.length > 0) {
      const filteredVehicules = vehicules.filter(vehicule => 
        vehicule.disponibilite.toLowerCase() === 'disponible'
      );
      setAvailableVehicules(filteredVehicules);
    }
  }, [vehicules]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      ouvrierIds: formData.ouvrierIds
    };
    onSave(processedData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOuvrierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      ouvrierIds: selectedOptions
    }));
  };

  const getVehicleDisplay = (vehicule: Vehicule) => {
    return `${vehicule.matricule} (ID: ${vehicule.id}) - ${vehicule.disponibilite}`;
  };

  const getOuvrierDisplay = (ouvrier: User) => {
    return `${ouvrier.prenom} ${ouvrier.nom} (ID: ${ouvrier.id}) - ${ouvrier.role}`;
  };

  return (
    <div className="content-card">
      <h2>{isEditing ? `Modifier la Tournée #${tournee?.id}` : 'Ajouter une Tournée'}</h2>
      
      <form onSubmit={handleSubmit}>
        {!isEditing && (
          <div className="form-group">
            <label>ID</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="Entrez l'ID de la tournée"
            />
          </div>
        )}

        <div className="form-group">
          <label>Zone</label>
          <input
            type="text"
            name="zone"
            value={formData.zone}
            onChange={handleChange}
            className="form-control"
            required
            placeholder="Entrez la zone"
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label>Véhicule</label>
          <select
            name="vehiculeId"
            value={formData.vehiculeId}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="">Sélectionnez un véhicule</option>
            {availableVehicules.map(vehicule => (
              <option key={vehicule.id} value={vehicule.id}>
                {getVehicleDisplay(vehicule)}
              </option>
            ))}
          </select>
          {availableVehicules.length === 0 && (
            <small className="form-help text-warning">
              Aucun véhicule disponible. Veuillez d'abord ajouter un véhicule dans la section "Gérer les véhicules".
            </small>
          )}
        </div>

        <div className="form-group">
          <label>Ouvriers</label>
          <select
            name="ouvrierIds"
            multiple
            value={formData.ouvrierIds}
            onChange={handleOuvrierChange}
            className="form-control"
            size={4}
          >
            {availableOuvriers.map(ouvrier => (
              <option key={ouvrier.id} value={ouvrier.id}>
                {getOuvrierDisplay(ouvrier)}
              </option>
            ))}
          </select>
          <small className="form-help">
            Maintenez Ctrl (Windows) ou Cmd (Mac) pour sélectionner plusieurs ouvriers
          </small>
          {availableOuvriers.length === 0 && (
            <small className="form-help text-warning">
              Aucun ouvrier disponible. Veuillez vérifier que des utilisateurs avec le rôle "ouvrier" existent.
            </small>
          )}
          {formData.ouvrierIds.length > 0 && (
            <div className="mt-2">
              <strong>Ouvriers sélectionnés:</strong>
              <ul className="list-unstyled">
                {formData.ouvrierIds.map(id => {
                  const ouvrier = availableOuvriers.find(o => o.id === id);
                  return ouvrier ? (
                    <li key={id} className="badge bg-primary me-1">
                      {ouvrier.prenom} {ouvrier.nom} (ID: {id})
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Annuler
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!formData.vehiculeId || formData.ouvrierIds.length === 0}
          >
            {isEditing ? 'Enregistrer les modifications' : 'Ajouter la tournée'}
          </button>
        </div>
      </form>
    </div>
  );
}