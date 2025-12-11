'use client';

import { Delete } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './responsable_municipalite/globals.css';
import Users from './users';

type Compte = {
  login: string;
  password: string;
  etat: string; // actif, bloqué
}

interface User {
	  id: number;
	  compte: Compte;
	  nom: string;
	  prenom: string;
	  role: string;
	  disponibilite?: string;
};

export default function GestionUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const newCompte: Compte = { login: '', password: '', etat: 'actif' };
  const [newUser, setNewUser] = useState<Partial<User>>({ compte: newCompte, nom: '', prenom: '', role: '' });

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
            disponibilite: u.disponibilite || '',
            compte: {
              login: u.compte?.login || '',
              password: u.compte?.password || '',
              etat: u.compte?.etat || 'actif',
            },
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
    router.push(`?id=${user.id}`);
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

  if (editId) {
    return (
      <div>
        <div className="content-card">
          <h2>Modifier l'utilisateur</h2>
          <Users id={editId} onClose={() => router.push('?')} />
        </div>
      </div>
    );
  }

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
          
        </div>
      
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
              <th>Login</th>
              <th>Mot de passe</th>
              <th>État du compte</th>
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
                  <td>{user.compte.login}</td>
                  <td>{user.compte.password}</td>
                  <td>{getStatusBadge(user.compte.etat)}</td>
                  <td>{user.disponibilite || '-'}</td>
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
