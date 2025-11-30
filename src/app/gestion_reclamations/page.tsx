"use client"
import { useState, useEffect } from 'react';
import Head from 'next/head';
import "./globals.css";

// Define TypeScript interfaces
interface Reclamation {
  id: string;
  citoyenId: string;
  citoyen: string;
  contenu: string;
  date: string;
  status: string;
  type: string;
}

interface TrashCan {
  id: string;
  adresse: string;
  latitude: string;
  longitude: string;
  typeDechet: string;
  status: string;
}

interface Vehicule {
  id: string;
  matricule: string;
  chauffeurId: string;
  disponibilite: string;
}

interface Tournee {
  id: string;
  trashCanIds: string[];
  ouvrierIds: string[];
  vehiculeId: string;
  date: string;
}

interface Ouvrier {
  id: string;
  nom: string;
  prenom: string;
  status: string;
}

interface DechetCollecte {
  id: string;
  quantite: string;
}

interface Rapport {
  id: string;
  date: string;
  tourneeId: string;
  chefTourneId: string;
  ouvriers: Ouvrier[];
  dechetsCollecte: DechetCollecte[];
}

interface Notification {
  id: string;
  chefTourneeId: string;
  travailId: string;
  contenu: string;
}

// Form data interfaces
interface TrashCanFormData {
  id: string;
  adresse: string;
  latitude: string;
  longitude: string;
  typeDechet: string;
  status: string;
}

interface VehiculeFormData {
  id: string;
  matricule: string;
  chauffeurId: string;
  disponibilite: string;
}

interface TourneeFormData {
  id: string;
  date: string;
  vehiculeId: string;
  trashCanIds: string;
  ouvrierIds: string;
}

interface NotificationFormData {
  id: string;
  chefTourneeId: string;
  travailId: string;
  contenu: string;
}

