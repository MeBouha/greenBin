import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  chefTourneeId: string;
  travailId: string;
  contenu: string;
  chefNom?: string;
  travailZone?: string;
  travailDate?: string;
}

interface NotificationFormData {
  id: string;
  chefTourneeId: string;
  travailId: string;
  contenu: string;
}

interface ChauffeurOption {
  id: string;
  nom: string;
  prenom: string;
}

interface EnvoyerNotificationProps {
  notifications: Notification[];
  loading: boolean;
  onDeleteNotification: (id: string) => void;
  onModifyNotification: (notification: Notification) => void;
  onAddNotification: (data: Omit<NotificationFormData, 'id'>) => Promise<void>;
  deletingNotificationId: string | null;
  chauffeurOptions: ChauffeurOption[];
}

export default function EnvoyerNotification({
  notifications,
  loading,
  onDeleteNotification,
  onModifyNotification,
  onAddNotification,
  deletingNotificationId,
  chauffeurOptions
}: EnvoyerNotificationProps) {
  const [formData, setFormData] = useState<Omit<NotificationFormData, 'id'>>({
    chefTourneeId: '',
    travailId: '',
    contenu: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Récupère l'utilisateur connecté pour filtrer les notifications qui lui sont destinées
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id !== undefined && parsed?.id !== null) {
          setCurrentUserId(String(parsed.id));
        }
      }
    } catch (err) {
      console.error('Erreur lors de la lecture de l’utilisateur connecté :', err);
    }
  }, []);

  const myNotifications = currentUserId
    ? notifications.filter((n) => n.chefTourneeId === currentUserId)
    : [];

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      <div className="content-card" style={{ position: 'relative' }}>
        {myNotifications.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxWidth: 280,
              zIndex: 2
            }}
          >
            {myNotifications.map((n) => (
              <div
                key={n.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: 10,
                  padding: '10px 12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  fontSize: '0.9rem',
                  color: '#2d2d2d'
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  Notification #{n.id}
                </div>
                <div style={{ marginBottom: 4 }}>
                  {n.travailZone || 'Zone N/A'}
                </div>
                <div style={{ marginBottom: 6, fontSize: '0.8rem', color: '#555' }}>
                  {n.travailDate || 'Date N/A'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#444' }}>
                  {n.contenu.length > 160 ? `${n.contenu.slice(0, 157)}...` : n.contenu}
                </div>
              </div>
            ))}
          </div>
        )}

        <h2>Envoyer une Nouvelle Notification</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Chef de Tournée</label>
            <select
              name="chefTourneeId"
              value={formData.chefTourneeId}
              onChange={handleChange}
              className="form-control"
              required
              disabled={isSubmitting}
            >
              <option value="">Sélectionnez un chef de tournée</option>
              {chauffeurOptions.map((chauffeur) => (
                <option key={chauffeur.id} value={chauffeur.id}>
                  {chauffeur.prenom} {chauffeur.nom}
                </option>
              ))}
            </select>
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
                  <th>Chef de Tournée</th>
                  <th>Zone</th>
                  <th>Date Travail</th>
                  <th>Contenu</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr key={notification.id}>
                    <td className="id-cell">#{notification.id}</td>
                    <td>
                      <span className="type-badge">{notification.chefNom || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="type-badge">{notification.travailZone || 'N/A'}</span>
                    </td>
                    <td className="date-cell">{notification.travailDate || 'N/A'}</td>
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