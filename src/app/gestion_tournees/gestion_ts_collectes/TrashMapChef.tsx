'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngTuple, Map } from 'leaflet';
import { useRouter } from 'next/navigation';

import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Ajouter les styles pour l'animation pulse/radar
const pulseStyles = `
  @keyframes pulse-triangle {
    0% {
      filter: drop-shadow(0 0 0px rgba(34, 197, 94, 0.8)) brightness(1);
      transform: scale(1);
    }
    50% {
      filter: drop-shadow(0 0 12px rgba(34, 197, 94, 0.9)) brightness(1.3);
      transform: scale(1.05);
    }
    100% {
      filter: drop-shadow(0 0 0px rgba(34, 197, 94, 0.8)) brightness(1);
      transform: scale(1);
    }
  }
  
  .danger-marker-pulse {
    animation: pulse-triangle 1.5s infinite;
    filter: drop-shadow(0 0 4px rgba(34, 197, 94, 0.6));
  }

  @keyframes notif-pulse {
    0% {
      box-shadow: 0 4px 14px rgba(132, 204, 22, 0.35);
      transform: translateY(0);
    }
    50% {
      box-shadow: 0 8px 24px rgba(132, 204, 22, 0.65);
      transform: translateY(-2px);
    }
    100% {
      box-shadow: 0 4px 14px rgba(132, 204, 22, 0.35);
      transform: translateY(0);
    }
  }

  .notif-popup {
    animation: notif-pulse 1.6s ease-in-out infinite;
    transition: all 0.3s ease;
  }

  .notif-popup:hover {
    animation-play-state: paused;
    transform: translateY(-2px);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .marker-popup {
    animation: fadeIn 0.3s ease-out;
  }

  .map-container {
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
  }

  @keyframes button-pulse {
    0% {
      box-shadow: 0 6px 18px rgba(34, 197, 94, 0.3);
    }
    50% {
      box-shadow: 0 8px 28px rgba(34, 197, 94, 0.5);
    }
    100% {
      box-shadow: 0 6px 18px rgba(34, 197, 94, 0.3);
    }
  }

  .action-button {
    animation: button-pulse 2s infinite;
    transition: all 0.3s ease;
  }

  .action-button:hover {
    transform: translateY(-2px);
    animation-play-state: paused;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  .floating {
    animation: float 3s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  .shimmer-effect {
    background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
  }

  @keyframes eco-pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  .eco-pulse {
    animation: eco-pulse 2s ease-in-out infinite;
  }
`;

// Injecter les styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseStyles;
  document.head.appendChild(style);
}

type TrashStatus = 'pleine' | 'moitie' | 'vide';

interface TrashCan {
  id: number;
  adresse: string;
  lat: number;
  lng: number;
  status: TrashStatus;
}

interface Travaux {
  id: number;
  adresse: string;
  latitude: number;
  longitude: number;
  date: string;
  etat: string;
}

interface Notification {
  id: number;
  chefTourneeId: number;
  travailId: number;
  contenu: string;
}

