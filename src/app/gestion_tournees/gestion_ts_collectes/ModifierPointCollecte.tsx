import { useState } from 'react';

interface TrashCan {
  id: string;
  adresse: string;
  latitude: string;
  longitude: string;
  typeDechet: string;
  status: string;
}

interface TrashCanFormData {
  id: string;
  adresse: string;
  latitude: string;
  longitude: string;
  typeDechet: string;
  status: string;
}

interface ModifierPointCollecteProps {
  trashCan?: TrashCan | null;
  onSave: (data: TrashCanFormData) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export default function ModifierPointCollecte({
  trashCan,
  onSave,
  onCancel,
  isEditing
}: ModifierPointCollecteProps) {
  const [formData, setFormData] = useState<TrashCanFormData>({
    id: trashCan?.id || '',
    adresse: trashCan?.adresse || '',
    latitude: trashCan?.latitude || '',
    longitude: trashCan?.longitude || '',
    typeDechet: trashCan?.typeDechet || 'plastique',
    status: trashCan?.status || 'vide'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <h2>{isEditing ? `Modifier le Point de Collecte #${trashCan?.id}` : 'Ajouter un Point de Collecte'}</h2>
      
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
              placeholder="Entrez l'ID du point de collecte"
            />
          </div>
        )}

        <div className="form-group">
          <label>Adresse</label>
          <input
            type="text"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            className="form-control"
            required
            placeholder="Entrez l'adresse"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Latitude</label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="ex: 34.740"
            />
          </div>
          <div className="form-group">
            <label>Longitude</label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="ex: 10.760"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Type de Déchet</label>
          <select
            name="typeDechet"
            value={formData.typeDechet}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="plastique">Plastique</option>
            <option value="verre">Verre</option>
            <option value="papier">Papier</option>
            <option value="metal">Métal</option>
            <option value="organique">Organique</option>
          </select>
        </div>

        <div className="form-group">
          <label>Statut</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="vide">Vide</option>
            <option value="moitie">À moitié</option>
            <option value="pleine">Pleine</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Enregistrer les modifications' : 'Ajouter le point de collecte'}
          </button>
        </div>
      </form>
    </div>
  );
}