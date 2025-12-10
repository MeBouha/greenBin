import { useState } from 'react';
import { Notification, NotificationFormData } from '../page';

interface EnvoyerNotificationProps {
  notifications: Notification[];
  loading: boolean;
  onDeleteNotification: (id: string) => void;
  onModifyNotification: (notification: Notification) => void;
  onAddNotification: (data: Omit<NotificationFormData, 'id'>) => Promise<void>;
  deletingNotificationId: string | null;
}

export default function EnvoyerNotification({
  notifications,
  loading,
  onDeleteNotification,
  onModifyNotification,
  onAddNotification,
  deletingNotificationId
}: EnvoyerNotificationProps) {
  const [formData, setFormData] = useState<Omit<NotificationFormData, 'id'>>({
    chefTourneeId: '',
    travailId: '',
    contenu: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onAddNotification(formData);
      setFormData({
        chefTourneeId: '',
        travailId: '',
        contenu: ''
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="content-card">
        <div className="loading-state">
          <p>Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="content-card">
        <h2>Envoyer une Nouvelle Notification</h2>
        
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
              placeholder="Entrez l'ID du chef de tournée"
              disabled={isSubmitting}
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
              placeholder="Entrez l'ID du travail"
              disabled={isSubmitting}
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
              placeholder="Tapez votre message ici..."
              disabled={isSubmitting}
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer la notification'}
            </button>
          </div>
        </form>
      </div>

      <div className="content-card">
        <div className="section-header">
          <h2>Historique des Notifications</h2>
          <div className="stats-info">
            Total: {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {notifications.length === 0 ? (
          <div className="empty-state">
            <h3>Aucune notification trouvée</h3>
            <p>Il n'y a aucune notification à afficher pour le moment.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Chef de Tournée ID</th>
                  <th>Travail ID</th>
                  <th>Contenu</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr key={notification.id}>
                    <td className="id-cell">#{notification.id}</td>
                    <td>
                      <span className="type-badge">#{notification.chefTourneeId}</span>
                    </td>
                    <td>
                      <span className="type-badge">#{notification.travailId}</span>
                    </td>
                    <td className="content-cell">
                      <div className="content-text" title={notification.contenu}>
                        {notification.contenu.length > 100 
                          ? `${notification.contenu.substring(0, 100)}...` 
                          : notification.contenu
                        }
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-edit"
                          onClick={() => onModifyNotification(notification)}
                          disabled={isSubmitting}
                        >
                          Modifier
                        </button>
                        <button 
                          className="btn btn-delete"
                          onClick={() => onDeleteNotification(notification.id)}
                          disabled={deletingNotificationId === notification.id || isSubmitting}
                        >
                          {deletingNotificationId === notification.id ? 'Suppression...' : 'Supprimer'}
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
    </div>
  );
}