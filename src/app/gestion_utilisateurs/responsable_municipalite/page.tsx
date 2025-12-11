"use client"
import { useState, useEffect } from 'react';
import "./globals.css";

// Import des composants
import Sidebar from './components/Sidebar';
import Header from '../header';
import ConsulterReclamations from '../../gestion_reclamations/ConsulterReclamations';
import GererPointsCollecte from '../../gestion_tournees/gestion_ts_collectes/GererPointsCollecte';
import GererVehicule from '../../gestion_tournees/gestion_vehicules/GererVehicule';
import GererTournees from '../../gestion_tournees/GererTournees';
import ConsulterRapports from '../../gestion_tournees/ConsulterRapports';
import EnvoyerNotification from '../../gestion_tournees/EnvoyerNotification';
import ModifierPointCollecte from '../../gestion_tournees/gestion_ts_collectes/ModifierPointCollecte';
import ModifierVehicule from '../../gestion_tournees/gestion_vehicules/ModifierVehicule';
import ModifierTournee from '../../gestion_tournees/ModifierTournee';
import ModifierNotification from '../../gestion_tournees/ModifierNotification';
import GestionEmployees from '../gestion_employees';

// Définition des interfaces
export interface Reclamation {
  id: string;
  citoyenId: string;
  citoyen: string;
  contenu: string;
  date: string;
  status: string;
  type: string;
}

export interface TrashCan {
  id: string;
  adresse: string;
  latitude: string;
  longitude: string;
  typeDechet: string;
  status: string;
}

export interface Vehicule {
  id: string;
  matricule: string;
  chauffeur: string;
  chauffeurId: string;
  disponibilite: string;
}

export interface Tournee {
  id: string;
  zone: string;
  ouvrierIds: string[];
  vehiculeId: string;
  date: string;
}

export interface Ouvrier {
  id: string;
  nom: string;
  prenom: string;
  status: string;
}

export interface DechetCollecte {
  id: string;
  quantite: string;
}

export interface Rapport {
  id: string;
  date: string;
  tourneeId: string;
  chefTourneId: string;
  ouvriers: Ouvrier[];
  dechetsCollecte: DechetCollecte[];
}

export interface Notification {
  id: string;
  chefTourneeId: string;
  travailId: string;
  contenu: string;
}

// Form data interfaces
export interface TrashCanFormData {
  id: string;
  adresse: string;
  latitude: string;
  longitude: string;
  typeDechet: string;
  status: string;
}

export interface VehiculeFormData {
  id: string;
  matricule: string;
  chauffeurId: string;
  disponibilite: string;
}

export interface TourneeFormData {
  id: string;
  date: string;
  vehiculeId: string;
  trashCanIds: string;
  ouvrierIds: string;
}

export interface NotificationFormData {
  id: string;
  chefTourneeId: string;
  travailId: string;
  contenu: string;
}

