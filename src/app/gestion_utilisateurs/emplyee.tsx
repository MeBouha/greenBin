"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';


interface Employee {
	  id: number;
	  nom: string;
	  prenom: string;
	  role: string;
};

type Props = {
  id?: string;
};

export default function UserForm({ id }: Props) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const inferredId = id ?? searchParams.get('id') ?? undefined;

	const [user, setUser] = useState<Employee | null>(null);
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

	const handleChange = (field: keyof Employee, value: string) => {
		setUser(prev => {
			if (!prev) return prev;
			return { ...prev, [field]: value } as Employee;
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
				// success -> go back to previous page (list)
				try { 
					router.back();
				} catch (e) {
					alert('Utilisateur enregistré');
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
		<div>
			<header className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
				<div style={{display:'flex',alignItems:'center',gap:12}}>
					<div style={{width:36,height:36,borderRadius:18,background:'#10b981',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>GB</div>
					<div style={{fontWeight:600}}>GreenBin</div>
				</div>
				<div style={{fontWeight:600}}>Dashboard Admin</div>
				<div><img src="/profile_pic.png" alt="profile" style={{width:36,height:36,borderRadius:18}}/></div>
			</header>

			<div style={{ padding: 20, display: 'flex', justifyContent: 'center' }}>
				<div style={{ width: '100%', maxWidth: 700 }}>
					<h2 style={{ textAlign: 'center' }}>Modifier l'utilisateur {user.id}</h2>
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

				<div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
					<button onClick={() => router.back()} className="btn" type="button">Annuler</button>
					<button onClick={handleSave} className="btn" type="button">Enregistrer</button>
				</div>
				</div>
				</div>
				</div>
		</div>
	);
}