export default function GestionReclamation() {
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
    { id: 'consulter-reclamations', label: 'Consulter les reclamations' },
    { id: 'gerer-points-collecte', label: 'Gerer les points de collectes' },
    { id: 'gerer-vehicule', label: 'Gerer les vehicule' },
    { id: 'gerer-tournees', label: 'Gerer les tournées' },
    { id: 'gerer-employer', label: 'Gerer les employer' },
    { id: 'consulter-rapports', label: 'Consulter les rapports' },
    { id: 'envoyer-notification', label: 'Envoyer une notification' },
  ];

  // Fetch reclamations from XML
  const fetchReclamations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/data/reclamation.xml?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        throw new Error('Error parsing XML: ' + parseError[0].textContent);
      }
      
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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reclamations:', error);
      setLoading(false);
    }
  };

  // Fetch trash cans from XML
  const fetchTrashCans = async () => {
    try {
      setLoadingTrashCans(true);
      const response = await fetch(`/data/trashcan.xml?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        throw new Error('Error parsing XML: ' + parseError[0].textContent);
      }
      
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
      setLoadingTrashCans(false);
    } catch (error) {
      console.error('Error fetching trash cans:', error);
      setLoadingTrashCans(false);
    }
  };

  // Fetch vehicules from XML
  const fetchVehicules = async () => {
    try {
      setLoadingVehicules(true);
      const response = await fetch(`/data/vehicule.xml?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        throw new Error('Error parsing XML: ' + parseError[0].textContent);
      }
      
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
          chauffeurId: chauffeur ? chauffeur.getAttribute('id') || '' : 'N/A',
          disponibilite: disponibilite ? disponibilite.textContent || '' : 'disponible'
        });
      }
      
      setVehicules(vehiculesData);
      setLoadingVehicules(false);
    } catch (error) {
      console.error('Error fetching vehicules:', error);
      setLoadingVehicules(false);
    }
  };

  // Fetch tournees from XML
  const fetchTournees = async () => {
    try {
      setLoadingTournees(true);
      const response = await fetch(`/data/tournee.xml?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        throw new Error('Error parsing XML: ' + parseError[0].textContent);
      }
      
      const tourneeNodes = xmlDoc.getElementsByTagName('tournee');
      const tourneesData: Tournee[] = [];
      
      for (let i = 0; i < tourneeNodes.length; i++) {
        const node = tourneeNodes[i];
        const trashCans = node.getElementsByTagName('trashCans')[0];
        const ouvriers = node.getElementsByTagName('ouvriers')[0];
        const vehicule = node.getElementsByTagName('vehicule')[0];
        const date = node.getElementsByTagName('date')[0];
        
        // Extract trash can IDs
        const trashCanElements = trashCans ? trashCans.getElementsByTagName('trashCan') : [];
        const trashCanIds: string[] = [];
        for (let j = 0; j < trashCanElements.length; j++) {
          const id = trashCanElements[j].getAttribute('id');
          if (id) trashCanIds.push(id);
        }
        
        // Extract worker IDs
        const ouvrierElements = ouvriers ? ouvriers.getElementsByTagName('ouvrier') : [];
        const ouvrierIds: string[] = [];
        for (let j = 0; j < ouvrierElements.length; j++) {
          const id = ouvrierElements[j].getAttribute('id');
          if (id) ouvrierIds.push(id);
        }
        
        tourneesData.push({
          id: node.getAttribute('id') || '',
          trashCanIds: trashCanIds,
          ouvrierIds: ouvrierIds,
          vehiculeId: vehicule ? vehicule.getAttribute('id') || '' : 'N/A',
          date: date ? date.textContent || '' : 'N/A'
        });
      }
      
      setTournees(tourneesData);
      setLoadingTournees(false);
    } catch (error) {
      console.error('Error fetching tournees:', error);
      setLoadingTournees(false);
    }
  };

  // Fetch rapports from XML - FIXED PATH
  const fetchRapports = async () => {
    try {
      setLoadingRapports(true);
      const response = await fetch(`/data/rapports.xml?t=${Date.now()}`);
      if (!response.ok) {
        // If rapports.xml doesn't exist, create empty array and continue
        console.warn('Rapports XML file not found, using empty data');
        setRapports([]);
        setLoadingRapports(false);
        return;
      }
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        throw new Error('Error parsing XML: ' + parseError[0].textContent);
      }
      
      const rapportNodes = xmlDoc.getElementsByTagName('rapport');
      const rapportsData: Rapport[] = [];
      
      for (let i = 0; i < rapportNodes.length; i++) {
        const node = rapportNodes[i];
        const date = node.getElementsByTagName('date')[0];
        const tournee = node.getElementsByTagName('tournee')[0];
        const employees = node.getElementsByTagName('employees')[0];
        const dechetsCollecte = node.getElementsByTagName('dechetsCollecte')[0];
        
        // Extract employees data
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
        
        // Extract trash cans with quantities
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
      setLoadingRapports(false);
    } catch (error) {
      console.error('Error fetching rapports:', error);
      setRapports([]);
      setLoadingRapports(false);
    }
  };

  // Fetch notifications from XML
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await fetch(`/data/notification.xml?t=${Date.now()}`);
      if (!response.ok) {
        // If notification.xml doesn't exist, create empty array and continue
        console.warn('Notification XML file not found, using empty data');
        setNotifications([]);
        setLoadingNotifications(false);
        return;
      }
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        throw new Error('Error parsing XML: ' + parseError[0].textContent);
      }
      
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
      setLoadingNotifications(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
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

  // Function to delete reclamation
  const deleteReclamation = async (reclamationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réclamation ? Cette action est irréversible.')) {
      return;
    }

    try {
      setDeletingId(reclamationId);
      const response = await fetch(`/api/reclamations/${reclamationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchReclamations();
      alert('Réclamation supprimée avec succès');
      
    } catch (error) {
      console.error('Error deleting reclamation:', error);
      alert(`Erreur lors de la suppression: ${(error as Error).message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Function to mark reclamation as resolved
  const markAsResolved = async (reclamationId: string) => {
    if (!confirm('Marquer cette réclamation comme terminée ?')) {
      return;
    }

    try {
      setUpdatingId(reclamationId);
      const response = await fetch(`/api/reclamations/${reclamationId}/resolve`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchReclamations();
      alert('Réclamation marquée comme terminée');
      
    } catch (error) {
      console.error('Error updating reclamation:', error);
      alert(`Erreur lors de la mise à jour: ${(error as Error).message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Function to delete trash can
  const deleteTrashCan = async (trashCanId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce point de collecte ? Cette action est irréversible.')) {
      return;
    }

    try {
      setDeletingTrashCanId(trashCanId);
      const response = await fetch(`/api/trashcans/${trashCanId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchTrashCans();
      alert('Point de collecte supprimé avec succès');
      
    } catch (error) {
      console.error('Error deleting trash can:', error);
      alert(`Erreur lors de la suppression: ${(error as Error).message}`);
    } finally {
      setDeletingTrashCanId(null);
    }
  };

  // Function to delete vehicule
  const deleteVehicule = async (vehiculeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ? Cette action est irréversible.')) {
      return;
    }

    try {
      setDeletingVehiculeId(vehiculeId);
      const response = await fetch(`/api/vehicules/${vehiculeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchVehicules();
      alert('Véhicule supprimé avec succès');
      
    } catch (error) {
      console.error('Error deleting vehicule:', error);
      alert(`Erreur lors de la suppression: ${(error as Error).message}`);
    } finally {
      setDeletingVehiculeId(null);
    }
  };

  // Function to delete tournee
  const deleteTournee = async (tourneeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tournée ? Cette action est irréversible.')) {
      return;
    }

    try {
      setDeletingTourneeId(tourneeId);
      const response = await fetch(`/api/tournees/${tourneeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchTournees();
      alert('Tournée supprimée avec succès');
      
    } catch (error) {
      console.error('Error deleting tournee:', error);
      alert(`Erreur lors de la suppression: ${(error as Error).message}`);
    } finally {
      setDeletingTourneeId(null);
    }
  };

  // Function to delete rapport
  const deleteRapport = async (rapportId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action est irréversible.')) {
      return;
    }

    try {
      setDeletingRapportId(rapportId);
      const response = await fetch(`/api/rapports/${rapportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchRapports();
      alert('Rapport supprimé avec succès');
      
    } catch (error) {
      console.error('Error deleting rapport:', error);
      alert(`Erreur lors de la suppression: ${(error as Error).message}`);
    } finally {
      setDeletingRapportId(null);
    }
  };

  // Function to delete notification
  const deleteNotification = async (notificationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette notification ? Cette action est irréversible.')) {
      return;
    }

    try {
      setDeletingNotificationId(notificationId);
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchNotifications();
      alert('Notification supprimée avec succès');
      
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert(`Erreur lors de la suppression: ${(error as Error).message}`);
    } finally {
      setDeletingNotificationId(null);
    }
  };

  // Function to add new trash can
  const addTrashCan = async (newData: TrashCanFormData) => {
    try {
      const response = await fetch(`/api/trashcans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchTrashCans();
      alert('Point de collecte ajouté avec succès');
      setIsAddingTrashCan(false);
      
    } catch (error) {
      console.error('Error adding trash can:', error);
      alert(`Erreur lors de l'ajout: ${(error as Error).message}`);
    }
  };

  // Function to add new vehicule
  const addVehicule = async (newData: VehiculeFormData) => {
    try {
      const response = await fetch(`/api/vehicules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchVehicules();
      alert('Véhicule ajouté avec succès');
      setIsAddingVehicule(false);
      
    } catch (error) {
      console.error('Error adding vehicule:', error);
      alert(`Erreur lors de l'ajout: ${(error as Error).message}`);
    }
  };

  // Function to add new tournee
  const addTournee = async (newData: any) => {
    try {
      const response = await fetch(`/api/tournees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchTournees();
      alert('Tournée ajoutée avec succès');
      setIsAddingTournee(false);
      
    } catch (error) {
      console.error('Error adding tournee:', error);
      alert(`Erreur lors de l'ajout: ${(error as Error).message}`);
    }
  };

  // Function to add new notification - CORRECTED VERSION
  const addNotification = async (newData: Omit<NotificationFormData, 'id'>) => {
    try {
      console.log('🟢 Sending notification data:', newData);
      
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('❌ API Error response:', responseData);
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ Notification added successfully:', responseData);
      
      await fetchNotifications();
      alert('Notification envoyée avec succès');
      
      return responseData;
    } catch (error) {
      console.error('Error adding notification:', error);
      alert(`Erreur lors de l'envoi: ${(error as Error).message}`);
      throw error;
    }
  };

  // Function to open modification page for trash can
  const openModificationPageTrashCan = (trashCan: TrashCan) => {
    setSelectedTrashCan(trashCan);
    setActiveSection('modifier-point-collecte');
  };

  // Function to open modification page for vehicule
  const openModificationPageVehicule = (vehicule: Vehicule) => {
    setSelectedVehicule(vehicule);
    setActiveSection('modifier-vehicule');
  };

  // Function to open modification page for tournee
  const openModificationPageTournee = (tournee: Tournee) => {
    setSelectedTournee(tournee);
    setActiveSection('modifier-tournee');
  };

  // Function to open modification page for notification
  const openModificationPageNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setActiveSection('modifier-notification');
  };

  // Function to open add page for trash can
  const openAddPageTrashCan = () => {
    setIsAddingTrashCan(true);
    setActiveSection('ajouter-point-collecte');
  };

  // Function to open add page for vehicule
  const openAddPageVehicule = () => {
    setIsAddingVehicule(true);
    setActiveSection('ajouter-vehicule');
  };

  // Function to open add page for tournee
  const openAddPageTournee = () => {
    setIsAddingTournee(true);
    setActiveSection('ajouter-tournee');
  };

  // Function to close modification pages
  const closeModificationPage = () => {
    setSelectedTrashCan(null);
    setSelectedVehicule(null);
    setSelectedTournee(null);
    setSelectedNotification(null);
    setIsAddingTrashCan(false);
    setIsAddingVehicule(false);
    setIsAddingTournee(false);
    
    // Return to appropriate section
    if (activeSection.includes('vehicule')) {
      setActiveSection('gerer-vehicule');
    } else if (activeSection.includes('point-collecte')) {
      setActiveSection('gerer-points-collecte');
    } else if (activeSection.includes('tournee')) {
      setActiveSection('gerer-tournees');
    } else if (activeSection.includes('notification')) {
      setActiveSection('envoyer-notification');
    }
  };

  // Function to update trash can
  const updateTrashCan = async (updatedData: TrashCanFormData) => {
    try {
      const response = await fetch(`/api/trashcans/${updatedData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchTrashCans();
      alert('Point de collecte modifié avec succès');
      closeModificationPage();
      
    } catch (error) {
      console.error('Error updating trash can:', error);
      alert(`Erreur lors de la modification: ${(error as Error).message}`);
    }
  };

  // Function to update vehicule
  const updateVehicule = async (updatedData: VehiculeFormData) => {
    try {
      const response = await fetch(`/api/vehicules/${updatedData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchVehicules();
      alert('Véhicule modifié avec succès');
      closeModificationPage();
      
    } catch (error) {
      console.error('Error updating vehicule:', error);
      alert(`Erreur lors de la modification: ${(error as Error).message}`);
    }
  };

  // Function to update tournee
  const updateTournee = async (updatedData: any) => {
    try {
      const response = await fetch(`/api/tournees/${updatedData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchTournees();
      alert('Tournée modifiée avec succès');
      closeModificationPage();
      
    } catch (error) {
      console.error('Error updating tournee:', error);
      alert(`Erreur lors de la modification: ${(error as Error).message}`);
    }
  };

  // Function to update notification
  const updateNotification = async (updatedData: NotificationFormData) => {
    try {
      const response = await fetch(`/api/notifications/${updatedData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchNotifications();
      alert('Notification modifiée avec succès');
      closeModificationPage();
      
    } catch (error) {
      console.error('Error updating notification:', error);
      alert(`Erreur lors de la modification: ${(error as Error).message}`);
    }
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
      case 'gerer-employer':
        return <GererEmployer />;
      default:
        return <div>Sélectionnez une section</div>;
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Gestion des Réclamations</title>
      </Head>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Tableau de Bord</h2>
          </div>
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

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
  );
}

// ConsulterReclamations component
function ConsulterReclamations({ 
  reclamations, 
  loading, 
  onDeleteReclamation, 
  onMarkAsResolved, 
  deletingId, 
  updatingId 
}: { 
  reclamations: Reclamation[];
  loading: boolean;
  onDeleteReclamation: (id: string) => void;
  onMarkAsResolved: (id: string) => void;
  deletingId: string | null;
  updatingId: string | null;
}) {
  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { class: string; text: string } } = {
      'new': { class: 'status-new', text: 'Nouveau' },
      'in-progress': { class: 'status-in-progress', text: 'En Cours' },
      'resolved': { class: 'status-resolved', text: 'Résolu' }
    };
    
    const config = statusConfig[status] || { class: 'status-new', text: 'Nouveau' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="content-card">
        <div className="loading-state">
          <p>Chargement des réclamations...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="content-card">
        <div className="section-header">
          <h2>Liste des Réclamations</h2>
          <div className="stats-info">
            Total: {reclamations.length} réclamation{reclamations.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {reclamations.length === 0 ? (
          <div className="empty-state">
            <h3>Aucune réclamation trouvée</h3>
            <p>Il n'y a aucune réclamation à afficher pour le moment.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Citoyen</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Contenu</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reclamations.map((reclamation) => (
                  <tr key={reclamation.id}>
                    <td className="id-cell">#{reclamation.id}</td>
                    <td className="citizen-info">
                      <div className="citizen-name">{reclamation.citoyen}</div>
                      <div className="citizen-id">ID: {reclamation.citoyenId}</div>
                    </td>
                    <td>
                      <span className="type-badge">{reclamation.type}</span>
                    </td>
                    <td className="date-cell">{reclamation.date}</td>
                    <td className="content-cell">
                      <div className="content-text" title={reclamation.contenu}>
                        {reclamation.contenu.length > 100 
                          ? `${reclamation.contenu.substring(0, 100)}...` 
                          : reclamation.contenu
                        }
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(reclamation.status)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {reclamation.status !== 'resolved' && (
                          <button 
                            className="btn btn-resolve"
                            onClick={() => onMarkAsResolved(reclamation.id)}
                            disabled={updatingId === reclamation.id}
                          >
                            {updatingId === reclamation.id ? 'Mise à jour...' : 'Terminé'}
                          </button>
                        )}
                        <button 
                          className="btn btn-delete"
                          onClick={() => onDeleteReclamation(reclamation.id)}
                          disabled={deletingId === reclamation.id}
                        >
                          {deletingId === reclamation.id ? 'Suppression...' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Réclamations</h3>
          <div className="value">{reclamations.length}</div>
        </div>
        <div className="stat-card">
          <h3>Nouvelles</h3>
          <div className="value">
            {reclamations.filter(r => r.status === 'new').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>En Cours</h3>
          <div className="value">
            {reclamations.filter(r => r.status === 'in-progress').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Résolues</h3>
          <div className="value">
            {reclamations.filter(r => r.status === 'resolved').length}
          </div>
        </div>
      </div>
    </div>
  );
}

// GererPointsCollecte component with trash cans table
function GererPointsCollecte({ 
  trashCans, 
  loading, 
  onDeleteTrashCan, 
  onModifyTrashCan, 
  onAddTrashCan, 
  deletingTrashCanId 
}: { 
  trashCans: TrashCan[];
  loading: boolean;
  onDeleteTrashCan: (id: string) => void;
  onModifyTrashCan: (trashCan: TrashCan) => void;
  onAddTrashCan: () => void;
  deletingTrashCanId: string | null;
}) {
  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { class: string; text: string } } = {
      'vide': { class: 'status-resolved', text: 'Vide' },
      'moitie': { class: 'status-in-progress', text: 'Moitié' },
      'pleine': { class: 'status-new', text: 'Pleine' }
    };
    
    const config = statusConfig[status] || { class: 'status-new', text: 'Inconnu' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const getTypeBadge = (type: string) => {
    return <span className="type-badge">{type}</span>;
  };

  if (loading) {
    return (
      <div className="content-card">
        <div className="loading-state">
          <p>Chargement des points de collecte...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="content-card">
        <div className="section-header">
          <div>
            <h2>Liste des Points de Collecte</h2>
            <div className="stats-info">
              Total: {trashCans.length} point{trashCans.length !== 1 ? 's' : ''} de collecte
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={onAddTrashCan}
          >
            + Ajouter
          </button>
        </div>
        
        {trashCans.length === 0 ? (
          <div className="empty-state">
            <h3>Aucun point de collecte trouvé</h3>
            <p>Il n'y a aucun point de collecte à afficher pour le moment.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Adresse</th>
                  <th>Coordonnées</th>
                  <th>Type de Déchet</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trashCans.map((trashCan) => (
                  <tr key={trashCan.id}>
                    <td className="id-cell">#{trashCan.id}</td>
                    <td className="address-info">
                      <div className="address-text">{trashCan.adresse}</div>
                    </td>
                    <td className="coordinates-cell">
                      <div className="coordinates">
                        <div>Lat: {trashCan.latitude}</div>
                        <div>Long: {trashCan.longitude}</div>
                      </div>
                    </td>
                    <td>
                      {getTypeBadge(trashCan.typeDechet)}
                    </td>
                    <td>
                      {getStatusBadge(trashCan.status)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-edit"
                          onClick={() => onModifyTrashCan(trashCan)}
                        >
                          Modifier
                        </button>
                        <button 
                          className="btn btn-delete"
                          onClick={() => onDeleteTrashCan(trashCan.id)}
                          disabled={deletingTrashCanId === trashCan.id}
                        >
                          {deletingTrashCanId === trashCan.id ? 'Suppression...' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Summary for Trash Cans */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Points</h3>
          <div className="value">{trashCans.length}</div>
        </div>
        <div className="stat-card">
          <h3>Poubelles Vides</h3>
          <div className="value">
            {trashCans.filter(t => t.status === 'vide').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Poubelles à Moitié</h3>
          <div className="value">
            {trashCans.filter(t => t.status === 'moitie').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Poubelles Pleines</h3>
          <div className="value">
            {trashCans.filter(t => t.status === 'pleine').length}
          </div>
        </div>
      </div>
    </div>
  );
}

// GererVehicule component with vehicles table
function GererVehicule({ 
  vehicules, 
  loading, 
  onDeleteVehicule, 
  onModifyVehicule, 
  onAddVehicule, 
  deletingVehiculeId 
}: { 
  vehicules: Vehicule[];
  loading: boolean;
  onDeleteVehicule: (id: string) => void;
  onModifyVehicule: (vehicule: Vehicule) => void;
  onAddVehicule: () => void;
  deletingVehiculeId: string | null;
}) {
  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { class: string; text: string } } = {
      'disponible': { class: 'status-resolved', text: 'Disponible' },
      'En Service': { class: 'status-in-progress', text: 'En Service' }
    };
    
    const config = statusConfig[status] || { class: 'status-new', text: 'Inconnu' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="content-card">
        <div className="loading-state">
          <p>Chargement des véhicules...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="content-card">
        <div className="section-header">
          <div>
            <h2>Liste des Véhicules</h2>
            <div className="stats-info">
              Total: {vehicules.length} véhicule{vehicules.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={onAddVehicule}
          >
            + Ajouter
          </button>
        </div>
        
        {vehicules.length === 0 ? (
          <div className="empty-state">
            <h3>Aucun véhicule trouvé</h3>
            <p>Il n'y a aucun véhicule à afficher pour le moment.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Matricule</th>
                  <th>Chauffeur ID</th>
                  <th>Disponibilité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicules.map((vehicule) => (
                  <tr key={vehicule.id}>
                    <td className="id-cell">#{vehicule.id}</td>
                    <td className="matricule-cell">
                      <div className="matricule-text">{vehicule.matricule}</div>
                    </td>
                    <td className="chauffeur-cell">
                      <div className="chauffeur-id">ID: {vehicule.chauffeurId}</div>
                    </td>
                    <td>
                      {getStatusBadge(vehicule.disponibilite)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-edit"
                          onClick={() => onModifyVehicule(vehicule)}
                        >
                          Modifier
                        </button>
                        <button 
                          className="btn btn-delete"
                          onClick={() => onDeleteVehicule(vehicule.id)}
                          disabled={deletingVehiculeId === vehicule.id}
                        >
                          {deletingVehiculeId === vehicule.id ? 'Suppression...' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Summary for Vehicles */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Véhicules</h3>
          <div className="value">{vehicules.length}</div>
        </div>
        <div className="stat-card">
          <h3>Disponibles</h3>
          <div className="value">
            {vehicules.filter(v => v.disponibilite === 'disponible').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>En Service</h3>
          <div className="value">
            {vehicules.filter(v => v.disponibilite === 'En Service').length}
          </div>
        </div>
      </div>
    </div>
  );
}

// GererTournees component with tournees table
function GererTournees({ 
  tournees, 
  loading, 
  onDeleteTournee, 
  onModifyTournee, 
  onAddTournee, 
  deletingTourneeId 
}: { 
  tournees: Tournee[];
  loading: boolean;
  onDeleteTournee: (id: string) => void;
  onModifyTournee: (tournee: Tournee) => void;
  onAddTournee: () => void;
  deletingTourneeId: string | null;
}) {
  if (loading) {
    return (
      <div className="content-card">
        <div className="loading-state">
          <p>Chargement des tournées...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="content-card">
        <div className="section-header">
          <div>
            <h2>Liste des Tournées</h2>
            <div className="stats-info">
              Total: {tournees.length} tournée{tournees.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={onAddTournee}
          >
            + Ajouter
          </button>
        </div>
        
        {tournees.length === 0 ? (
          <div className="empty-state">
            <h3>Aucune tournée trouvée</h3>
            <p>Il n'y a aucune tournée à afficher pour le moment.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Véhicule ID</th>
                  <th>Points de Collecte</th>
                  <th>Ouvriers</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tournees.map((tournee) => (
                  <tr key={tournee.id}>
                    <td className="id-cell">#{tournee.id}</td>
                    <td className="date-cell">{tournee.date}</td>
                    <td>
                      <span className="type-badge">#{tournee.vehiculeId}</span>
                    </td>
                    <td>
                      <div className="items-list">
                        {tournee.trashCanIds.map(id => (
                          <span key={id} className="item-badge">#{id}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="items-list">
                        {tournee.ouvrierIds.map(id => (
                          <span key={id} className="item-badge">#{id}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-edit"
                          onClick={() => onModifyTournee(tournee)}
                        >
                          Modifier
                        </button>
                        <button 
                          className="btn btn-delete"
                          onClick={() => onDeleteTournee(tournee.id)}
                          disabled={deletingTourneeId === tournee.id}
                        >
                          {deletingTourneeId === tournee.id ? 'Suppression...' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Summary for Tournees */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tournées</h3>
          <div className="value">{tournees.length}</div>
        </div>
        <div className="stat-card">
          <h3>Tournées Aujourd'hui</h3>
          <div className="value">
            {tournees.filter(t => {
              const today = new Date().toISOString().split('T')[0];
              return t.date === today;
            }).length}
          </div>
        </div>
      </div>
    </div>
  );
}

// ConsulterRapports component with rapports table
function ConsulterRapports({ 
  rapports, 
  loading, 
  onDeleteRapport, 
  deletingRapportId 
}: { 
  rapports: Rapport[];
  loading: boolean;
  onDeleteRapport: (id: string) => void;
  deletingRapportId: string | null;
}) {
  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { class: string; text: string } } = {
      'present': { class: 'status-resolved', text: 'Présent' },
      'absent': { class: 'status-new', text: 'Absent' }
    };
    
    const config = statusConfig[status] || { class: 'status-new', text: 'Inconnu' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="content-card">
        <div className="loading-state">
          <p>Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="content-card">
        <div className="section-header">
          <div>
            <h2>Liste des Rapports</h2>
            <div className="stats-info">
              Total: {rapports.length} rapport{rapports.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        
        {rapports.length === 0 ? (
          <div className="empty-state">
            <h3>Aucun rapport trouvé</h3>
            <p>Il n'y a aucun rapport à afficher pour le moment.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Tournée ID</th>
                  <th>Chef de Tournée</th>
                  <th>Ouvriers</th>
                  <th>Déchets Collectés</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rapports.map((rapport) => (
                  <tr key={rapport.id}>
                    <td className="id-cell">#{rapport.id}</td>
                    <td className="date-cell">{rapport.date}</td>
                    <td>
                      <span className="type-badge">#{rapport.tourneeId}</span>
                    </td>
                    <td>
                      <div className="employee-info">
                        <div className="employee-id">ID: {rapport.chefTourneId}</div>
                      </div>
                    </td>
                    <td>
                      <div className="employees-list">
                        {rapport.ouvriers.map(ouvrier => (
                          <div key={ouvrier.id} className="employee-item">
                            <div className="employee-name">{ouvrier.prenom} {ouvrier.nom}</div>
                            <div className="employee-status">{getStatusBadge(ouvrier.status)}</div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="dechets-list">
                        {rapport.dechetsCollecte.map(dechet => (
                          <div key={dechet.id} className="dechet-item">
                            <span className="dechet-id">#{dechet.id}</span>
                            <span className="dechet-quantite">{dechet.quantite}kg</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-delete"
                          onClick={() => onDeleteRapport(rapport.id)}
                          disabled={deletingRapportId === rapport.id}
                        >
                          {deletingRapportId === rapport.id ? 'Suppression...' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Summary for Rapports */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Rapports</h3>
          <div className="value">{rapports.length}</div>
        </div>
        <div className="stat-card">
          <h3>Rapports Aujourd'hui</h3>
          <div className="value">
            {rapports.filter(r => {
              const today = new Date().toISOString().split('T')[0];
              return r.date === today;
            }).length}
          </div>
        </div>
      </div>
    </div>
  );
}

// EnvoyerNotification component with notifications table and form - CORRECTED VERSION
function EnvoyerNotification({ 
  notifications, 
  loading, 
  onDeleteNotification, 
  onModifyNotification, 
  onAddNotification, 
  deletingNotificationId 
}: { 
  notifications: Notification[];
  loading: boolean;
  onDeleteNotification: (id: string) => void;
  onModifyNotification: (notification: Notification) => void;
  onAddNotification: (data: Omit<NotificationFormData, 'id'>) => Promise<void>;
  deletingNotificationId: string | null;
}) {
  const [formData, setFormData] = useState<Omit<NotificationFormData, 'id'>>({
    chefTourneeId: '',
    travailId: '',
    contenu: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('📤 Submitting notification form:', formData);
      await onAddNotification(formData);
      
      // Clear the form after successful submission
      setFormData({
        chefTourneeId: '',
        travailId: '',
        contenu: ''
      });
      
      console.log('✅ Form submitted successfully');
    } catch (error) {
      console.error('❌ Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="content-card">
        <div className="loading-state">
          <p>Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="content-card">
        <h2>Envoyer une Nouvelle Notification</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ID du Chef de Tournée</label>
            <input
              type="text"
              name="chefTourneeId"
              value={formData.chefTourneeId}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="Entrez l'ID du chef de tournée"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>ID du Travail</label>
            <input
              type="text"
              name="travailId"
              value={formData.travailId}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="Entrez l'ID du travail"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>Contenu du Message</label>
            <textarea
              name="contenu"
              value={formData.contenu}
              onChange={handleChange}
              className="form-control"
              rows={5}
              required
              placeholder="Tapez votre message ici..."
              disabled={isSubmitting}
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer la notification'}
            </button>
          </div>
        </form>
      </div>

      <div className="content-card">
        <div className="section-header">
          <h2>Historique des Notifications</h2>
          <div className="stats-info">
            Total: {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {notifications.length === 0 ? (
          <div className="empty-state">
            <h3>Aucune notification trouvée</h3>
            <p>Il n'y a aucune notification à afficher pour le moment.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Chef de Tournée ID</th>
                  <th>Travail ID</th>
                  <th>Contenu</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr key={notification.id}>
                    <td className="id-cell">#{notification.id}</td>
                    <td>
                      <span className="type-badge">#{notification.chefTourneeId}</span>
                    </td>
                    <td>
                      <span className="type-badge">#{notification.travailId}</span>
                    </td>
                    <td className="content-cell">
                      <div className="content-text" title={notification.contenu}>
                        {notification.contenu.length > 100 
                          ? `${notification.contenu.substring(0, 100)}...` 
                          : notification.contenu
                        }
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-edit"
                          onClick={() => onModifyNotification(notification)}
                          disabled={isSubmitting}
                        >
                          Modifier
                        </button>
                        <button 
                          className="btn btn-delete"
                          onClick={() => onDeleteNotification(notification.id)}
                          disabled={deletingNotificationId === notification.id || isSubmitting}
                        >
                          {deletingNotificationId === notification.id ? 'Suppression...' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ModifierPointCollecte component for editing/adding trash cans
function ModifierPointCollecte({ 
  trashCan, 
  onSave, 
  onCancel, 
  isEditing 
}: { 
  trashCan: TrashCan | null;
  onSave: (data: TrashCanFormData) => void;
  onCancel: () => void;
  isEditing: boolean;
}) {
  const [formData, setFormData] = useState<TrashCanFormData>({
    id: trashCan?.id || '',
    adresse: trashCan?.adresse || '',
    latitude: trashCan?.latitude || '',
    longitude: trashCan?.longitude || '',
    typeDechet: trashCan?.typeDechet || 'plastique',
    status: trashCan?.status || 'vide'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="content-card">
      <h2>{isEditing ? `Modifier le Point de Collecte #${trashCan?.id}` : 'Ajouter un Point de Collecte'}</h2>
      
      <form onSubmit={handleSubmit}>
        {!isEditing && (
          <div className="form-group">
            <label>ID</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="Entrez l'ID du point de collecte"
            />
          </div>
        )}

        <div className="form-group">
          <label>Adresse</label>
          <input
            type="text"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            className="form-control"
            required
            placeholder="Entrez l'adresse"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Latitude</label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="ex: 34.740"
            />
          </div>
          <div className="form-group">
            <label>Longitude</label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="ex: 10.760"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Type de Déchet</label>
          <select
            name="typeDechet"
            value={formData.typeDechet}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="plastique">Plastique</option>
            <option value="verre">Verre</option>
            <option value="papier">Papier</option>
            <option value="metal">Métal</option>
            <option value="organique">Organique</option>
          </select>
        </div>

        <div className="form-group">
          <label>Statut</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="vide">Vide</option>
            <option value="moitie">À moitié</option>
            <option value="pleine">Pleine</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Enregistrer les modifications' : 'Ajouter le point de collecte'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ModifierVehicule component for editing/adding vehicles
function ModifierVehicule({ 
  vehicule, 
  onSave, 
  onCancel, 
  isEditing 
}: { 
  vehicule: Vehicule | null;
  onSave: (data: VehiculeFormData) => void;
  onCancel: () => void;
  isEditing: boolean;
}) {
  const [formData, setFormData] = useState<VehiculeFormData>({
    id: vehicule?.id || '',
    matricule: vehicule?.matricule || '',
    chauffeurId: vehicule?.chauffeurId || '',
    disponibilite: vehicule?.disponibilite || 'disponible'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate matricule format
    const matriculeRegex = /^[0-9]{3}TUN[0-9]{4}$/;
    if (!matriculeRegex.test(formData.matricule)) {
      alert('Le format du matricule est invalide. Format attendu: 123TUN1234');
      return;
    }
    
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="content-card">
      <h2>{isEditing ? `Modifier le Véhicule #${vehicule?.id}` : 'Ajouter un Véhicule'}</h2>
      
      <form onSubmit={handleSubmit}>
        {!isEditing && (
          <div className="form-group">
            <label>ID</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="Entrez l'ID du véhicule"
            />
          </div>
        )}

        <div className="form-group">
          <label>Matricule</label>
          <input
            type="text"
            name="matricule"
            value={formData.matricule}
            onChange={handleChange}
            className="form-control"
            placeholder="123TUN1234"
            pattern="[0-9]{3}TUN[0-9]{4}"
            required
          />
          <small className="form-help">Format: 123TUN1234 (3 chiffres + TUN + 4 chiffres)</small>
        </div>

        <div className="form-group">
          <label>ID du Chauffeur</label>
          <input
            type="text"
            name="chauffeurId"
            value={formData.chauffeurId}
            onChange={handleChange}
            className="form-control"
            required
            placeholder="Entrez l'ID du chauffeur"
          />
        </div>

        <div className="form-group">
          <label>Disponibilité</label>
          <select
            name="disponibilite"
            value={formData.disponibilite}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="disponible">Disponible</option>
            <option value="En Service">En Service</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Enregistrer les modifications' : 'Ajouter le véhicule'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ModifierTournee component for editing/adding tournees
function ModifierTournee({ 
  tournee, 
  onSave, 
  onCancel, 
  isEditing 
}: { 
  tournee: Tournee | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  isEditing: boolean;
}) {
  const [formData, setFormData] = useState<TourneeFormData>({
    id: tournee?.id || '',
    date: tournee?.date || '',
    vehiculeId: tournee?.vehiculeId || '',
    trashCanIds: tournee?.trashCanIds?.join(',') || '',
    ouvrierIds: tournee?.ouvrierIds?.join(',') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      trashCanIds: formData.trashCanIds.split(',').map(id => id.trim()).filter(id => id),
      ouvrierIds: formData.ouvrierIds.split(',').map(id => id.trim()).filter(id => id)
    };
    onSave(processedData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="content-card">
      <h2>{isEditing ? `Modifier la Tournée #${tournee?.id}` : 'Ajouter une Tournée'}</h2>
      
      <form onSubmit={handleSubmit}>
        {!isEditing && (
          <div className="form-group">
            <label>ID</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="Entrez l'ID de la tournée"
            />
          </div>
        )}

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label>ID du Véhicule</label>
          <input
            type="text"
            name="vehiculeId"
            value={formData.vehiculeId}
            onChange={handleChange}
            className="form-control"
            required
            placeholder="Entrez l'ID du véhicule"
          />
        </div>

        <div className="form-group">
          <label>IDs des Points de Collecte</label>
          <input
            type="text"
            name="trashCanIds"
            value={formData.trashCanIds}
            onChange={handleChange}
            className="form-control"
            placeholder="1, 2, 3"
          />
          <small className="form-help">Séparez les IDs par des virgules</small>
        </div>

        <div className="form-group">
          <label>IDs des Ouvriers</label>
          <input
            type="text"
            name="ouvrierIds"
            value={formData.ouvrierIds}
            onChange={handleChange}
            className="form-control"
            placeholder="2, 3"
          />
          <small className="form-help">Séparez les IDs par des virgules</small>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Enregistrer les modifications' : 'Ajouter la tournée'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ModifierNotification component for editing notifications
function ModifierNotification({ 
  notification, 
  onSave, 
  onCancel, 
  isEditing 
}: { 
  notification: Notification | null;
  onSave: (data: NotificationFormData) => void;
  onCancel: () => void;
  isEditing: boolean;
}) {
  const [formData, setFormData] = useState<NotificationFormData>({
    id: notification?.id || '',
    chefTourneeId: notification?.chefTourneeId || '',
    travailId: notification?.travailId || '',
    contenu: notification?.contenu || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="content-card">
      <h2>Modifier la Notification #{notification?.id}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ID du Chef de Tournée</label>
          <input
            type="text"
            name="chefTourneeId"
            value={formData.chefTourneeId}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label>ID du Travail</label>
          <input
            type="text"
            name="travailId"
            value={formData.travailId}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label>Contenu du Message</label>
          <textarea
            name="contenu"
            value={formData.contenu}
            onChange={handleChange}
            className="form-control"
            rows={5}
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}

// Other components remain the same
function GererEmployer() {
  return (
    <div className="content-card">
      <h2>Gestion des Employés</h2>
      <p>Interface pour gérer le personnel...</p>
    </div>
  );
}