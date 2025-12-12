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

interface ChauffeurOption {
  id: string;
  nom: string;
  prenom: string;
}

interface UserOption {
  id: string;
  name: string;
}

export interface Tournee {
  id: string;
  zone: string;
  ouvrierIds: string[];
  vehiculeId: string;
  date: string;
  vehiculeMatricule?: string;
  ouvrierNames?: string[];
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  login: string;
  etat: string;
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
  vehiculeMatricule?: string;
  tourneeZone?: string;
}

export interface Notification {
  id: string;
  chefTourneeId: string;
  travailId: string;
  contenu: string;
  chefNom?: string;
  travailZone?: string;
  travailDate?: string;
}

// Form data interfaces
export interface VehiculeFormData {
  id?: string;
  matricule: string;
  chauffeurId: string;
  disponibilite: string;
}

export interface TourneeFormData {
  id: string;
  date: string;
  vehiculeId: string;
  trashCanIds: string;
  ouvrierIds: string[];
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
  const [users, setUsers] = useState<User[]>([]);
  const [ouvriers, setOuvriers] = useState<User[]>([]);
  const [tournees, setTournees] = useState<Tournee[]>([]);
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrashCans, setLoadingTrashCans] = useState(true);
  const [loadingVehicules, setLoadingVehicules] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTournees, setLoadingTournees] = useState(true);
  const [loadingRapports, setLoadingRapports] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [chauffeurOptions, setChauffeurOptions] = useState<ChauffeurOption[]>([]);
  const [ouvrierOptions, setOuvrierOptions] = useState<UserOption[]>([]);
  const [allOuvrierOptions, setAllOuvrierOptions] = useState<UserOption[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingTrashCanId, setDeletingTrashCanId] = useState<string | null>(null);
  const [deletingVehiculeId, setDeletingVehiculeId] = useState<string | null>(null);
  const [deletingTourneeId, setDeletingTourneeId] = useState<string | null>(null);
  const [deletingRapportId, setDeletingRapportId] = useState<string | null>(null);
  const [deletingNotificationId, setDeletingNotificationId] = useState<string | null>(null);
  const [selectedVehicule, setSelectedVehicule] = useState<Vehicule | null>(null);
  const [selectedTournee, setSelectedTournee] = useState<Tournee | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
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

  // Fetch users from users.xml
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch(`/data/users.xml?t=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) throw new Error('Error parsing XML');
      
      const userNodes = xmlDoc.getElementsByTagName('user');
      const usersData: User[] = [];
      
      for (let i = 0; i < userNodes.length; i++) {
        const node = userNodes[i];
        const compte = node.getElementsByTagName('compte')[0];
        const login = compte ? compte.getElementsByTagName('login')[0] : null;
        const etat = compte ? compte.getElementsByTagName('etat')[0] : null;
        const nom = node.getElementsByTagName('nom')[0];
        const prenom = node.getElementsByTagName('prenom')[0];
        const role = node.getElementsByTagName('role')[0];
        
        const user: User = {
          id: node.getAttribute('id') || '',
          login: login ? login.textContent || '' : '',
          etat: etat ? etat.textContent || '' : 'actif',
          nom: nom ? nom.textContent || '' : '',
          prenom: prenom ? prenom.textContent || '' : '',
          role: role ? role.textContent || '' : ''
        };
        
        usersData.push(user);
        
        // If user is an ouvrier, add to ouvriers list
        if (user.role.toLowerCase().includes('ouvrier')) {
          setOuvriers(prev => [...prev, user]);
        }
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Existing fetch functions (reclamations, trashCans, vehicules, tournees, rapports, notifications)
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

  const fetchVehicules = async (optionsOverride?: ChauffeurOption[]) => {
    try {
      setLoadingVehicules(true);
      const options = optionsOverride ?? chauffeurOptions;
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
        const chauffeurId = chauffeur ? chauffeur.getAttribute('id') || '' : '';
        const chauffeurObj = options.find((c) => c.id === chauffeurId);
        const chauffeurName = chauffeurObj ? `${chauffeurObj.prenom} ${chauffeurObj.nom}`.trim() : (chauffeur ? chauffeur.textContent || '' : 'N/A');
        
        vehiculesData.push({
          id: node.getAttribute('id') || '',
          matricule: matricule ? matricule.textContent || '' : 'N/A',
          chauffeur: chauffeurName,
          chauffeurId: chauffeurId || 'N/A',
          disponibilite: disponibilite ? disponibilite.textContent || '' : 'disponible'
        });
      }
      
      setVehicules(vehiculesData);
      return vehiculesData;
    } catch (error) {
      console.error('Error fetching vehicules:', error);
      return [] as Vehicule[];
    } finally {
      setLoadingVehicules(false);
    }
  };

  const fetchTournees = async (vehiculesList?: Vehicule[], ouvriersList?: UserOption[]) => {
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

        const vehiculeId = vehicule ? vehicule.getAttribute('id') || '' : 'N/A';
        const vehiculeMatricule = (vehiculesList ?? vehicules).find(v => v.id === vehiculeId)?.matricule || 'N/A';
        const ouvrierLookup = ouvriersList ?? ouvrierOptions;
        const ouvrierNames = ouvrierIds.map(id => {
          const found = ouvrierLookup.find(o => o.id === id);
          return found?.name || `Ouvrier ${id}`;
        });
        
        tourneesData.push({
          id: node.getAttribute('id') || '',
          zone: zone ? zone.textContent || '' : 'N/A',
          ouvrierIds: ouvrierIds,
          vehiculeId,
          date: date ? date.textContent || '' : 'N/A',
          vehiculeMatricule,
          ouvrierNames
        });
      }
      
      setTournees(tourneesData);
    } catch (error) {
      console.error('Error fetching tournees:', error);
    } finally {
      setLoadingTournees(false);
    }
  };

  const fetchChauffeurs = async () => {
    try {
      const response = await fetch(`/data/users.xml?t=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) throw new Error('Error parsing XML');

      const userNodes = xmlDoc.getElementsByTagName('user');
      const chauffeurList: ChauffeurOption[] = [];
      const ouvrierList: UserOption[] = [];
      const allOuvrierList: UserOption[] = [];
      for (let i = 0; i < userNodes.length; i++) {
        const node = userNodes[i];
        const role = node.getElementsByTagName('role')[0];
        const nom = node.getElementsByTagName('nom')[0];
        const prenom = node.getElementsByTagName('prenom')[0];
        const dispo = node.getElementsByTagName('disponibilite')[0];
        const id = node.getAttribute('id') || '';
        const roleText = role ? (role.textContent || '').toLowerCase() : '';
        const dispoText = dispo ? (dispo.textContent || '').toLowerCase() : '';
        if (roleText === 'chef trajet' || roleText === 'chef de tournee') {
          const nomText = nom?.textContent || '';
          const prenomText = prenom?.textContent || '';
          chauffeurList.push({ id, nom: nomText, prenom: prenomText });
        }
        if (roleText === 'ouvrier') {
          const fullName = `${prenom?.textContent || ''} ${nom?.textContent || ''}`.trim();
          allOuvrierList.push({ id, name: fullName || `Ouvrier ${id}` });
          if (dispoText === 'disponible') {
            ouvrierList.push({ id, name: fullName || `Ouvrier ${id}` });
          }
        }
      }
      setChauffeurOptions(chauffeurList);
      setOuvrierOptions(ouvrierList);
      setAllOuvrierOptions(allOuvrierList);
      return { chauffeurs: chauffeurList, ouvriers: ouvrierList, allOuvriers: allOuvrierList };
    } catch (error) {
      console.error('Error fetching chauffeurs:', error);
      setOuvrierOptions([]);
      setAllOuvrierOptions([]);
      return { chauffeurs: [] as ChauffeurOption[], ouvriers: [] as UserOption[], allOuvriers: [] as UserOption[] };
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

      // Build tournee map
      const tourneeMap = new Map<string, { zone: string; vehiculeId: string }>();
      if (tourneeRes.ok) {
        const tourXml = await tourneeRes.text();
        const tourDoc = parser.parseFromString(tourXml, "text/xml");
        const tourNodes = tourDoc.getElementsByTagName('tournee');
        for (let i = 0; i < tourNodes.length; i++) {
          const tNode = tourNodes[i];
          const id = tNode.getAttribute('id') || '';
          const zone = tNode.getElementsByTagName('zone')[0]?.textContent || 'N/A';
          const vehiculeId = tNode.getElementsByTagName('vehicule')[0]?.getAttribute('id') || '';
          if (id) tourneeMap.set(id, { zone, vehiculeId });
        }
      }

      // Build vehicule map
      const vehiculeMap = new Map<string, string>();
      if (vehiculeRes.ok) {
        const vehXml = await vehiculeRes.text();
        const vehDoc = parser.parseFromString(vehXml, "text/xml");
        const vehNodes = vehDoc.getElementsByTagName('vehicule');
        for (let i = 0; i < vehNodes.length; i++) {
          const vNode = vehNodes[i];
          const id = vNode.getAttribute('id') || '';
          const matricule = vNode.getElementsByTagName('matricule')[0]?.textContent || '';
          if (id) vehiculeMap.set(id, matricule);
        }
      }

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

        const tourneeId = tournee ? tournee.getAttribute('id') || '' : 'N/A';
        const tourInfo = tourneeMap.get(tourneeId);
        const vehMat = tourInfo ? vehiculeMap.get(tourInfo.vehiculeId) || 'N/A' : 'N/A';
        const zone = tourInfo?.zone || 'N/A';

        rapportsData.push({
          id: node.getAttribute('id') || '',
          date: date ? date.textContent || '' : 'N/A',
          tourneeId,
          chefTourneId: chefTourne ? chefTourne.getAttribute('id') || '' : 'N/A',
          ouvriers: ouvriersData,
          dechetsCollecte: dechetsData,
          vehiculeMatricule: vehMat,
          tourneeZone: zone
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
      const [notifRes, usersRes, travauxRes] = await Promise.all([
        fetch(`/data/notification.xml?t=${Date.now()}`),
        fetch(`/data/users.xml?t=${Date.now()}`),
        fetch(`/data/travaux.xml?t=${Date.now()}`)
      ]);

      if (!notifRes.ok) {
        setNotifications([]);
        return;
      }
      
      const xmlText = await notifRes.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) throw new Error('Error parsing XML');

      // Build users map
      const usersMap = new Map<string, string>();
      if (usersRes.ok) {
        const usersXml = await usersRes.text();
        const usersDoc = parser.parseFromString(usersXml, "text/xml");
        const userNodes = usersDoc.getElementsByTagName('user');
        for (let i = 0; i < userNodes.length; i++) {
          const uNode = userNodes[i];
          const id = uNode.getAttribute('id') || '';
          const nom = uNode.getElementsByTagName('nom')[0]?.textContent || '';
          const prenom = uNode.getElementsByTagName('prenom')[0]?.textContent || '';
          if (id) usersMap.set(id, `${prenom} ${nom}`.trim());
        }
      }

      // Build travaux map
      const travauxMap = new Map<string, { zone: string; date: string }>();
      if (travauxRes.ok) {
        const travauxXml = await travauxRes.text();
        const travauxDoc = parser.parseFromString(travauxXml, "text/xml");
        const travailNodes = travauxDoc.getElementsByTagName('travail');
        for (let i = 0; i < travailNodes.length; i++) {
          const tNode = travailNodes[i];
          const id = tNode.getAttribute('id') || '';
          const lieu = tNode.getElementsByTagName('lieu')[0];
          const adresse = lieu?.getElementsByTagName('adresse')[0]?.textContent || '';
          const date = tNode.getElementsByTagName('date')[0]?.textContent || '';
          if (id) travauxMap.set(id, { zone: adresse, date });
        }
      }
      
      const notificationNodes = xmlDoc.getElementsByTagName('notification');
      const notificationsData: Notification[] = [];
      
      for (let i = 0; i < notificationNodes.length; i++) {
        const node = notificationNodes[i];
        const chefTournee = node.getElementsByTagName('chefTournee')[0];
        const travail = node.getElementsByTagName('travail')[0];
        const contenu = node.getElementsByTagName('contenu')[0];
        
        const chefId = chefTournee ? chefTournee.getAttribute('id') || '' : 'N/A';
        const travailId = travail ? travail.getAttribute('id') || '' : 'N/A';
        const travailInfo = travauxMap.get(travailId);

        notificationsData.push({
          id: node.getAttribute('id') || '',
          chefTourneeId: chefId,
          travailId,
          contenu: contenu ? contenu.textContent || '' : 'N/A',
          chefNom: usersMap.get(chefId) || 'N/A',
          travailZone: travailInfo?.zone || 'N/A',
          travailDate: travailInfo?.date || 'N/A'
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
    fetchChauffeurs().then((options) => fetchVehicules(options));
    fetchTournees();
    fetchRapports();
    fetchNotifications();
  }, []);

  // Delete functions remain the same
  const deleteReclamation = async (reclamationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réclamation ?')) return;

    try {
      setDeletingId(reclamationId);
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

  const openAddPageVehicule = () => {
    setIsAddingVehicule(true);
    setActiveSection('ajouter-vehicule');
  };

  const openAddPageTournee = () => {
    setIsAddingTournee(true);
    setActiveSection('ajouter-tournee');
  };

  const closeModificationPage = () => {
    setSelectedVehicule(null);
    setSelectedTournee(null);
    setSelectedNotification(null);
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
            onModifyTrashCan={() => {}}
            onAddTrashCan={() => {}}
            deletingTrashCanId={deletingTrashCanId}
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
            chauffeurOptions={chauffeurOptions}
          />
        );
      case 'ajouter-vehicule':
        return (
          <ModifierVehicule 
            onSave={addVehicule}
            onCancel={closeModificationPage}
            isEditing={false}
            chauffeurOptions={chauffeurOptions}
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
            chauffeurOptions={chauffeurOptions}
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