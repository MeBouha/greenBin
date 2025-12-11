'use client';

import { Delete } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
};

export default function GestionUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
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

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Gestion des Utilisateurs</h2>
        <img
          src="/icons/add.png"
          alt="Ajouter"
          title="Ajouter un utilisateur"
          style={{ width: 28, height: 28, cursor: 'pointer' }}
          onClick={() => setShowAddForm(s => !s)}
        />
      </div>

      {showAddForm && (
        <div style={{ marginTop: 12, marginBottom: 12, padding: 12, border: '1px solid #ddd', borderRadius: 6, maxWidth: 700 }}>
          <h3 style={{ marginTop: 0 }}>Ajouter un utilisateur</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <label>
              Login
              <input
                value={newUser.compte?.login || ''}
                onChange={e => setNewUser(n => ({ ...n, compte: { ...(n.compte || newCompte), login: e.target.value } }))}
                className="input"
              />
            </label>
            <label>
              Password
              <input
                value={newUser.compte?.password || ''}
                onChange={e => setNewUser(n => ({ ...n, compte: { ...(n.compte || newCompte), password: e.target.value } }))}
                className="input"
              />
            </label>
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
              // basic validation
              if (!newUser.compte?.login || !newUser.compte?.password || !newUser.nom) {
                alert('Veuillez renseigner au moins login, password et nom');
                return;
              }
              try {
                // send without id so server assigns new id
                const body = { 
                  compte: { 
                    login: newUser.compte?.login, 
                    password: newUser.compte?.password,
                    etat: 'actif'
                  }, 
                  nom: newUser.nom, 
                  prenom: newUser.prenom || '', 
                  role: newUser.role || '' 
                };
                const res = await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                if (!res.ok) {
                  const txt = await res.text();
                  console.error('create user failed', res.status, txt);
                  alert('Erreur lors de la création (voir console)');
                  return;
                }
                const data = await res.json();
                // server returns the updated users list
                setUsers((data || []).map((u: any) => ({ id: Number(u.id) || Number(u['@_id'] || 0), nom: u.nom || u.name || '', prenom: u.prenom, role: u.role, compte: { login: u.compte?.login || '', password: u.compte?.password || '', etat: u.compte?.etat || 'actif' } })));
                setShowAddForm(false);
                setNewUser({ compte: { login: '', password: '', etat: 'actif' }, nom: '', prenom: '', role: '' });
              } catch (err) {
                console.error('create error', err);
                alert('Erreur lors de la création (voir console)');
              }
            }} className="btn">Créer</button>
          </div>
        </div>
      )}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "15px"
        }}
      >
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>ID</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Nom</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Prénom</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Rôle</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Login</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Password</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Etat du compte</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.id}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.nom}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.prenom}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.role}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.compte.login}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.compte.password}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.compte.etat}</td>
                <td
                    style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    display: "flex",
                    justifyContent: "center", 
                    alignItems: "center", 
                }}
                >
                <button
                  type="button"
                  onClick={() => router.push('/gestion_utilisateurs/user?id=' + user.id)}
                  style={{
                  backgroundColor: '#26dc41ff',
                  color: '#fff',
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  margin: '6px 5px',
                  }}
                >
                  Modifier
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(user.id)}
                  style={{
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  margin: '6px 5px',
                  }}
                >
                  Supprimer
                </button>
                </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
