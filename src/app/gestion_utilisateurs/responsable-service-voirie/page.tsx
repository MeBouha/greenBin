"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../header';

interface Travail {
  id: number | string;
  adresse: string;
  latitude: number;
  longitude: number;
  date: string;
  etat: string;
}

interface FormData {
  id?: string;
  date: string;
  lieu: string;
  latitude: string;
  longitude: string;
  etat: string;
}

export default function ResponsableVoirie() {
  const router = useRouter();
  const [travaux, setTravaux] = useState<Travail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    date: '',
    lieu: '',
    latitude: '',
    longitude: '',
    etat: 'en cours'
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Authentication check
  useEffect(() => {
    setMounted(true);
    try {
      const raw = sessionStorage.getItem('user');
      if (raw) {
        const userData = JSON.parse(raw);
        setCurrentUser(userData);

        // Only allow specific roles
        const allowedRoles = ['responsable service de voirie'];
        if (!allowedRoles.map(r => r.toLowerCase()).includes(userData.role?.toLowerCase())) {
          router.push('/gestion_utilisateurs');
        }
      } else {
        router.push('/gestion_utilisateurs');
      }
    } catch (e) {
      console.error('Auth check failed:', e);
      router.push('/gestion_utilisateurs');
    }
  }, [router]);

  // Fetch data only if authenticated
  useEffect(() => {
    if (!currentUser) return;

    const fetchTravaux = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/travaux');
        if (!response.ok) throw new Error('Failed to fetch travaux');
        const data: Travail[] = await response.json();
        setTravaux(data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des travaux');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTravaux();
  }, [currentUser]);

  // Early return if not mounted (avoid hydration issues)
  if (!mounted) {
    return (
      <div>
        <Header />
        <main style={{ padding: '20px', overflowY: 'auto' }}>
          <h1>Gestion des Travaux de Voirie</h1>
          <p>Chargement...</p>
        </main>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div>
        <Header />
        <main style={{ padding: '20px', overflowY: 'auto' }}>
          <h1>Gestion des Travaux de Voirie</h1>
          <p>Redirection vers la page de connexion...</p>
        </main>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const url = '/api/travaux';
      const method = isEditing ? 'PUT' : 'POST';

      const payload = isEditing
        ? formData
        : {
            date: formData.date,
            lieu: formData.lieu,
            latitude: formData.latitude,
            longitude: formData.longitude,
            etat: formData.etat
          };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Operation failed');

      setSuccessMessage(isEditing ? 'Travail modifié avec succès' : 'Travail ajouté avec succès');
      setShowModal(false);
      resetForm();
      // Refetch
      const res = await fetch('/api/travaux');
      const data = await res.json();
      setTravaux(data);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Erreur lors de l\'opération');
      console.error(err);
    }
  };

  const handleEdit = (travail: Travail) => {
    setIsEditing(true);
    setFormData({
      id: String(travail.id),
      date: travail.date,
      lieu: travail.adresse,
      latitude: String(travail.latitude),
      longitude: String(travail.longitude),
      etat: travail.etat
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce travail ?')) return;

    try {
      const response = await fetch(`/api/travaux?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');

      setSuccessMessage('Travail supprimé avec succès');
      // Refetch
      const res = await fetch('/api/travaux');
      const data = await res.json();
      setTravaux(data);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      lieu: '',
      latitude: '',
      longitude: '',
      etat: 'en cours'
    });
    setIsEditing(false);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const getEtatDisplay = (etat: string) => {
    switch (etat.toLowerCase().trim()) {
      case 'complet': return 'Complet';
      case 'en cours': return 'En cours';
      default: return etat;
    }
  };

return (
  <div>
    <Header />
    <main style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto', 
            marginTop:'100px',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 700, 
          color: '#111827',
          margin: 0,
        }}>
          Gestion des Travaux de Voirie
        </h1>
        <button
          onClick={openAddModal}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '15px',
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0da271'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
        >
          + Ajouter un Travail
        </button>
      </div>

      {successMessage && (
        <div style={{
          backgroundColor: '#ecfdf5',
          color: '#065f46',
          padding: '14px 20px',
          borderRadius: '10px',
          border: '1px solid #a7f3d0',
          marginBottom: '20px',
          fontSize: '15px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span>✓</span> {successMessage}
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          padding: '14px 20px',
          borderRadius: '10px',
          border: '1px solid #fecaca',
          marginBottom: '20px',
          fontSize: '15px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {loading ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px',
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Chargement des travaux...</p>
          <style jsx global>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '40px',
        }}>
          {travaux.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px dashed #d1d5db',
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                margin: '0 auto 20px',
                backgroundColor: '#f0fdf4',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                fontSize: '28px',
              }}>🚧</div>
              <h3 style={{ color: '#4b5563', fontWeight: 600, fontSize: '18px', marginBottom: '8px' }}>
                Aucun travail pour le moment
              </h3>
              <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto' }}>
                Commencez par ajouter un nouveau travail de voirie pour le suivre ici.
              </p>
            </div>
          ) : (
            travaux.map((travail) => (
              <div 
                key={travail.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                  border: '1px solid #e5e7eb',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    backgroundColor: '#f3f4f6',
                    padding: '4px 10px',
                    borderRadius: '6px',
                  }}>
                    #{travail.id}
                  </span>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: 
                      travail.etat.toLowerCase() === 'complet' 
                        ? '#dcfce7' 
                        : travail.etat.toLowerCase() === 'en cours' 
                          ? '#dcfce7' 
                          : '#fef3c7',
                    color: 
                      travail.etat.toLowerCase() === 'complet' 
                        ? '#047857' 
                        : travail.etat.toLowerCase() === 'en cours' 
                          ? '#059669' 
                          : '#92400e',
                  }}>
                    {getEtatDisplay(travail.etat)}
                  </span>
                </div>

                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 600, 
                  color: '#1f2937', 
                  marginBottom: '6px',
                  minHeight: '36px',
                }}>
                  {travail.adresse || '—'}
                </h3>

                <div style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  marginBottom: '20px',
                  fontSize: '14px',
                  color: '#4b5563',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📅</span>
                    <span>{formatDate(travail.date)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📍</span>
                    <span>{travail.latitude.toFixed(4)}, {travail.longitude.toFixed(4)}</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end',
                  borderTop: '1px solid #f3f4f6',
                  paddingTop: '16px',
                }}>
                  <button
                    onClick={() => handleEdit(travail)}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      backgroundColor: '#f0fdf4',
                      color: '#059669',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dcfce7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(String(travail.id))}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{ 
                fontSize: '22px', 
                fontWeight: 700, 
                color: '#111827',
                margin: 0,
              }}>
                {isEditing ? 'Modifier le Travail' : 'Ajouter un Travail'}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#374151' 
                }}>
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '15px',
                    backgroundColor: '#fafafa',
                    transition: 'border 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#10b981'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#374151' 
                }}>
                  Lieu *
                </label>
                <input
                  type="text"
                  name="lieu"
                  value={formData.lieu}
                  onChange={handleInputChange}
                  placeholder="Ex: Avenue Habib Bourguiba"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '15px',
                    backgroundColor: '#fafafa',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#10b981'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                />
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '16px', 
                marginBottom: '20px' 
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: '#374151' 
                  }}>
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="34.0000"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '10px',
                      fontSize: '15px',
                      backgroundColor: '#fafafa',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#10b981'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: '#374151' 
                  }}>
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="5.1800"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '10px',
                      fontSize: '15px',
                      backgroundColor: '#fafafa',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#10b981'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#374151' 
                }}>
                  État *
                </label>
                <select
                  name="etat"
                  value={formData.etat}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '15px',
                    backgroundColor: 'white',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: '36px',
                  }}
                >
                  <option value="en cours">En cours</option>
                  <option value="complet">Complet</option>
                </select>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end',
                marginTop: '16px',
              }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0da271';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#10b981';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {isEditing ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>

          <style jsx global>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </main>
  </div>
);
}