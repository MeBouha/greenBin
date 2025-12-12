import { useState, useEffect } from 'react';

interface Tournee {
  id?: string;
  zone: string;
  date: string;
  vehiculeId: string;
  ouvrierIds: string[];
}

interface TourneeFormData {
  id: string;
  zone: string;
  date: string;
  vehiculeId: string;
  ouvrierIds: string;
}

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
    zone: tournee?.zone || '',
    date: tournee?.date || '',
    vehiculeId: tournee?.vehiculeId || '',
    ouvrierIds: tournee?.ouvrierIds?.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      ouvrierIds: formData.ouvrierIds.split(',').map((id: string) => id.trim()).filter((id: string) => id)
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

  return (
    <div className="content-card">
      <h2>{isEditing ? `Modifier la Tournée #${tournee?.id}` : 'Ajouter une Tournée'}</h2>
      
      <form onSubmit={handleSubmit}>
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
            placeholder="Entrez l'ID du véhicule"
          />
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