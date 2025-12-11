'use client';

import { Delete } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './responsable_municipalite/globals.css';

interface User {
	  id: number;
	  nom: string;
	  prenom: string;
	  role: string;
    disponibilite: string;
};

export default function GestionEmployees() {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({nom: '', prenom: '', role: '' });

    useEffect(() => {
    const load = async () => {
        const res = await fetch('/api/users');
        const data = await res.json();

        setUsers(
          (data || []).map((u: any) => ({
            id: Number(u.id) || 0,
            nom: u.nom || u.name || '',
            prenom: u.prenom,
            role: u.role,
            disponibilite: u.disponibilite || 'disponible',
          }))
        );
    };

        load();
    }, []);

    const router = useRouter();

    const handleDelete = async (id: number) => {
      try {
        if (!confirm('Confirmez-vous la suppression de l\'utilisateur #' + id + ' ?')) return;
        const res = await fetch('/api/users?id=' + encodeURIComponent(String(id)), { method: 'DELETE' });
        if (!res.ok) {
          const body = await res.text();
          console.error('delete failed', res.status, body);
          alert('Erreur lors de la suppression (voir console)');
          return;
        }
        // update client list
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (err) {
        console.error('handleDelete error', err);
        alert('Erreur lors de la suppression (voir console)');
      }
    };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowAddForm(false);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch('/api/users', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(editingUser) 
      });
      if (!res.ok) {
        alert('Erreur lors de la mise à jour');
        return;
      }
      const data = await res.json();
      setUsers((data || []).map((u: any) => ({ 
        id: Number(u.id) || 0, 
        nom: u.nom || '', 
        prenom: u.prenom, 
        role: u.role, 
        compte: { 
          login: u.compte?.login || '', 
          password: u.compte?.password || '', 
          etat: u.compte?.etat || 'actif' 
        } 
      })));
      setEditingUser(null);
      alert('Utilisateur mis à jour avec succès');
    } catch (err) {
      console.error('update error', err);
      alert('Erreur lors de la mise à jour');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { class: string; text: string } } = {
      'actif': { class: 'status-resolved', text: 'Actif' },
      'bloqué': { class: 'status-delete', text: 'Bloqué' }
    };
    
    const config = statusConfig[status] || { class: 'status-new', text: 'Inconnu' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (editingUser) {
    return (
      <div>
        <div className="content-card">
          <h2>Modifier l'utilisateur #{editingUser.id}</h2>
          <div style={{ display: 'grid', gap: 12, maxWidth: 600 }}>
            <label>
              Nom
              <input 
                value={editingUser.nom} 
                onChange={e => setEditingUser({...editingUser, nom: e.target.value})} 
                className="input" 
              />
            </label>
            <label>
              Prénom
              <input 
                value={editingUser.prenom} 
                onChange={e => setEditingUser({...editingUser, prenom: e.target.value})} 
                className="input" 
              />
            </label>
            <label>
              Rôle
              <select 
                value={editingUser.role} 
                onChange={e => setEditingUser({...editingUser, role: e.target.value})} 
                className="input"
              >
                <option value="admin">admin</option>
                <option value="chef de tournee">chef de tournee</option>
                <option value="responsable municipalite">responsable municipalite</option>
                <option value="responsable service d'environnement">responsable service d'environnement</option>
                <option value="ouvrier">ouvrier</option>
              </select>
            </label>
            <label>
              Disponibilité
              <input 
                value={editingUser.disponibilite} 
                onChange={e => setEditingUser({...editingUser, disponibilite: e.target.value})} 
                className="input" 
              />
            </label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => setEditingUser(null)} className="btn" type="button">Annuler</button>
              <button onClick={handleUpdateUser} className="btn btn-primary" type="button">Enregistrer</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="content-card">
        <div className="section-header">
          <div>
            <h2>Liste des Utilisateurs</h2>
            <div className="stats-info">
              Total: {users.length} utilisateur{users.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(s => !s)}
          >
            + Ajouter
          </button>
        </div>

      {showAddForm && (
        <div style={{ marginTop: 12, marginBottom: 12, padding: 12, border: '1px solid #ddd', borderRadius: 6, maxWidth: 700 }}>
          <h3 style={{ marginTop: 0 }}>Ajouter un utilisateur</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <label>
              Nom
              <input value={newUser.nom || ''} onChange={e => setNewUser(n => ({ ...n, nom: e.target.value }))} className="input" />
            </label>
            <label>
              Prénom
              <input value={newUser.prenom || ''} onChange={e => setNewUser(n => ({ ...n, prenom: e.target.value }))} className="input" />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Rôle
                <select value={newUser.role || ''} onChange={e => setNewUser(n => ({ ...n, role: e.target.value }))} className="input">
                  <option value="" disabled>sélectionnez un rôle</option>
                  <option value="admin">admin</option>
                  <option value="chef de tournee">chef de tournee</option>
                  <option value="responsable municipalite">responsable municipalite</option>
                  <option value="responsable service d'environnement">responsable service d'environnement</option>
                  <option value="ouvrier">ouvrier</option>
                </select>
            </label>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn">Annuler</button>
            <button type="button" onClick={async () => {
              
              try {
                // send without id and without compte so server assigns new id
                const body = { 
                  nom: newUser.nom, 
                  prenom: newUser.prenom || '', 
                  role: newUser.role || '' 
                };
                const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                if (!res.ok) {
                  const txt = await res.text();
                  console.error('create user failed', res.status, txt);
                  alert('Erreur lors de la création (voir console)');
                  return;
                }
                const data = await res.json();
                // server returns the updated users list
                setUsers((data || []).map((u: any) => ({ id: Number(u.id) || Number(u['@_id'] || 0), nom: u.nom || u.name || '', prenom: u.prenom, role: u.role })));
                setShowAddForm(false);
                setNewUser({nom: '', prenom: '', role: '' });
                alert('Utilisateur créé avec succès');
              } catch (err) {
                console.error('create error', err);
                alert('Erreur lors de la création (voir console)');
              }
            }} className="btn">Créer</button>
          </div>
        </div>
      )}
      
        {users.length === 0 ? (
          <div className="empty-state">
            <h3>Aucun utilisateur trouvé</h3>
            <p>Il n'y a aucun utilisateur à afficher pour le moment.</p>
          </div>
        ) : (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Rôle</th>
              <th>Disponibilité</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                  <td className="id-cell">#{user.id}</td>
                  <td>{user.nom}</td>
                  <td>{user.prenom}</td>
                  <td>{user.role}</td>
                  <td>
                    <div className="action-buttons">
                <button
                  type="button"
                  className="btn btn-edit"
                  onClick={() => handleEdit(user)}
                >
                  Modifier
                </button>

                <button
                  type="button"
                  className="btn btn-delete"
                  onClick={() => handleDelete(user.id)}
                >
                  Supprimer
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

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Utilisateurs</h3>
          <div className="value">{users.length}</div>
        </div>
      </div>
    </div>
  );
}
