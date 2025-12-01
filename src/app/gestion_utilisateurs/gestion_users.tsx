'use client';

import { Delete } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    nom: string;
    prenom: string;
    role: string;
    login?: string;     // optionnel si tu veux
    password?: string;  // optionnel mais affichage déconseillé
}

export default function GestionUsers() {
    const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({ login: '', password: '', nom: '', prenom: '', role: '' });

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
            login: u.login,
            password: u.password,
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
              <input value={newUser.login || ''} onChange={e => setNewUser(n => ({ ...n, login: e.target.value }))} className="input" />
            </label>
            <label>
              Password
              <input value={newUser.password || ''} onChange={e => setNewUser(n => ({ ...n, password: e.target.value }))} className="input" />
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
              <input value={newUser.role || ''} onChange={e => setNewUser(n => ({ ...n, role: e.target.value }))} className="input" />
            </label>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn">Annuler</button>
            <button type="button" onClick={async () => {
              // basic validation
              if (!newUser.login || !newUser.password || !newUser.nom) {
                alert('Veuillez renseigner au moins login, password et nom');
                return;
              }
              try {
                // send without id so server assigns new id
                const body = { login: newUser.login, password: newUser.password, nom: newUser.nom, prenom: newUser.prenom || '', role: newUser.role || '' };
                const res = await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                if (!res.ok) {
                  const txt = await res.text();
                  console.error('create user failed', res.status, txt);
                  alert('Erreur lors de la création (voir console)');
                  return;
                }
                const data = await res.json();
                // server returns the updated users list
                setUsers((data || []).map((u: any) => ({ id: Number(u.id) || Number(u['@_id'] || 0), nom: u.nom || u.name || '', prenom: u.prenom, role: u.role, login: u.login, password: u.password })));
                setShowAddForm(false);
                setNewUser({ login: '', password: '', nom: '', prenom: '', role: '' });
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
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.login}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.password}</td>
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
                  onClick={() => router.push('/users/edit/' + user.id)}
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