export default function RespMPage() {
  const [activeSection, setActiveSection] = useState('consulter-reclamations');
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [trashCans, setTrashCans] = useState<TrashCan[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [tournees, setTournees] = useState<Tournee[]>([]);
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrashCans, setLoadingTrashCans] = useState(true);
  const [loadingVehicules, setLoadingVehicules] = useState(true);
  const [loadingTournees, setLoadingTournees] = useState(true);
  const [loadingRapports, setLoadingRapports] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingTrashCanId, setDeletingTrashCanId] = useState<string | null>(null);
  const [deletingVehiculeId, setDeletingVehiculeId] = useState<string | null>(null);
  const [deletingTourneeId, setDeletingTourneeId] = useState<string | null>(null);
  const [deletingRapportId, setDeletingRapportId] = useState<string | null>(null);
  const [deletingNotificationId, setDeletingNotificationId] = useState<string | null>(null);
  const [selectedTrashCan, setSelectedTrashCan] = useState<TrashCan | null>(null);
  const [selectedVehicule, setSelectedVehicule] = useState<Vehicule | null>(null);
  const [selectedTournee, setSelectedTournee] = useState<Tournee | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isAddingTrashCan, setIsAddingTrashCan] = useState(false);
  const [isAddingVehicule, setIsAddingVehicule] = useState(false);
  const [isAddingTournee, setIsAddingTournee] = useState(false);

  const menuItems = [
    { id: 'consulter-reclamations', label: 'Consulter les réclamations' },
    { id: 'gerer-points-collecte', label: 'Gérer les points de collecte' },
    { id: 'gerer-vehicule', label: 'Gérer les véhicules' },
    { id: 'gerer-employes', label: 'Gérer les employés' },
    { id: 'gerer-tournees', label: 'Gérer les tournées' },
    { id: 'consulter-rapports', label: 'Consulter les rapports' },
    { id: 'envoyer-notification', label: 'Envoyer une notification' },
  ];

  // Fonctions de fetch
  const fetchReclamations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/data/reclamation.xml?t=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) throw new Error('Error parsing XML');
      
      const reclamationNodes = xmlDoc.getElementsByTagName('reclamation');
      const reclamationsData: Reclamation[] = [];
      
      for (let i = 0; i < reclamationNodes.length; i++) {
        const node = reclamationNodes[i];
        const citoyen = node.getElementsByTagName('citoyen')[0];
        const contenu = node.getElementsByTagName('contenu')[0];
        const date = node.getElementsByTagName('date')[0];
        const status = node.getElementsByTagName('status')[0];
        const type = node.getElementsByTagName('type')[0];
        
        reclamationsData.push({
          id: node.getAttribute('id') || '',
          citoyenId: citoyen ? citoyen.getAttribute('id') || '' : 'N/A',
          citoyen: citoyen ? citoyen.textContent || '' : 'Inconnu',
          contenu: contenu ? contenu.textContent || '' : 'N/A',
          date: date ? date.textContent || '' : 'N/A',
          status: status ? status.textContent || '' : 'new',
          type: type ? type.textContent || '' : 'Général'
        });
      }
      
      setReclamations(reclamationsData);
    } catch (error) {
      console.error('Error fetching reclamations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrashCans = async () => {
    try {
      setLoadingTrashCans(true);
      const response = await fetch(`/data/trashcan.xml?t=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) throw new Error('Error parsing XML');
      
      const trashCanNodes = xmlDoc.getElementsByTagName('trashCan');
      const trashCansData: TrashCan[] = [];
      
      for (let i = 0; i < trashCanNodes.length; i++) {
        const node = trashCanNodes[i];
        const lieu = node.getElementsByTagName('lieu')[0];
        const adresse = lieu ? lieu.getElementsByTagName('adresse')[0] : null;
        const coordonnees = lieu ? lieu.getElementsByTagName('coordonnees')[0] : null;
        const latitude = coordonnees ? coordonnees.getElementsByTagName('latitude')[0] : null;
        const longitude = coordonnees ? coordonnees.getElementsByTagName('longitude')[0] : null;
        const typeDechet = node.getElementsByTagName('typeDechet')[0];
        const status = node.getElementsByTagName('status')[0];
        
        trashCansData.push({
          id: node.getAttribute('id') || '',
          adresse: adresse ? adresse.textContent || '' : 'N/A',
          latitude: latitude ? latitude.textContent || '' : 'N/A',
          longitude: longitude ? longitude.textContent || '' : 'N/A',
          typeDechet: typeDechet ? typeDechet.textContent || '' : 'N/A',
          status: status ? status.textContent || '' : 'vide'
        });
      }
      
      setTrashCans(trashCansData);
    } catch (error) {
      console.error('Error fetching trash cans:', error);
    } finally {
      setLoadingTrashCans(false);
    }
  };

  const fetchVehicules = async () => {
    try {
      setLoadingVehicules(true);
      const response = await fetch(`/data/vehicule.xml?t=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) throw new Error('Error parsing XML');
      
      const vehiculeNodes = xmlDoc.getElementsByTagName('vehicule');
      const vehiculesData: Vehicule[] = [];
      
      for (let i = 0; i < vehiculeNodes.length; i++) {
        const node = vehiculeNodes[i];
        const matricule = node.getElementsByTagName('matricule')[0];
        const chauffeur = node.getElementsByTagName('chauffeur')[0];
        const disponibilite = node.getElementsByTagName('disponibilite')[0];
        
        vehiculesData.push({
          id: node.getAttribute('id') || '',
          matricule: matricule ? matricule.textContent || '' : 'N/A',
          chauffeur: chauffeur ? chauffeur.textContent || '' : 'N/A',
          chauffeurId: chauffeur ? chauffeur.getAttribute('id') || '' : 'N/A',
          disponibilite: disponibilite ? disponibilite.textContent || '' : 'disponible'
        });
      }
      
      setVehicules(vehiculesData);
    } catch (error) {
      console.error('Error fetching vehicules:', error);
    } finally {
      setLoadingVehicules(false);
    }
  };

  const fetchTournees = async () => {
    try {
      setLoadingTournees(true);
      const response = await fetch(`/data/tournee.xml?t=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) throw new Error('Error parsing XML');
      
      const tourneeNodes = xmlDoc.getElementsByTagName('tournee');
      const tourneesData: Tournee[] = [];
      
      for (let i = 0; i < tourneeNodes.length; i++) {
        const node = tourneeNodes[i];
        const zone = node.getElementsByTagName('zone')[0];
        const ouvriers = node.getElementsByTagName('ouvriers')[0];
        const vehicule = node.getElementsByTagName('vehicule')[0];
        const date = node.getElementsByTagName('date')[0];
        
        const ouvrierElements = ouvriers ? ouvriers.getElementsByTagName('ouvrier') : [];
        const ouvrierIds: string[] = [];
        for (let j = 0; j < ouvrierElements.length; j++) {
          const id = ouvrierElements[j].getAttribute('id');
          if (id) ouvrierIds.push(id);
        }
        
        tourneesData.push({
          id: node.getAttribute('id') || '',
          zone: zone ? zone.textContent || '' : 'N/A',
          ouvrierIds: ouvrierIds,
          vehiculeId: vehicule ? vehicule.getAttribute('id') || '' : 'N/A',
          date: date ? date.textContent || '' : 'N/A'
        });
      }
      
      setTournees(tourneesData);
    } catch (error) {
      console.error('Error fetching tournees:', error);
    } finally {
      setLoadingTournees(false);
    }
  };

  const fetchRapports = async () => {
    try {
      setLoadingRapports(true);
      const response = await fetch(`/data/rapports.xml?t=${Date.now()}`);
      if (!response.ok) {
        setRapports([]);
        return;
      }
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) throw new Error('Error parsing XML');
      
      const rapportNodes = xmlDoc.getElementsByTagName('rapport');
      const rapportsData: Rapport[] = [];
      
      for (let i = 0; i < rapportNodes.length; i++) {
        const node = rapportNodes[i];
        const date = node.getElementsByTagName('date')[0];
        const tournee = node.getElementsByTagName('tournee')[0];
        const employees = node.getElementsByTagName('employees')[0];
        const dechetsCollecte = node.getElementsByTagName('dechetsCollecte')[0];
        
        const chefTourne = employees ? employees.getElementsByTagName('chefTourne')[0] : null;
        const ouvriers = employees ? employees.getElementsByTagName('ouvriers')[0] : null;
        
        const ouvrierElements = ouvriers ? ouvriers.getElementsByTagName('ouvrier') : [];
        const ouvriersData: Ouvrier[] = [];
        for (let j = 0; j < ouvrierElements.length; j++) {
          const ouvrier = ouvrierElements[j];
          const nom = ouvrier.getElementsByTagName('nom')[0];
          const prenom = ouvrier.getElementsByTagName('prenom')[0];
          const status = ouvrier.getElementsByTagName('status')[0];
          
          ouvriersData.push({
            id: ouvrier.getAttribute('id') || '',
            nom: nom ? nom.textContent || '' : 'N/A',
            prenom: prenom ? prenom.textContent || '' : 'N/A',
            status: status ? status.textContent || '' : 'N/A'
          });
        }
        
        const trashCanElements = dechetsCollecte ? dechetsCollecte.getElementsByTagName('trashCan') : [];
        const dechetsData: DechetCollecte[] = [];
        for (let j = 0; j < trashCanElements.length; j++) {
          const trashCan = trashCanElements[j];
          dechetsData.push({
            id: trashCan.getAttribute('id') || '',
            quantite: trashCan.getAttribute('quantite') || '0'
          });
        }
        
        rapportsData.push({
          id: node.getAttribute('id') || '',
          date: date ? date.textContent || '' : 'N/A',
          tourneeId: tournee ? tournee.getAttribute('id') || '' : 'N/A',
          chefTourneId: chefTourne ? chefTourne.getAttribute('id') || '' : 'N/A',
          ouvriers: ouvriersData,
          dechetsCollecte: dechetsData
        });
      }
      
      setRapports(rapportsData);
    } catch (error) {
      console.error('Error fetching rapports:', error);
      setRapports([]);
    } finally {
      setLoadingRapports(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await fetch(`/data/notification.xml?t=${Date.now()}`);
      if (!response.ok) {
        setNotifications([]);
        return;
      }
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) throw new Error('Error parsing XML');
      
      const notificationNodes = xmlDoc.getElementsByTagName('notification');
      const notificationsData: Notification[] = [];
      
      for (let i = 0; i < notificationNodes.length; i++) {
        const node = notificationNodes[i];
        const chefTournee = node.getElementsByTagName('chefTournee')[0];
        const travail = node.getElementsByTagName('travail')[0];
        const contenu = node.getElementsByTagName('contenu')[0];
        
        notificationsData.push({
          id: node.getAttribute('id') || '',
          chefTourneeId: chefTournee ? chefTournee.getAttribute('id') || '' : 'N/A',
          travailId: travail ? travail.getAttribute('id') || '' : 'N/A',
          contenu: contenu ? contenu.textContent || '' : 'N/A'
        });
      }
      
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchReclamations();
    fetchTrashCans();
    fetchVehicules();
    fetchTournees();
    fetchRapports();
    fetchNotifications();
  }, []);

  const deleteReclamation = async (reclamationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réclamation ?')) return;

    try {
      setDeletingId(reclamationId);
      // New unified TS route expects id in query param
      const response = await fetch(`/api/reclamations?id=${reclamationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchReclamations();
      alert('Réclamation supprimée avec succès');
    } catch (error) {
      console.error('Error deleting reclamation:', error);
      alert(`Erreur lors de la suppression: ${(error as Error).message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const markAsResolved = async (reclamationId: string) => {
    if (!confirm('Marquer cette réclamation comme terminée ?')) return;

    try {
      setUpdatingId(reclamationId);
      // New unified TS route expects JSON body with id and status
      const response = await fetch(`/api/reclamations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(reclamationId), status: 'resolved' }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchReclamations();
      alert('Réclamation marquée comme terminée');
    } catch (error) {
      console.error('Error updating reclamation:', error);
      alert(`Erreur lors de la mise à jour: ${(error as Error).message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteTrashCan = async (trashCanId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce point de collecte ?')) return;

    try {
      setDeletingTrashCanId(trashCanId);
      const response = await fetch(`/api/trashcans?id=${trashCanId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchTrashCans();
      alert('Point de collecte supprimé avec succès');
    } catch (error) {
      console.error('Error deleting trash can:', error);
      alert(`Erreur lors de la suppression: ${(error as Error).message}`);
    } finally {
      setDeletingTrashCanId(null);
    }
  };

  const deleteVehicule = async (vehiculeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) return;

    try {
      setDeletingVehiculeId(vehiculeId);
      const response = await fetch(`/api/vehicules?id=${vehiculeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchVehicules();
      alert('Véhicule supprimé avec succès');
    } catch (error) {
      console.error('Error deleting vehicule:', error);
      alert(`Erreur lors de la suppression: ${(error as Error).message}`);
    } finally {
      setDeletingVehiculeId(null);
    }
  };

  const deleteTournee = async (tourneeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tournée ?')) return;

    try {
      setDeletingTourneeId(tourneeId);
      const response = await fetch(`/api/tournees?id=${tourneeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchTournees();
      alert('Tournée supprimée avec succès');
    } catch (error) {
      console.error('Error deleting tournee:', error);
      alert(`Erreur lors de la suppression: ${(error as Error).message}`);
    } finally {
      setDeletingTourneeId(null);
    }
  };

  const deleteRapport = async (rapportId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) return;

    try {
      setDeletingRapportId(rapportId);
      const response = await fetch(`/api/rapports?id=${rapportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchRapports();
      alert('Rapport supprimé avec succès');
    } catch (error) {
      console.error('Error deleting rapport:', error);
      alert(`Erreur lors de la suppression: ${(error as Error).message}`);
    } finally {
      setDeletingRapportId(null);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) return;

    try {
      setDeletingNotificationId(notificationId);
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchNotifications();
      alert('Notification supprimée avec succès');
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert(`Erreur lors de la suppression: ${(error as Error).message}`);
    } finally {
      setDeletingNotificationId(null);
    }
  };

  const addTrashCan = async (newData: TrashCanFormData) => {
    try {
      const response = await fetch(`/api/trashcans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchTrashCans();
      alert('Point de collecte ajouté avec succès');
      setIsAddingTrashCan(false);
    } catch (error) {
      console.error('Error adding trash can:', error);
      alert(`Erreur lors de l'ajout: ${(error as Error).message}`);
    }
  };

  const addVehicule = async (newData: VehiculeFormData) => {
    try {
      const response = await fetch(`/api/vehicules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchVehicules();
      alert('Véhicule ajouté avec succès');
      setIsAddingVehicule(false);
    } catch (error) {
      console.error('Error adding vehicule:', error);
      alert(`Erreur lors de l'ajout: ${(error as Error).message}`);
    }
  };

  const addTournee = async (newData: any) => {
    try {
      const response = await fetch(`/api/tournees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchTournees();
      alert('Tournée ajoutée avec succès');
      setIsAddingTournee(false);
    } catch (error) {
      console.error('Error adding tournee:', error);
      alert(`Erreur lors de l'ajout: ${(error as Error).message}`);
    }
  };

  const addNotification = async (newData: Omit<NotificationFormData, 'id'>) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchNotifications();
      alert('Notification envoyée avec succès');
    } catch (error) {
      console.error('Error adding notification:', error);
      alert(`Erreur lors de l'envoi: ${(error as Error).message}`);
    }
  };

  const updateTrashCan = async (updatedData: TrashCanFormData) => {
    try {
      const response = await fetch(`/api/trashcans`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchTrashCans();
      alert('Point de collecte modifié avec succès');
      closeModificationPage();
    } catch (error) {
      console.error('Error updating trash can:', error);
      alert(`Erreur lors de la modification: ${(error as Error).message}`);
    }
  };

  const updateVehicule = async (updatedData: VehiculeFormData) => {
    try {
      const response = await fetch(`/api/vehicules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchVehicules();
      alert('Véhicule modifié avec succès');
      closeModificationPage();
    } catch (error) {
      console.error('Error updating vehicule:', error);
      alert(`Erreur lors de la modification: ${(error as Error).message}`);
    }
  };

  const updateTournee = async (updatedData: any) => {
    try {
      const response = await fetch(`/api/tournees`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchTournees();
      alert('Tournée modifiée avec succès');
      closeModificationPage();
    } catch (error) {
      console.error('Error updating tournee:', error);
      alert(`Erreur lors de la modification: ${(error as Error).message}`);
    }
  };

  const updateNotification = async (updatedData: NotificationFormData) => {
    try {
      const response = await fetch(`/api/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchNotifications();
      alert('Notification modifiée avec succès');
      closeModificationPage();
    } catch (error) {
      console.error('Error updating notification:', error);
      alert(`Erreur lors de la modification: ${(error as Error).message}`);
    }
  };

  const openModificationPageTrashCan = (trashCan: TrashCan) => {
    setSelectedTrashCan(trashCan);
    setActiveSection('modifier-point-collecte');
  };

  const openModificationPageVehicule = (vehicule: Vehicule) => {
    setSelectedVehicule(vehicule);
    setActiveSection('modifier-vehicule');
  };

  const openModificationPageTournee = (tournee: Tournee) => {
    setSelectedTournee(tournee);
    setActiveSection('modifier-tournee');
  };

  const openModificationPageNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setActiveSection('modifier-notification');
  };

  const openAddPageTrashCan = () => {
    setIsAddingTrashCan(true);
    setActiveSection('ajouter-point-collecte');
  };

  const openAddPageVehicule = () => {
    setIsAddingVehicule(true);
    setActiveSection('ajouter-vehicule');
  };

  const openAddPageTournee = () => {
    setIsAddingTournee(true);
    setActiveSection('ajouter-tournee');
  };

  const closeModificationPage = () => {
    setSelectedTrashCan(null);
    setSelectedVehicule(null);
    setSelectedTournee(null);
    setSelectedNotification(null);
    setIsAddingTrashCan(false);
    setIsAddingVehicule(false);
    setIsAddingTournee(false);
    
    if (activeSection.includes('vehicule')) setActiveSection('gerer-vehicule');
    else if (activeSection.includes('point-collecte')) setActiveSection('gerer-points-collecte');
    else if (activeSection.includes('tournee')) setActiveSection('gerer-tournees');
    else if (activeSection.includes('notification')) setActiveSection('envoyer-notification');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'consulter-reclamations':
        return (
          <ConsulterReclamations 
            reclamations={reclamations} 
            loading={loading} 
            onDeleteReclamation={deleteReclamation}
            onMarkAsResolved={markAsResolved}
            deletingId={deletingId}
            updatingId={updatingId}
          />
        );
      case 'gerer-points-collecte':
        return (
          <GererPointsCollecte 
            trashCans={trashCans} 
            loading={loadingTrashCans}
            onDeleteTrashCan={deleteTrashCan}
            onModifyTrashCan={openModificationPageTrashCan}
            onAddTrashCan={openAddPageTrashCan}
            deletingTrashCanId={deletingTrashCanId}
          />
        );
      case 'modifier-point-collecte':
        return (
          <ModifierPointCollecte 
            trashCan={selectedTrashCan}
            onSave={updateTrashCan}
            onCancel={closeModificationPage}
            isEditing={true}
          />
        );
      case 'ajouter-point-collecte':
        return (
          <ModifierPointCollecte 
            onSave={addTrashCan}
            onCancel={closeModificationPage}
            isEditing={false}
          />
        );
      case 'gerer-vehicule':
        return (
          <GererVehicule 
            vehicules={vehicules} 
            loading={loadingVehicules}
            onDeleteVehicule={deleteVehicule}
            onModifyVehicule={openModificationPageVehicule}
            onAddVehicule={openAddPageVehicule}
            deletingVehiculeId={deletingVehiculeId}
          />
        );
      case 'gerer-employes':
        return <GestionEmployees />;
      case 'modifier-vehicule':
        return (
          <ModifierVehicule 
            vehicule={selectedVehicule}
            onSave={updateVehicule}
            onCancel={closeModificationPage}
            isEditing={true}
          />
        );
      case 'ajouter-vehicule':
        return (
          <ModifierVehicule 
            onSave={addVehicule}
            onCancel={closeModificationPage}
            isEditing={false}
          />
        );
      case 'gerer-tournees':
        return (
          <GererTournees 
            tournees={tournees} 
            loading={loadingTournees}
            onDeleteTournee={deleteTournee}
            onModifyTournee={openModificationPageTournee}
            onAddTournee={openAddPageTournee}
            deletingTourneeId={deletingTourneeId}
          />
        );
      case 'modifier-tournee':
        return (
          <ModifierTournee 
            tournee={selectedTournee}
            onSave={updateTournee}
            onCancel={closeModificationPage}
            isEditing={true}
          />
        );
      case 'ajouter-tournee':
        return (
          <ModifierTournee 
            onSave={addTournee}
            onCancel={closeModificationPage}
            isEditing={false}
          />
        );
      case 'consulter-rapports':
        return (
          <ConsulterRapports 
            rapports={rapports} 
            loading={loadingRapports}
            onDeleteRapport={deleteRapport}
            deletingRapportId={deletingRapportId}
          />
        );
      case 'envoyer-notification':
        return (
          <EnvoyerNotification 
            notifications={notifications}
            loading={loadingNotifications}
            onDeleteNotification={deleteNotification}
            onModifyNotification={openModificationPageNotification}
            onAddNotification={addNotification}
            deletingNotificationId={deletingNotificationId}
          />
        );
      case 'modifier-notification':
        return (
          <ModifierNotification 
            notification={selectedNotification}
            onSave={updateNotification}
            onCancel={closeModificationPage}
            isEditing={true}
          />
        );
      default:
        return <div>Sélectionnez une section</div>;
    }
  };

  return (
    <>
      {/* Header moved OUTSIDE the container div to span full width */}
      <Header />
      
      <div className="container">
        <div className="layout">
          <Sidebar 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            menuItems={menuItems}
          />
          
          <main className="main-content">
            <header className="content-header">
              <h1>
                {activeSection === 'modifier-point-collecte' 
                  ? 'Modifier le Point de Collecte' 
                  : activeSection === 'ajouter-point-collecte'
                  ? 'Ajouter un Point de Collecte'
                  : activeSection === 'modifier-vehicule'
                  ? 'Modifier le Véhicule'
                  : activeSection === 'ajouter-vehicule'
                  ? 'Ajouter un Véhicule'
                  : activeSection === 'modifier-tournee'
                  ? 'Modifier la Tournée'
                  : activeSection === 'ajouter-tournee'
                  ? 'Ajouter une Tournée'
                  : activeSection === 'modifier-notification'
                  ? 'Modifier la Notification'
                  : menuItems.find(item => item.id === activeSection)?.label
                }
              </h1>
            </header>
            <div className="content-area">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}