import { useState } from 'react';
interface Vehicule {
  id: string;
  matricule: string;
  chauffeur: string;
  chauffeurId: string;
  disponibilite: string;
}

interface VehiculeFormData {
  id?: string;
  matricule: string;
  chauffeurId: string;
  disponibilite: string;
}

interface ModifierVehiculeProps {
  vehicule?: Vehicule | null;
  onSave: (data: VehiculeFormData) => void;
  onCancel: () => void;
  isEditing: boolean;
  chauffeurOptions: { id: string; nom: string; prenom: string }[];
}

export default function ModifierVehicule({
  vehicule,
  onSave,
  onCancel,
  isEditing,
  chauffeurOptions
}: ModifierVehiculeProps) {
  const [formData, setFormData] = useState<VehiculeFormData>({
    id: vehicule?.id,
    matricule: vehicule?.matricule || '',
    chauffeurId: vehicule?.chauffeurId || '',
    disponibilite: vehicule?.disponibilite || 'disponible'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate matricule format
    const matriculeRegex = /^[0-9]{3}TUN[0-9]{4}$/;
    if (!matriculeRegex.test(formData.matricule)) {
      alert('Le format du matricule est invalide. Format attendu: 123TUN1234');
      return;
    }
    
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="content-card">
      <h2>{isEditing ? `Modifier le Véhicule #${vehicule?.id}` : 'Ajouter un Véhicule'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Matricule</label>
          <input
            type="text"
            name="matricule"
            value={formData.matricule}
            onChange={handleChange}
            className="form-control"
            placeholder="123TUN1234"
            pattern="[0-9]{3}TUN[0-9]{4}"
            required
          />
          <small className="form-help">Format: 123TUN1234 (3 chiffres + TUN + 4 chiffres)</small>
        </div>

        <div className="form-group">
          <label>Chauffeur</label>
          <select
            name="chauffeurId"
            value={formData.chauffeurId}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="">-- Sélectionner --</option>
            {chauffeurOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.prenom} {opt.nom}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Disponibilité</label>
          <select
            name="disponibilite"
            value={formData.disponibilite}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="disponible">Disponible</option>
            <option value="En Service">En Service</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Enregistrer les modifications' : 'Ajouter le véhicule'}
          </button>
        </div>
      </form>
    </div>
  );
}