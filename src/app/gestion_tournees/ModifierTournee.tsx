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

  const [vehicules, setVehicules] = useState<Array<{id:string, matricule:string}>>([]);
  const [ouvriersDisponibles, setOuvriersDisponibles] = useState<Array<{id:string, nom:string, prenom:string}>>([]);

  useEffect(() => {
    // Load vehicules and users from XML
    (async () => {
      try {
        // Vehicules: read id + matricule
        const vRes = await fetch('/data/vehicule.xml');
        const vText = await vRes.text();
        const vDoc = new DOMParser().parseFromString(vText, 'application/xml');
        const vEls = Array.from(vDoc.querySelectorAll('vehicule'));
        const vList = vEls
          .map(el => ({
            id: (el.getAttribute('id') || '').trim(),
            matricule: (el.querySelector('matricule')?.textContent || '').trim(),
            disponibilite: (el.querySelector('disponibilite')?.textContent || '').trim().toLowerCase()
          }))
          .filter(v => v.id && v.matricule && (v.disponibilite === 'disponible' || v.disponibilite === ''))
          .map(v => ({ id: v.id, matricule: v.matricule }));
        setVehicules(vList);

        // Users: filter role='ouvrier' and disponibilite='disponible'
        const uRes = await fetch('/data/users.xml');
        const uText = await uRes.text();
        const uDoc = new DOMParser().parseFromString(uText, 'application/xml');
        const uEls = Array.from(uDoc.querySelectorAll('user'));
        const uList = uEls
          .map(el => ({
            id: (el.getAttribute('id') || '').trim(),
            role: (el.querySelector('role')?.textContent || '').trim().toLowerCase(),
            disponibilite: (el.querySelector('disponibilite')?.textContent || '').trim().toLowerCase(),
            nom: (el.querySelector('nom')?.textContent || '').trim(),
            prenom: (el.querySelector('prenom')?.textContent || '').trim(),
          }))
          .filter(u => u.role === 'ouvrier' && (u.disponibilite === 'disponible' || !u.disponibilite))
          .map(u => ({ id: u.id, nom: u.nom, prenom: u.prenom }));
        setOuvriersDisponibles(uList);
      } catch (err) {
        // silently ignore
      }
    })();
  }, []);

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

  const toggleOuvrier = (id: string) => {
    const currentIds = formData.ouvrierIds.split(',').map(s => s.trim()).filter(Boolean);
    const exists = currentIds.includes(id);
    const nextIds = exists ? currentIds.filter(x => x !== id) : [...currentIds, id];
    setFormData(prev => ({ ...prev, ouvrierIds: nextIds.join(', ') }));
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
            <option value="">Sélectionner un véhicule</option>
            {vehicules.map(v => (
              <option key={v.id} value={v.id}>{v.matricule}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Ouvriers disponibles</label>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {ouvriersDisponibles.map(o => {
              const active = formData.ouvrierIds.split(',').map(s=>s.trim()).filter(Boolean).includes(o.id);
              return (
                <button
                  type="button"
                  key={o.id}
                  className={`chip ${active? 'active':''}`}
                  onClick={() => toggleOuvrier(o.id)}
                >
                  {o.prenom && o.nom ? `${o.prenom} ${o.nom}` : o.id}
                </button>
              );
            })}
          </div>
          <small className="form-help">Seuls les ouvriers avec disponibilité "disponible" sont affichés.</small>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Annuler
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!formData.vehiculeId || formData.ouvrierIds.trim().length === 0}
          >
            {isEditing ? 'Enregistrer les modifications' : 'Ajouter la tournée'}
          </button>
        </div>
      </form>
    </div>
  );
}