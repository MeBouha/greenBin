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
      filter: drop-shadow(0 0 0px rgba(220, 38, 38, 0.8)) brightness(1);
    }
    50% {
      filter: drop-shadow(0 0 12px rgba(220, 38, 38, 0.9)) brightness(1.3);
    }
    100% {
      filter: drop-shadow(0 0 0px rgba(220, 38, 38, 0.8)) brightness(1);
    }
  }
  
  .danger-marker-pulse {
    animation: pulse-triangle 1.5s infinite;
    filter: drop-shadow(0 0 4px rgba(220, 38, 38, 0.6));
  }

  @keyframes notif-pulse {
    0% {
      box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
    }
    50% {
      box-shadow: 0 8px 24px rgba(249, 115, 22, 0.65);
    }
    100% {
      box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
    }
  }

  .notif-popup {
    animation: notif-pulse 1.6s ease-in-out infinite;
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
  const mapRef = useRef<Map | null>(null);
  const router = useRouter();

  const start: LatLngTuple = [34.740461, 10.760018]; // point de départ

  // Authentication & authorization check - MUST BE BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    setMounted(true);
    try {
      const raw = sessionStorage.getItem('user');
      if (raw) {
        const userData = JSON.parse(raw);
        setCurrentUser(userData);

        // Only allow specific roles to access this page
        // Adjust roles based on who should have access to the trash map
        const allowedRoles = ['chef de tournee']; // Add other roles as needed
        if (!allowedRoles.map(r => r.toLowerCase()).includes(userData.role?.toLowerCase())) {
          router.push('/gestion_utilisateurs'); // Redirect unauthorized users
          return;
        }
        
        const userId = userData?.id ? Number(userData.id) : null;
        setCurrentUserId(userId);
      } else {
        router.push('/gestion_utilisateurs'); // Redirect unauthenticated users
        return;
      }
    } catch (e) {
      console.error('Auth check failed:', e);
      router.push('/gestion_utilisateurs');
    }
  }, [router]);

  // Charger les données XML via l'API
  useEffect(() => {
    if (!currentUser) return; // Only load data if user is authenticated

    const load = async () => {
      try {
        let cans: any[] = [];

        if (currentUserId !== null) {
          // fetch tournees which already include trashCans for their zone
          const tRes = await fetch('/api/tournees?enriched=true');
          if (tRes.ok) {
            const tournees = await tRes.json();
            // filter tournees whose vehicule.chauffeurId matches the logged-in user
            const matched = (turne: any[] | undefined) => (turne || []).filter((t: any) => {
              return !!t?.vehicule?.chauffeurId && Number(t.vehicule.chauffeurId) === currentUserId;
            });
            const myTournees = matched(tournees);
            // collect their trashCans
            cans = myTournees.flatMap((t: any) => t.trashCans || []);
            
            // Fetch travaux for tournee zones
            const travauxZones = myTournees.map((t: any) => t.zone).filter(Boolean);
            if (travauxZones.length > 0) {
              const travauxRes = await fetch('/api/travaux');
              if (travauxRes.ok) {
                const allTravaux = await travauxRes.json();
                // Filter travaux matching tournee zones
                const filteredTravaux = allTravaux.filter((t: any) => 
                  travauxZones.some((zone: string) => zone.toLowerCase() === t.adresse.toLowerCase())
                );
                setTravaux(filteredTravaux);
              }
            }
          }
        }

        // fallback: if no user or no cans found, load all trashcans
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

  // persist selected trashcans across navigation so the rapport page can read them
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
      lineOptions: { styles: [{ color: '#007bff', weight: 7, opacity: 0.9 }] },
      createMarker: () => null,
      routeWhileDragging: false,
      show: true,
    }).addTo(mapRef.current);

    // Extract distance and save to sessionStorage
    routing.on('routesfound', (e: any) => {
      if (e.routes && e.routes.length > 0) {
        const distanceKm = (e.routes[0].summary?.totalDistance || 0) / 1000;
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('routeDistance', distanceKm.toFixed(2));
        }
      }
    });

    // Style du panneau de route
    const container = routing.getContainer?.();
    if (container) {
      container.style.top = '20px';
      container.style.right = '20px';
      container.style.left = 'auto';
      container.style.backgroundColor = 'rgba(255, 255, 255, 0.97)';
      container.style.padding = '16px';
      container.style.borderRadius = '10px';
      container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      container.style.fontSize = '16px';
      container.style.fontWeight = 'bold';
      container.style.lineHeight = '1.6';
      container.style.maxWidth = '280px';
      container.style.color = '#111';
      container.style.border = '3px solid #007bff';
      container.style.textAlign = 'left';
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
    // Optimistic update: mark as 'vide' locally; remember previous status to revert on error
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
      // success: server updated file
    } catch (err) {
      console.error('Failed to persist trashcan empty action', err);
      // revert optimistic update on failure
      if (prevStatus !== null) {
        setTrashCans((prev) => prev.map((c) => (c.id === id ? { ...c, status: prevStatus! } : c)));
      }
      // optionally notify user
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

    return leaflet.icon({
      iconUrl,
      // Reduced from [35, 35] and [45, 45] to smaller sizes
      iconSize: selected ? [35, 35] : [25, 25],
      // Adjusted anchor points for smaller icons
      iconAnchor: selected ? [17, 35] : [12, 25],
      popupAnchor: [0, -25],
    });
  };

  const getCurrentLocationIcon = (leaflet: any) =>
    leaflet.icon({
      iconUrl: '/icons/location-red.png',
      iconSize: [30, 30], // Made this smaller too for consistency
      iconAnchor: [15, 30],
      popupAnchor: [0, -25],
    });

  const getDangerIcon = (leaflet: any) => {
    const icon = leaflet.icon({
      iconUrl: '/icons/danger.png',
      iconSize: [25, 25], // Made danger icon smaller too
      iconAnchor: [12, 25],
      popupAnchor: [0, -25],
      className: 'danger-marker-pulse',
    });
    return icon;
  };

  // Early return before mount (hydration safety)
  if (!mounted) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  // Show nothing or minimal UI while redirecting
  if (!currentUser) {
    return null;
  }

  if (!leaflet) return <div>Loading map...</div>;

  return (
    <div style={{ position: 'relative' }}>
      {notifications.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxWidth: 280
          }}
        >
          {notifications.map((n) => (
            <div
              key={n.id}
              className="notif-popup"
              style={{
                background: '#ffffff',
                border: '1px solid #f97316',
                borderRadius: 10,
                padding: '10px 12px',
                boxShadow: '0 6px 18px rgba(249, 115, 22, 0.45)',
                fontSize: '0.9rem',
                color: '#1f2937'
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Notification</div>
              <div style={{ fontSize: '0.92rem' }}>
                {n.contenu && n.contenu.length > 160 ? `${n.contenu.slice(0, 157)}...` : (n.contenu || 'Aucun contenu')}
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 1000 }}>
        <button
          type="button"
          onClick={() => router.push('/gestion_tournees/rapport')}
          style={{
            backgroundColor: '#2563eb',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 8,
            boxShadow: '0 6px 18px rgba(37,99,235,0.12)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Créer rapport de la journée
        </button>
      </div>

      <MapContainer
        center={start}
        zoom={13}
        style={{ height: '80vh', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution="&copy; GreenBin"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={start} icon={getCurrentLocationIcon(leaflet)}>
          <Popup>
            <b>Current Location</b>
            <p>Start of route</p>
          </Popup>
        </Marker>

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
                  // If the marker is not already selected, add it to selectedIds.
                  // If it is already selected, keep it selected and just open/show the popup.
                  if (!selectedIds.includes(can.id)) {
                    setSelectedIds((prev) => (prev.includes(can.id) ? prev : [...prev, can.id]));
                  }
                  setActiveId(can.id);
                  try {
                    e?.target && e.target.openPopup && e.target.openPopup();
                  } catch {}
                },
              }}
            >
              <Popup>
                <h3>Adresse: {can.adresse}</h3>
                <p>Status: {can.status.toUpperCase()}</p>
                <p>Coordinates: {can.lat.toFixed(3)}, {can.lng.toFixed(3)}</p>
                <p>{selectedIds.includes(can.id) ? 'Selected' : 'Click to select'}</p>
                {selectedIds.includes(can.id) && activeId === can.id && (
                  <div style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleEmpty(can.id)}
                      style={{
                        backgroundColor: '#dc2626',
                        color: '#fff',
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Vider
                    </button>
                  </div>
                )}
              </Popup>
            </Marker>
          );
        })}

        {travaux.map((t) => {
          const dangerIcon = getDangerIcon(leaflet);
          if (!dangerIcon) return null;
          return (
            <Marker
              key={`travaux-${t.id}`}
              position={[t.latitude, t.longitude]}
              icon={dangerIcon}
            >
              <Popup>
                <h3 style={{ color: '#dc2626', fontWeight: 700 }}>⚠️ Travaux</h3>
                <p><strong>Adresse:</strong> {t.adresse}</p>
                <p><strong>Date:</strong> {t.date}</p>
                <p><strong>État:</strong> {t.etat}</p>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}