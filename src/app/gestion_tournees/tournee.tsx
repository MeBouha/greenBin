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

    const handleGoBack = () => {
        router.back();
    };

    if (loading) return <div className="loading-state">Chargement des tournées...</div>;
    if (error) return <div className="error-state">Erreur: {error}</div>;
    if (!tournees.length) return <div className="empty-state">Aucune tournée trouvée</div>;

    return (
        <>
            {/* Beautiful Green "Retour" Button — Top Left */}
            <div className="header-action-bar">
                <button
                    type="button"
                    onClick={handleGoBack}
                    className="btn-back"
                    aria-label="Retour à la page précédente"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    <span>Retour</span>
                </button>
            </div>

            <section className="tournees-section">
                <h2 className="section-title">Tournées de Collecte</h2>

                <div className="tournees-grid">
                    {tournees.map((t) => (
                        <div key={t.id} className="tournee-card">
                            <div className="tournee-header">
                                <div className="tournee-id">Tournée #{t.id}</div>
                                <div className="tournee-date">{t.date ? new Date(t.date).toLocaleDateString('fr-FR') : '—'}</div>
                            </div>

                            <div className="tournee-details">
                                <div className="detail-item">
                                    <span className="detail-label">📍 Zone</span>
                                    <span className="detail-value">{t.zone}</span>
                                </div>

                                <div className="detail-item">
                                    <span className="detail-label">🚛 Véhicule</span>
                                    <span className="detail-value">
                                        {t.vehicule?.matricule 
                                            ? `Matricule : ${t.vehicule.matricule}` 
                                            : t.vehicule 
                                                ? `ID ${t.vehicule.id}` 
                                                : '—'}
                                    </span>
                                </div>

                                {t.chef && (
                                    <div className="detail-item">
                                        <span className="detail-label">👷 Chef</span>
                                        <span className="detail-value">
                                            {t.chef.prenom} {t.chef.nom}
                                        </span>
                                    </div>
                                )}

                                {t.ouvriers && t.ouvriers.length > 0 && (
                                    <div className="detail-item">
                                        <span className="detail-label">👥 Équipe</span>
                                        <span className="detail-value">
                                            {t.ouvriers.length} ouvrier{t.ouvriers.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                )}

                                {t.trashCans && t.trashCans.length > 0 && (
                                    <div className="detail-item">
                                        <span className="detail-label">🗑️ Poubelles</span>
                                        <span className="detail-value">
                                            {t.trashCans.length}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="tournee-actions">
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
                        className="btn-green"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        <span>Signaler un problème</span>
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
                        className="btn-outline"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                        <span>Mes réclamations</span>
                    </button>
                </div>
            </section>

            {/* Modals */}
            {showAdd && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        {AddComponent ? (
                            <AddComponent onClose={() => setShowAdd(false)} />
                        ) : (
                            <div className="loading-state">Chargement...</div>
                        )}
                    </div>
                </div>
            )}

            {showReclamations && (
                <div className="modal-overlay full-height">
                    <div className="modal-content full-screen">
                        {ReclamationComponent ? (
                            <ReclamationComponent onClose={() => setShowReclamations(false)} />
                        ) : (
                            <div className="loading-state" style={{ padding: 20 }}>
                                Chargement...
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                /* ===== Top Action Bar (Back Button) ===== */
                .header-action-bar {
                    padding: 16px 20px 0;
                    max-width: 1100px;
                    margin: 0 auto;
                }

                .btn-back {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: white;
                    color: #047857;
                    font-weight: 600;
                    padding: 10px 18px;
                    border-radius: 12px;
                    border: 2px solid #10b981;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.1);
                }

                .btn-back:hover {
                    background: #f0fdf4;
                    color: #065f46;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
                    border-color: #059669;
                }

                .btn-back svg {
                    width: 18px;
                    height: 18px;
                }

                /* ===== Section ===== */
                .tournees-section {
                    padding: 0 20px 32px;
                    max-width: 1100px;
                    margin: 0 auto;
                }

                .section-title {
                    text-align: center;
                    font-size: 28px;
                    font-weight: 800;
                    color: #099e74ff;
                    margin: 20px 0 32px;

                }

                /* ===== Cards ===== */
                .tournees-grid {
                    display: grid;
                    gap: 24px;
                    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                }

                .tournee-card {
                    border-radius: 16px;
                    padding: 20px;
                    background: white;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.04);
                    border: 1px solid #e5e7eb;
                    transition: all 0.3s ease;
                }

                .tournee-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.12);
                    border-color: #a7f3d0;
                }

                .tournee-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 18px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #f3f4f6;
                }

                .tournee-id {
                    font-weight: 700;
                    font-size: 18px;
                    color: #111827;
                }

                .tournee-date {
                    background: #ecfdf5;
                    color: #065f46;
                    font-size: 13px;
                    font-weight: 600;
                    padding: 4px 10px;
                    border-radius: 20px;
                }

                .tournee-details {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .detail-item {
                    display: flex;
                    gap: 10px;
                }

                .detail-label {
                    min-width: 90px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #065f46;
                }

                .detail-value {
                    flex: 1;
                    font-size: 15px;
                    color: #1f2937;
                    font-weight: 500;
                }

                /* ===== Action Buttons ===== */
                .tournee-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                    justify-content: center;
                    margin-top: 40px;
                }

                .btn-green,
                .btn-outline {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 14px 28px;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    border: none;
                    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.2);
                }

                .btn-green {
                    background: linear-gradient(135deg, #10b981, #06b885ff);
                    color: white;
                }

                .btn-green:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
                }

                .btn-outline {
                    background: white;
                    color: #047857;
                    border: 2px solid #10b981;
                }

                .btn-outline:hover {
                    background: #f0fdf4;
                    transform: translateY(-3px);
                    box-shadow: 0 6px 18px rgba(16, 185, 129, 0.18);
                }

                /* ===== Modals ===== */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.45);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    animation: fadeIn 0.2s ease;
                }

                .modal-overlay.full-height {
                    align-items: stretch;
                }

                .modal-content {
                    width: min(920px, 96%);
                    max-height: 90vh;
                    overflow: auto;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.25);
                }

                .modal-content.full-screen {
                    width: 100%;
                    height: 100%;
                    border-radius: 0;
                }

                /* ===== Utils ===== */
                .loading-state,
                .empty-state,
                .error-state {
                    text-align: center;
                    padding: 40px 20px;
                    font-size: 17px;
                    color: #6b7280;
                }

                .error-state {
                    color: #dc2626;
                }

                /* Animations */
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                /* Mobile */
                @media (max-width: 768px) {
                    .tournees-grid {
                        grid-template-columns: 1fr;
                    }

                    .tournee-actions {
                        flex-direction: column;
                    }

                    .section-title {
                        font-size: 24px;
                    }

                    .btn-back {
                        padding: 10px 16px;
                    }

                    .btn-green,
                    .btn-outline {
                        width: 100%;
                        justify-content: center;
                    }
                }

                @media (max-width: 480px) {
                    .header-action-bar {
                        padding-left: 12px;
                    }

                    .tournee-card {
                        padding: 16px;
                    }
                }
            `}</style>
        </>
    );
}