export default function TrashMapChef() {
  const [trashCans, setTrashCans] = useState<TrashCan[]>([]);
  const [travaux, setTravaux] = useState<Travaux[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [leaflet, setLeaflet] = useState<any>(null);
  const [routeControl, setRouteControl] = useState<any>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<Map | null>(null);
  const router = useRouter();

  const start: LatLngTuple = [34.740461, 10.760018]; // point de départ
  const defaultZoom = 16; // Increased zoom level for closer view

  // Authentication & authorization check
  useEffect(() => {
    setMounted(true);
    try {
      const raw = sessionStorage.getItem('user');
      if (raw) {
        const userData = JSON.parse(raw);
        setCurrentUser(userData);

        const allowedRoles = ['chef de tournee'];
        if (!allowedRoles.map(r => r.toLowerCase()).includes(userData.role?.toLowerCase())) {
          router.push('/gestion_utilisateurs');
          return;
        }
        
        const userId = userData?.id ? Number(userData.id) : null;
        setCurrentUserId(userId);
      } else {
        router.push('/gestion_utilisateurs');
        return;
      }
    } catch (e) {
      console.error('Auth check failed:', e);
      router.push('/gestion_utilisateurs');
    }
  }, [router]);

  // Charger les données XML via l'API
  useEffect(() => {
    if (!currentUser) return;

    const load = async () => {
      setLoading(true);
      try {
        let cans: any[] = [];

        if (currentUserId !== null) {
          const tRes = await fetch('/api/tournees?enriched=true');
          if (tRes.ok) {
            const tournees = await tRes.json();
            const matched = (turne: any[] | undefined) => (turne || []).filter((t: any) => {
              return !!t?.vehicule?.chauffeurId && Number(t.vehicule.chauffeurId) === currentUserId;
            });
            const myTournees = matched(tournees);
            cans = myTournees.flatMap((t: any) => t.trashCans || []);
            
            const travauxZones = myTournees.map((t: any) => t.zone).filter(Boolean);
            
            // Charger tous les travaux
            const travauxRes = await fetch('/api/travaux');
            if (travauxRes.ok) {
              const allTravaux = await travauxRes.json();
              
              // Si le chef a des tournées, filtrer les travaux par zone
              // Sinon, afficher tous les travaux
              if (travauxZones.length > 0) {
                const filteredTravaux = allTravaux.filter((t: any) => {
                  const travauxAdresse = (t.adresse || '').toLowerCase().trim();
                  return travauxZones.some((zone: string) => {
                    const zoneNorm = zone.toLowerCase().trim();
                    // Match exact ou si l'un contient l'autre
                    return zoneNorm === travauxAdresse || 
                           travauxAdresse.includes(zoneNorm) || 
                           zoneNorm.includes(travauxAdresse);
                  });
                });
                setTravaux(filteredTravaux);
              } else {
                setTravaux(allTravaux);
              }
            }
          }
        }

        if (!cans || cans.length === 0) {
          const res = await fetch('/api/trashcans');
          if (res.ok) {
            const data = await res.json();
            cans = data || [];
          }
        }

        setTrashCans(
          (cans || []).map((c: any) => {
            const raw = String(c.status || '').toLowerCase();
            let status: TrashStatus = 'pleine';
            if (raw.includes('vide') || raw === 'empty') status = 'vide';
            else if (raw.includes('mo') || raw.includes('half') || raw.includes('moitié') || raw.includes('moitie')) status = 'moitie';

            return {
              id: Number(c.id) || 0,
              adresse: c.adresse || c.name || '',
              lat: Number(c.lat) || Number(c.latitude) || 0,
              lng: Number(c.lng) || Number(c.longitude) || Number(c.lng) || 0,
              status,
            } as TrashCan;
          })
        );
      } catch (err) {
        console.error('Failed to load trashcans or tournees', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser, currentUserId]);

  // Charger les notifications du chef connecté
  useEffect(() => {
    if (!currentUser || currentUserId === null) return;
    
    const loadNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) return;
        const data = await res.json();
        const mine = (data || []).filter((n: any) => Number(n.chefTourneeId) === currentUserId);
        setNotifications(mine);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };
    loadNotifications();
  }, [currentUser, currentUserId]);

  // Charger Leaflet côté client
  useEffect(() => {
    if (typeof window === 'undefined') return;

    (async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet-routing-machine');

      if (!L.Routing) {
        L.Routing = (window as any).L.Routing;
      }

      setLeaflet(L);
    })();
  }, []);

  // persist selected trashcans across navigation
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('selectedTrashcans', JSON.stringify(selectedIds));
      }
    } catch {}
  }, [selectedIds]);

  // Mettre à jour la route
  useEffect(() => {
    if (!leaflet || !mapRef.current || !currentUser) return;

    if (routeControl) {
      try {
        mapRef.current.removeControl(routeControl);
      } catch {}
    }

    if (selectedIds.length === 0) return;

    const waypoints = [leaflet.latLng(start[0], start[1])];
    selectedIds.forEach((id) => {
      const can = trashCans.find((c) => c.id === id);
      if (can) waypoints.push(leaflet.latLng(can.lat, can.lng));
    });

    const routing = leaflet.Routing.control({
      waypoints,
      router: leaflet.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
      }),
      lineOptions: { 
        styles: [{ 
          color: '#22c55e', 
          weight: 5, 
          opacity: 0.85,
          dashArray: '8, 8'
        }] 
      },
      createMarker: () => null,
      routeWhileDragging: false,
      show: true,
    }).addTo(mapRef.current);

    routing.on('routesfound', (e: any) => {
      if (e.routes && e.routes.length > 0) {
        const distanceKm = (e.routes[0].summary?.totalDistance || 0) / 1000;
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('routeDistance', distanceKm.toFixed(2));
        }
      }
    });

    // Enhanced route panel styling with green theme
    const container = routing.getContainer?.();
    if (container) {
      container.style.top = '20px';
      container.style.right = '20px';
      container.style.left = 'auto';
      container.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)';
      container.style.padding = '18px';
      container.style.borderRadius = '14px';
      container.style.boxShadow = '0 15px 35px rgba(34, 197, 94, 0.15)';
      container.style.fontSize = '14px';
      container.style.fontWeight = '600';
      container.style.lineHeight = '1.6';
      container.style.maxWidth = '300px';
      container.style.color = '#14532d';
      container.style.border = '2px solid #22c55e';
      container.style.textAlign = 'left';
      container.style.backdropFilter = 'blur(8px)';
      container.style.zIndex = '1000';
    }

    setRouteControl(routing);

    return () => {
      if (mapRef.current && routing) mapRef.current.removeControl(routing);
    };
  }, [selectedIds, leaflet, trashCans, currentUser]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleEmpty = async (id: number) => {
    let prevStatus: TrashStatus | null = null;
    setTrashCans((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          prevStatus = c.status;
          return { ...c, status: 'vide' };
        }
        return c;
      })
    );
    setActiveId(id);

    try {
      const res = await fetch('/api/trashcans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'vide' }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Status ${res.status}`);
      }
    } catch (err) {
      console.error('Failed to persist trashcan empty action', err);
      if (prevStatus !== null) {
        setTrashCans((prev) => prev.map((c) => (c.id === id ? { ...c, status: prevStatus! } : c)));
      }
    }
  };

  const getIcon = (status: TrashStatus, selected = false) => {
    if (!leaflet) return null;
    const iconUrl = {
      pleine: '/icons/trash-red.png',
      moitie: '/icons/trash-orange.png',
      vide: '/icons/trash-green.png',
    }[status];

    if (!iconUrl) return null;

    const icon = leaflet.icon({
      iconUrl,
      // Made trash cans smaller: [35, 35] -> [25, 25], [45, 45] -> [32, 32]
      iconSize: selected ? [32, 32] : [25, 25],
      iconAnchor: selected ? [16, 32] : [12, 25],
      popupAnchor: [0, -28],
      className: selected ? 'selected-marker' : ''
    });
    
    return icon;
  };

  const getCurrentLocationIcon = (leaflet: any) =>
    leaflet.icon({
      iconUrl: '/icons/location-red.png',
      iconSize: [40, 40], // Kept larger for visibility
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
      className: 'eco-pulse'
    });

  const getDangerIcon = (leaflet: any) => {
    const icon = leaflet.icon({
      iconUrl: '/icons/danger.png',
      iconSize: [28, 28], // Fixed size without floating animation
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
      className: 'danger-marker-pulse', // Removed floating class
    });
    return icon;
  };

  // Early return before mount
  if (!mounted) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #d1fae5 0%, #ffffffff 50%, #ffffffff 100%)'
      }}>
        <div style={{ 
          textAlign: 'center',
          padding: '60px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          boxShadow: '0 25px 70px rgba(34, 197, 94, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="shimmer-effect" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            pointerEvents: 'none'
          }} />
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 30px',
            background: 'radial-gradient(circle at 30% 30%, #4ade80, #22c55e)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)'
          }}>
            <span style={{ fontSize: '40px', color: 'white' }}>♻️</span>
          </div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            color: '#14532d',
            marginBottom: '16px'
          }}>
            GreenBin
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#4d7c0f',
            marginBottom: '30px'
          }}>
            Chargement de l'éco-carte...
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, #4ade80, #22c55e)`,
                  animation: `eco-pulse 1.5s ease-in-out ${i * 0.2}s infinite`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  if (!leaflet || loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
      }}>
        <div style={{ 
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          boxShadow: '0 15px 50px rgba(34, 197, 94, 0.15)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #4ade80, #22c55e)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '30px' }}>🗺️</span>
          </div>
          <p style={{ 
            fontSize: '18px', 
            color: '#15803d',
            fontWeight: '600'
          }}>
            Préparation de la carte éco-responsable
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'relative',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f0f0ff 100%)'
    }}>
      {/* Eco Header */}
      <div style={{
        padding: '20px',
        paddingTop: '100px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)',
        borderBottom: '2px solid #dcfce7',
        boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #4ade80, #22c55e)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)'
            }}>
              <span style={{ fontSize: '28px' }}>♻️</span>
            </div>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '800',
                margin: 0,
                background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px'
              }}>
                Carte Éco GreenBin
              </h1>
              <p style={{
                color: '#4d7c0f',
                margin: '4px 0 0 0',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {currentUser?.name ? `Bonjour, ${currentUser.name}` : 'Gestionnaire de Tournée'}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {selectedIds.length > 0 && (
              <div style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15) 0%, rgba(34, 197, 94, 0.15) 100%)',
                color: '#15803d',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '14px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(8px)'
              }}>
                <span style={{ marginRight: '6px' }}>✓</span>
                {selectedIds.length} poubelle{selectedIds.length > 1 ? 's' : ''} sélectionnée{selectedIds.length > 1 ? 's' : ''}
              </div>
            )}
            
            <button
              type="button"
              onClick={() => router.push('/gestion_tournees/rapport')}
              className="action-button"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                letterSpacing: '0.5px'
              }}
            >
              <span style={{ fontSize: '16px' }}>📊</span>
              Rapport Éco
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        padding: '12px 20px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderBottom: '1px solid #dcfce7'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(254, 226, 226, 0.3) 0%, rgba(254, 226, 226, 0.1) 100%)',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #fee2e2'
          }}>
            <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600' }}>PLEINES</div>
            <div style={{ fontSize: '22px', color: '#dc2626', fontWeight: '700' }}>
              {trashCans.filter(c => c.status === 'pleine').length}
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(254, 215, 170, 0.3) 0%, rgba(254, 215, 170, 0.1) 100%)',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #fed7aa'
          }}>
            <div style={{ fontSize: '11px', color: '#f97316', fontWeight: '600' }}>À MOITIÉ</div>
            <div style={{ fontSize: '22px', color: '#f97316', fontWeight: '700' }}>
              {trashCans.filter(c => c.status === 'moitie').length}
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(187, 247, 208, 0.3) 0%, rgba(187, 247, 208, 0.1) 100%)',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>VIDES</div>
            <div style={{ fontSize: '22px', color: '#16a34a', fontWeight: '700' }}>
              {trashCans.filter(c => c.status === 'vide').length}
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(221, 214, 254, 0.3) 0%, rgba(221, 214, 254, 0.1) 100%)',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #ddd6fe'
          }}>
            <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600' }}>SÉLECTIONNÉES</div>
            <div style={{ fontSize: '22px', color: '#7c3aed', fontWeight: '700' }}>
              {selectedIds.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '20px',
        minHeight: 'calc(100vh - 160px)'
      }}>
        {/* Sidebar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Notifications Sidebar */}
          {notifications.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 244, 0.95) 100%)',
              borderRadius: '16px',
              padding: '18px',
              border: '2px solid #bbf7d0',

              backdropFilter: 'blur(8px)',
              flex: 1
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                marginBottom: '16px' 
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  background: 'linear-gradient(135deg, #84cc16, #22c55e)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '16px', color: 'white' }}>🔔</span>
                </div>
                <h3 style={{ 
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#15803d'
                }}>
                  Notifications ({notifications.length})
                </h3>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxHeight: '300px',
                overflowY: 'auto',
                paddingRight: '6px'
              }}>
                {notifications.map((n, index) => (
                  <div
                    key={n.id}
                    className="notif-popup"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 247, 237, 0.9) 0%, rgba(254, 243, 199, 0.9) 100%)',
                      border: '2px solid #fbbf24',
                      borderRadius: '12px',
                      padding: '14px',
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div style={{ 
                      fontSize: '13px',
                      lineHeight: '1.5',
                      color: '#92400e'
                    }}>
                      {n.contenu}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legend Sidebar */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 244, 0.95) 100%)',
            borderRadius: '16px',
            padding: '18px',
            border: '2px solid #a7f3d0',
            boxShadow: '0 10px 30px rgba(34, 197, 94, 0.15)',
            backdropFilter: 'blur(8px)'
          }}>
            <h3 style={{ 
              margin: '0 0 14px 0',
              fontSize: '16px',
              fontWeight: '700',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>🗺️</span> Légende
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { color: '#dc2626', label: 'Poubelle pleine', icon: '🔴' },
                { color: '#f97316', label: 'Poubelle à moitié', icon: '🟠' },
                { color: '#16a34a', label: 'Poubelle vide', icon: '🟢' },
                { color: '#22c55e', label: 'Travaux', icon: '⚠️' },
                { color: '#15803d', label: 'Votre position', icon: '📍' }
              ].map((item, index) => (
                <div 
                  key={index} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '8px',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: item.color,
                    boxShadow: `0 0 8px ${item.color}40`
                  }} />
                  <span style={{ fontSize: '14px' }}>{item.icon}</span>
                  <span style={{ 
                    fontSize: '13px', 
                    color: '#374151',
                    fontWeight: '500'
                  }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="map-container" style={{ position: 'relative', height: 'calc(100vh - 200px)' }}>
          <MapContainer
            center={start}
            zoom={defaultZoom} // Increased zoom level
            style={{ 
              height: '100%', 
              width: '100%',
              borderRadius: '16px'
            }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | ♻️ GreenBin'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Current Location Marker - Centered and zoomed in */}
            <Marker position={start} icon={getCurrentLocationIcon(leaflet)}>
              <Popup className="marker-popup">
                <div style={{ padding: '12px', minWidth: '260px' }}>
                  <h3 style={{ 
                    margin: '0 0 10px 0', 
                    color: '#15803d',
                    fontSize: '16px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🌿 Votre Position
                  </h3>
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    color: '#4b5563',
                    fontSize: '13px'
                  }}>
                    Point de départ de votre tournée éco-responsable
                  </p>
                  <div style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, #ffffffff, #b5b5b5ff)',
                    borderRadius: '20px',
                    fontSize: '11px',
                    color: '#15803d',
                    fontWeight: '600',
                    marginTop: '6px'
                  }}>
                    ♻️ Mode Éco Activé
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Trash Can Markers - Now smaller */}
            {trashCans.map((can) => {
              const icon = getIcon(can.status, selectedIds.includes(can.id));
              if (!icon) return null;
              return (
                <Marker
                  key={can.id}
                  position={[can.lat, can.lng]}
                  icon={icon}
                  eventHandlers={{
                    click: (e: any) => {
                      if (!selectedIds.includes(can.id)) {
                        setSelectedIds((prev) => (prev.includes(can.id) ? prev : [...prev, can.id]));
                      }
                      setActiveId(can.id);
                      try {
                        e?.target?.openPopup?.();
                      } catch {}
                    },
                  }}
                >
                  <Popup className="marker-popup">
                    <div style={{ 
                      padding: '14px',
                      minWidth: '280px'
                    }}>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '14px'
                      }}>
                        <h3 style={{ 
                          margin: 0, 
                          color: '#1f2937',
                          fontSize: '16px',
                          fontWeight: '700'
                        }}>
                          🗑️ Eco-Bin #{can.id}
                        </h3>
                        <span style={{
                          fontSize: '11px',
                          color: '#6b7280',
                          background: 'rgba(255, 255, 255, 0.9)',
                          padding: '4px 8px',
                          borderRadius: '10px',
                          border: '1px solid #e5e7eb'
                        }}>
                          ID: {can.id}
                        </span>
                      </div>
                      
                      <div style={{ 
                        marginBottom: '14px',
                        padding: '10px',
                        background: can.status === 'pleine' 
                          ? 'linear-gradient(135deg, #fee2e2, #fecaca)' 
                          : can.status === 'moitie' 
                          ? 'linear-gradient(135deg, #fed7aa, #fdba74)' 
                          : 'linear-gradient(135deg, #bbf7d0, #f9f9f9ff)',
                        borderRadius: '10px',
                        borderLeft: `4px solid ${
                          can.status === 'pleine' ? '#dc2626' : 
                          can.status === 'moitie' ? '#f97316' : '#16a34a'
                        }`
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <span style={{
                              fontSize: '13px',
                              fontWeight: '700',
                              color: can.status === 'pleine' ? '#dc2626' : 
                                     can.status === 'moitie' ? '#f97316' : '#16a34a'
                            }}>
                              {can.status === 'pleine' ? '🔴 PLEINE' : 
                               can.status === 'moitie' ? '🟠 À MOITIÉ' : '🟢 VIDE'}
                            </span>
                            <div style={{ 
                              fontSize: '12px', 
                              color: can.status === 'pleine' ? '#b91c1c' : 
                                     can.status === 'moitie' ? '#c2410c' : '#15803d',
                              marginTop: '4px'
                            }}>
                              {can.status === 'pleine' ? 'Nécessite une collecte urgente' :
                               can.status === 'moitie' ? 'Peut attendre quelques jours' :
                               'Collecte effectuée récemment'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6b7280',
                          marginBottom: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          📍 Adresse
                        </div>
                        <div style={{ 
                          fontSize: '14px',
                          color: '#374151',
                          fontWeight: '500',
                          padding: '8px',
                          background: 'rgba(243, 244, 246, 0.5)',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          {can.adresse}
                        </div>
                      </div>

                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        marginTop: '16px'
                      }}>
                        <button
                          type="button"
                          onClick={() => toggleSelect(can.id)}
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '13px',
                            transition: 'all 0.3s ease',
                            background: selectedIds.includes(can.id) 
                              ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' 
                              : '#f3f4f6',
                            color: selectedIds.includes(can.id)
                              ? '#15803d'
                              : '#6b7280',
                            border: selectedIds.includes(can.id)
                              ? '2px solid #86efac'
                              : '2px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          {selectedIds.includes(can.id) ? '✓ Sélectionnée' : 'Sélectionner'}
                        </button>
                        
                        {selectedIds.includes(can.id) && activeId === can.id && (
                          <button
                            type="button"
                            onClick={() => handleEmpty(can.id)}
                            style={{
                              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                              color: '#fff',
                              padding: '10px',
                              borderRadius: '8px',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: '700',
                              fontSize: '13px',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            🗑️ Vider
                          </button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Travaux Markers - Fixed position (no floating animation) */}
            {travaux.map((t) => {
              const dangerIcon = getDangerIcon(leaflet);
              if (!dangerIcon) return null;
              return (
                <Marker
                  key={`travaux-${t.id}`}
                  position={[t.latitude, t.longitude]}
                  icon={dangerIcon}
                >
                  <Popup className="marker-popup">
                    <div style={{ padding: '14px', minWidth: '280px' }}>
                      <h3 style={{ 
                        margin: '0 0 14px 0', 
                        color: '#15803d',
                        fontSize: '16px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          ⚠️
                        </div>
                        Travaux
                      </h3>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6b7280',
                          marginBottom: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          📍 Lieu
                        </div>
                        <div style={{ 
                          fontSize: '14px',
                          color: '#374151',
                          fontWeight: '500',
                          padding: '8px',
                          background: 'rgba(254, 243, 199, 0.3)',
                          borderRadius: '8px',
                          border: '1px solid #fde68a'
                        }}>
                          {t.adresse}
                        </div>
                      </div>

                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginTop: '14px'
                      }}>
                        <div>
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#92400e',
                            marginBottom: '4px',
                            fontWeight: '600'
                          }}>
                            📅 Date
                          </div>
                          <div style={{ 
                            fontSize: '13px',
                            color: '#374151',
                            fontWeight: '500',
                            background: '#fef3c7',
                            padding: '6px',
                            borderRadius: '6px'
                          }}>
                            {t.date}
                          </div>
                        </div>
                        <div>
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#92400e',
                            marginBottom: '4px',
                            fontWeight: '600'
                          }}>
                            📊 État
                          </div>
                          <div style={{ 
                            fontSize: '13px',
                            color: '#374151',
                            fontWeight: '500',
                            background: '#fef3c7',
                            padding: '6px',
                            borderRadius: '6px'
                          }}>
                            {t.etat}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Eco Footer */}
      <div style={{
        padding: '16px',
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.1) 100%)',
        borderTop: '2px solid #bbf7d0'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#15803d',
            fontSize: '13px',
            fontWeight: '600',
            margin: 0
          }}>
            ♻️ GreenBin - Ensemble pour une ville plus propre et plus verte
          </p>
          <p style={{
            color: '#4d7c0f',
            fontSize: '11px',
            margin: '6px 0 0 0'
          }}>
            Réduction estimée de CO₂ grâce à votre tournée optimisée : {(selectedIds.length * 0.5).toFixed(1)} kg
          </p>
        </div>
      </div>
    </div>
  );
}