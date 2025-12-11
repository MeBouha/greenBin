"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type TrashCan = {
    id: number;
    adresse?: string;
    latitude?: number;
    longitude?: number;
    typeDechet?: string;
    status?: string;
};

type User = { id: number; nom?: string; prenom?: string; role?: string; login?: string };

type TourneeType = {
    id: number;
    zone: string;
    date?: string;
    trashCans?: TrashCan[];
    ouvriers?: User[];
    vehicule?: { id: number; matricule?: string; chauffeurId?: number; disponibilite?: string } | null;
    chef?: User | null;
};

export default function Tournee() {
    const [tournees, setTournees] = useState<TourneeType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [showAdd, setShowAdd] = useState(false);
    const [showReclamations, setShowReclamations] = useState(false);
    const [AddComponent, setAddComponent] = useState<any>(null);
    const [ReclamationComponent, setReclamationComponent] = useState<any>(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/tournees?enriched=true');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (mounted) setTournees(Array.isArray(data) ? data : []);
            } catch (err: any) {
                console.error('Failed to load tournees', err);
                if (mounted) setError(String(err?.message ?? err));
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    if (loading) return <div style={{ padding: 20 }}>Chargement des tournées...</div>;
    if (error) return <div style={{ padding: 20, color: 'red' }}>Erreur: {error}</div>;
    if (!tournees.length) return <div style={{ padding: 20 }}>Aucune tournée trouvée</div>;

    return (
        <div style={{ padding: 20 }}>
            <h2 style={{ textAlign: 'center' }}>Tournées</h2>
            <div style={{ display: 'grid', gap: 16 }}>
                {tournees.map((t) => (
                    <div key={t.id} style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ fontWeight: 700 }}>Tournée #{t.id}</div>
                            <div style={{ color: '#666' }}>{t.date ?? '—'}</div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ minWidth: 200 }}>
                                <div style={{ fontSize: 12, color: '#666' }}>Véhicule</div>
                                <div>{t.vehicule ? `${t.vehicule.matricule ?? 'ID ' + t.vehicule.id}` : '—'}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ minWidth: 200}}>
                                <div style={{ fontSize: 12, color: '#666' }}>Zone</div>
                                <div>{t.zone ?? '—'}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 18 }}>
                <button
                    type="button"
                    onClick={async () => {
                        if (!AddComponent) {
                            try {
                                const m = await import('../gestion_reclamations/addReclamation');
                                setAddComponent(() => (m.default ?? m));
                            } catch (e) {
                                console.error('Failed to load AddReclamation component', e);
                                return;
                            }
                        }
                        setShowAdd(true);
                    }}
                    aria-label="Envoyer une réclamation"
                    style={{
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        padding: '10px 18px',
                        borderRadius: 10,
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                        boxShadow: '0 6px 18px rgba(239,68,68,0.14)',
                    }}
                >
                    Envoyer une réclamation
                </button>
                <button
                    type="button"
                    onClick={async () => {
                        if (!ReclamationComponent) {
                            try {
                                const m = await import('../gestion_reclamations/reclamation');
                                setReclamationComponent(() => (m.default ?? m));
                            } catch (e) {
                                console.error('Failed to load Reclamation component', e);
                                return;
                            }
                        }
                        setShowReclamations(true);
                    }}
                    aria-label="Consulter les réclamations"
                    style={{
                        backgroundColor: '#2563eb',
                        color: '#fff',
                        padding: '10px 18px',
                        borderRadius: 10,
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                        boxShadow: '0 6px 18px rgba(37,99,235,0.14)',
                    }}
                >
                    Consulter les réclamations
                </button>
            </div>

            {showAdd && (
                <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.4)',zIndex:2000}}>
                    <div style={{width:'min(900px,96%)',maxHeight:'90vh',overflow:'auto',background:'#fff',borderRadius:8,padding:12}}>
                        {AddComponent ? <AddComponent onClose={() => setShowAdd(false)} /> : <div>Loading...</div>}
                    </div>
                </div>
            )}

            {showReclamations && (
                <div style={{position:'fixed',inset:0,display:'flex',alignItems:'stretch',justifyContent:'stretch',background:'rgba(0,0,0,0.4)',zIndex:2000}}>
                    <div style={{width:'100%',height:'100%',background:'#fff',overflow:'auto'}} onClick={(e) => e.stopPropagation()}>
                        {ReclamationComponent ? <ReclamationComponent onClose={() => setShowReclamations(false)} /> : <div style={{padding:20}}>Loading...</div>}
                    </div>
                </div>
            )}
        </div>
    );
}
    
    