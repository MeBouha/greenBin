"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface User {
  id: number;
  nom: string;
  prenom: string;
  role: string;
  disponibilite?: string;
  compte: {
    login: string;
    password: string;
    etat: string;
  };
}

type Props = {
  id?: string;
  onClose?: () => void;
};

export default function Users({ id, onClose }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inferredId = id ?? searchParams.get('id') ?? undefined;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!inferredId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        const found = (data || []).find((u: any) => String(u.id) === String(inferredId));
        if (found) {
          setUser({
            id: Number(found.id) || Number(inferredId),
            nom: found.nom || found.name || '',
            prenom: found.prenom || '',
            role: found.role || '',
            disponibilite: found.disponibilite || '',
            compte: {
              login: found.compte?.login || '',
              password: found.compte?.password || '',
              etat: found.compte?.etat || '',
            },
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('load user error', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [inferredId]);

  const handleChange = (field: keyof User, value: string) => {
    setUser(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value } as User;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user) });
      if (!res.ok) {
        console.warn('PUT /api/users failed', res.status);
        alert('Erreur lors de la sauvegarde (voir console)');
      } else {
        if (onClose) {
          onClose();
        } else {
          router.back();
        }
      }
    } catch (err) {
      console.error('save error', err);
      alert('Erreur lors de la sauvegarde (voir console)');
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Chargement de l'utilisateur...</div>;
  if (!user) return <div style={{ padding: 20 }}>Utilisateur introuvable</div>;

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 600, margin: '0 auto', background: 'transparent' }}>
      <label>
        Nom
        <input value={user.nom} onChange={e => handleChange('nom', e.target.value)} className="input" readOnly/>
      </label>

      <label>
        Prénom
        <input value={user.prenom} onChange={e => handleChange('prenom', e.target.value)} className="input" readOnly/>
      </label>

      <label>
        Rôle
        <select value={user.role} onChange={e => handleChange('role', e.target.value)} className="input" >
          <option value="admin">admin</option>
          <option value="chef de tournee">chef de tournee</option>
          <option value="responsable municipalite">responsable municipalite</option>
          <option value="responsable service d'environnement">responsable service d'environnement</option>
          <option value="ouvrier">ouvrier</option>
        </select>
      </label>

      <h3 style={{ marginTop: 0, marginBottom: 12, color: '#374151' }}>Informations du Compte</h3>

      <label>
        Disponibilité
        <input value={user.disponibilite || ''} onChange={e => setUser({...user, disponibilite: e.target.value})} className="input" />
      </label>

      <label>
        Login
        <input value={user.compte.login} onChange={e => setUser({...user, compte: {...user.compte, login: e.target.value}})} className="input" />
      </label>

      <label>
        Mot de passe
        <input type="text" value={user.compte.password} onChange={e => setUser({...user, compte: {...user.compte, password: e.target.value}})} className="input" />
      </label>

      <label>
        État
        <select value={user.compte.etat} onChange={e => setUser({...user, compte: {...user.compte, etat: e.target.value}})} className="input">
          <option value="actif">Actif</option>
          <option value="bloqué">Bloqué</option>
        </select>
      </label>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={() => onClose ? onClose() : router.back()} className="btn" type="button">Annuler</button>
        <button onClick={handleSave} className="btn" type="button">Enregistrer</button>
      </div>
    </div>
  );
}
