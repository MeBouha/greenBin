import { useState } from 'react';

interface Notification {
  id: string;
  chefTourneeId: string;
  travailId: string;
  contenu: string;
}

interface NotificationFormData {
  id: string;
  chefTourneeId: string;
  travailId: string;
  contenu: string;
}

interface ModifierNotificationProps {
  notification?: Notification | null;
  onSave: (data: NotificationFormData) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export default function ModifierNotification({
  notification,
  onSave,
  onCancel,
  isEditing
}: ModifierNotificationProps) {
  const [formData, setFormData] = useState<NotificationFormData>({
    id: notification?.id || '',
    chefTourneeId: notification?.chefTourneeId || '',
    travailId: notification?.travailId || '',
    contenu: notification?.contenu || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
      <h2>Modifier la Notification #{notification?.id}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ID du Chef de Tournée</label>
          <input
            type="text"
            name="chefTourneeId"
            value={formData.chefTourneeId}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label>ID du Travail</label>
          <input
            type="text"
            name="travailId"
            value={formData.travailId}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label>Contenu du Message</label>
          <textarea
            name="contenu"
            value={formData.contenu}
            onChange={handleChange}
            className="form-control"
            rows={5}
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}