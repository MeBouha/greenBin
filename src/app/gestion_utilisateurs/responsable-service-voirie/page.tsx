"use client";

import { useState, useEffect } from 'react';
import './globals.css';
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

  useEffect(() => {
    fetchTravaux();
  }, []);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const url = isEditing ? '/api/travaux' : '/api/travaux';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? formData : {
          date: formData.date,
          lieu: formData.lieu,
          latitude: formData.latitude,
          longitude: formData.longitude,
          etat: formData.etat
        })
      });

      if (!response.ok) throw new Error('Operation failed');
      
      const result = await response.json();
      setSuccessMessage(isEditing ? 'Travail modifié avec succès' : 'Travail ajouté avec succès');
      setShowModal(false);
      resetForm();
      fetchTravaux();
      
      // Clear success message after 3 seconds
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
      fetchTravaux();
      
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

  const getEtatLabel = (etat: string) => {
    switch(etat.toLowerCase()) {
      case 'complet': return 'Complet';
      case 'en cours': return 'En Cours';
      default: return etat;
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div><Header/>
    <div className="container">
      <header className="header">
        <h1>Gestion des Travaux</h1>
      </header>

      {successMessage && (
        <div className="alert alert-success">
          <span>✓</span>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>✗</span>
          {error}
        </div>
      )}

      <div className="mb-4">
        <button className="btn btn-primary" onClick={openAddModal}>
          + Ajouter un Travail
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Lieu</th>
              <th>Coordonnées</th>
              <th>État</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {travaux.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  Aucun travail trouvé
                </td>
              </tr>
            ) : (
              travaux.map((travail) => (
                <tr key={travail.id}>
                  <td>{travail.id}</td>
                  <td>{travail.date}</td>
                  <td>{travail.adresse}</td>
                  <td>
                    {travail.latitude}, {travail.longitude}
                  </td>
                  <td>
                    <span className={`status-badge status-${travail.etat.toLowerCase().replace(' ', '-')}`}>
                      {getEtatLabel(travail.etat)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(travail)}
                    >
                      Modifier
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(String(travail.id))}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {isEditing ? 'Modifier le Travail' : 'Ajouter un Travail'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lieu">Lieu *</label>
                <input
                  type="text"
                  id="lieu"
                  name="lieu"
                  value={formData.lieu}
                  onChange={handleInputChange}
                  placeholder="Entrez le lieu"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="latitude">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="Ex: 34.0"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="longitude">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="Ex: 5.18"
                    required readOnly
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="etat">État *</label>
                <select
                  id="etat"
                  name="etat"
                  value={formData.etat}
                  onChange={handleInputChange}
                  required
                >
                  <option value="en cours">En Cours</option>
                  <option value="complet">Complet</option>
                </select>
              </div>
              <div className="form-group mt-4">
                <button type="submit" className="btn btn-success" style={{ marginRight: '0.5rem' }}>
                  {isEditing ? 'Modifier' : 'Ajouter'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}