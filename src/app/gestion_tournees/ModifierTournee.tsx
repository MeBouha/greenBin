import { useState } from 'react';

interface Tournee {
  id?: string;
  zone: string;
  date: string;
  vehiculeId: string;
  ouvrierIds: string[];
}

interface TourneeFormData {
  id?: string;
  zone: string;
  date: string;
  vehiculeId: string;
  ouvrierIds: string[];
}

interface ModifierTourneeProps {
  tournee?: Tournee | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  isEditing: boolean;
  vehiculeOptions: { id: string; matricule: string }[];
  ouvrierOptions: { id: string; name: string }[];
}

export default function ModifierTournee({
  tournee,
  onSave,
  onCancel,
  isEditing,
  vehiculeOptions,
  ouvrierOptions
}: ModifierTourneeProps) {
  const [formData, setFormData] = useState<TourneeFormData>({
    id: tournee?.id,
    zone: tournee?.zone || '',
    date: tournee?.date || '',
    vehiculeId: tournee?.vehiculeId || '',
    ouvrierIds: tournee?.ouvrierIds || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      id: isEditing ? formData.id : undefined,
      ouvrierIds: formData.ouvrierIds.filter((id: string) => id)
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

  const toggleOuvrier = (id: string) => {
    setFormData(prev => {
      const exists = prev.ouvrierIds.includes(id);
      return {
        ...prev,
        ouvrierIds: exists ? prev.ouvrierIds.filter(x => x !== id) : [...prev.ouvrierIds, id]
      };
    });
  };

  const chipStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: '9999px',
    background: '#f1f5f9',
    color: '#0f172a',
    fontSize: '0.9rem',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    userSelect: 'none'
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
          >
            <option value="">-- Sélectionner --</option>
            {vehiculeOptions.map(v => (
              <option key={v.id} value={v.id}>{v.matricule}</option>
            ))}
          </select>
          <small className="form-help">Seuls les véhicules disponibles sont listés</small>
        </div>

        <div className="form-group">
          <label>Ouvriers disponibles</label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {ouvrierOptions.map(o => {
              const active = formData.ouvrierIds.includes(o.id);
              return (
                <span
                  key={o.id}
                  style={{
                    ...chipStyles,
                    background: active ? '#0f172a' : '#f1f5f9',
                    color: active ? '#f8fafc' : '#0f172a',
                    border: active ? '1px solid #0f172a' : '1px solid #e2e8f0'
                  }}
                  onClick={() => toggleOuvrier(o.id)}
                >
                  {o.name}
                </span>
              );
            })}
          </div>
          <small className="form-help">Cliquez pour sélectionner/désélectionner les ouvriers disponibles</small>
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