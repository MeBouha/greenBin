import { useState } from 'react';
import { Tournee, TourneeFormData } from './page';

interface ModifierTourneeProps {
  tournee?: Tournee | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export default function ModifierTournee({
  tournee,
  onSave,
  onCancel,
  isEditing
}: ModifierTourneeProps) {
  const [formData, setFormData] = useState<TourneeFormData>({
    id: tournee?.id || '',
    date: tournee?.date || '',
    vehiculeId: tournee?.vehiculeId || '',
    trashCanIds: tournee?.trashCanIds?.join(', ') || '',
    ouvrierIds: tournee?.ouvrierIds?.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      trashCanIds: formData.trashCanIds.split(',').map(id => id.trim()).filter(id => id),
      ouvrierIds: formData.ouvrierIds.split(',').map(id => id.trim()).filter(id => id)
    };
    onSave(processedData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
          <label>ID du Véhicule</label>
          <input
            type="text"
            name="vehiculeId"
            value={formData.vehiculeId}
            onChange={handleChange}
            className="form-control"
            required
            placeholder="Entrez l'ID du véhicule"
          />
        </div>

        <div className="form-group">
          <label>IDs des Points de Collecte</label>
          <textarea
            name="trashCanIds"
            value={formData.trashCanIds}
            onChange={handleChange}
            className="form-control"
            rows={2}
            placeholder="1, 2, 3"
          />
          <small className="form-help">Séparez les IDs par des virgules (ex: 1, 2, 3)</small>
        </div>

        <div className="form-group">
          <label>IDs des Ouvriers</label>
          <textarea
            name="ouvrierIds"
            value={formData.ouvrierIds}
            onChange={handleChange}
            className="form-control"
            rows={2}
            placeholder="2, 3"
          />
          <small className="form-help">Séparez les IDs par des virgules (ex: 2, 3)</small>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Enregistrer les modifications' : 'Ajouter la tournée'}
          </button>
        </div>
      </form>
    </div>
  );
}