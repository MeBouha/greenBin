"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface User {
	id: number;
	nom: string;
	prenom: string;
	role: string;
	login?: string;
	password?: string;
}

type Props = {
	id?: string | number;
};

export default function UserForm({ id }: Props) {
	const pathname = usePathname?.() || '';
	const router = useRouter();
	const inferredId = id ?? (() => {
		const segs = pathname.split('/').filter(Boolean);
		// try last segment
		return segs.length ? segs[segs.length - 1] : undefined;
	})();

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
						login: found.login || '',
						password: found.password || '',
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
		setUser(prev => prev ? { ...prev, [field]: value } : prev);
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
					<input value={user.role} onChange={e => handleChange('role', e.target.value)} className="input" />
				</label>

				<label>
					Login
					<input value={user.login || ''} onChange={e => handleChange('login', e.target.value)} className="input" />
				</label>

				<label>
					Password
					<input value={user.password || ''} onChange={e => handleChange('password', e.target.value)} className="input" />
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

