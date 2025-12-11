"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Workaround: relax Marker typing when passing custom Leaflet Icon
const AnyMarker: any = Marker;

// Types API et type interne pour l'affichage
type ApiStatus = 'vide' | 'moitie' | 'pleine';
type ApiTypeDechet = 'plastique' | 'verre' | 'papier' | 'autre';
type ApiTrashcan = {
  id: number;
  adresse: string;
  latitude: number;
  longitude: number;
  typeDechet: ApiTypeDechet;
  status: ApiStatus;
};

export type Trashcan = {
  id: number;
  name: string; // correspond à adresse
  lat: number;
  lng: number;
  status: ApiStatus;
  type?: ApiTypeDechet;
};

type TempPos = { lat: number; lng: number; id?: number };

// Legacy props signature to remain compatible with parent usage; values are ignored
interface LegacyProps {
  trashCans?: any[];
  loading?: boolean;
  onDeleteTrashCan?: (id: string) => void;
  onModifyTrashCan?: (trashCan: any) => void;
  onAddTrashCan?: () => void;
  deletingTrashCanId?: string | null;
}

// Icône selon le status
const getTrashIcon = (status: ApiStatus) => {
  const iconUrl =
    status === 'pleine' ? '/icons/trash-red.png' :
    status === 'moitie' ? '/icons/trash-orange.png' :
    '/icons/trash-green.png';

  return new L.Icon({
    iconUrl,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Marker pour choisir l'emplacement d'une nouvelle poubelle
function AddMarker({ onSelectLocation }: { onSelectLocation: (latlng: L.LatLngLiteral) => void }) {
  useMapEvents({
    click: (e: L.LeafletMouseEvent) => {
      onSelectLocation(e.latlng);
    },
  });
  return null;
}

export default function GererPointsCollecte(_: LegacyProps) {
  const [trashcans, setTrashcans] = useState<Trashcan[]>([]);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Trashcan | null>(null);
  const [tempPosition, setTempPosition] = useState<TempPos | null>(null);
  const [newTrashType, setNewTrashType] = useState<'plastique' | 'verre' | 'papier'>('plastique');
  const [newTrashAddress, setNewTrashAddress] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Charger les poubelles depuis l'API
  useEffect(() => {
    fetch('/api/trashcans')
      .then(res => res.json())
      .then((data: ApiTrashcan[]) => {
        const mapped: Trashcan[] = data.map((d) => ({
          id: d.id,
          name: d.adresse || 'Point de collecte',
          lat: Number(d.latitude),
          lng: Number(d.longitude),
          status: d.status,
          type: d.typeDechet,
        }));
        setTrashcans(mapped);
      });
  }, []);

  // Supprimer une poubelle
  const handleDelete = async (id: number) => {
    await fetch(`/api/trashcans?id=${id}`, { method: 'DELETE' });
    setTrashcans(trashcans.filter(t => t.id !== id));
    setSelected(null);
  };

  // Déplacement
  const handleMove = (id: number, newLatLng: { lat: number; lng: number }) =>
    setTempPosition({ lat: newLatLng.lat, lng: newLatLng.lng, id });

  const confirmMove = async () => {
    if (!tempPosition?.id) return;
    const trash = trashcans.find(t => t.id === tempPosition.id);
    if (!trash) return;
    const adresse = editAddress.trim() || trash.name;
    const body = { id: trash.id, latitude: tempPosition.lat!, longitude: tempPosition.lng!, adresse };
    await fetch('/api/trashcans', {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    const updated: Trashcan = { ...trash, name: adresse, lat: tempPosition.lat!, lng: tempPosition.lng! };
    setTrashcans(trashcans.map(t => (t.id === trash.id ? updated : t)));
    setTempPosition(null);
    setSelected(null);
    setEditAddress('');
  };

  const cancelMove = () => { setTempPosition(null); setEditAddress(''); };

  // Ajouter une poubelle
  const handleStartAdd = () => setAdding(true);
  const handleAddTrashcan = (latlng: L.LatLngLiteral) => setTempPosition({ lat: latlng.lat, lng: latlng.lng });

  const confirmAdd = async () => {
    if (!tempPosition) return;
    const adresse = newTrashAddress.trim();
    if (!adresse) return;
    const body = {
      adresse,
      latitude: tempPosition.lat!,
      longitude: tempPosition.lng!,
      status: 'vide' as ApiStatus,
      typeDechet: newTrashType as ApiTypeDechet,
    };
    const res = await fetch('/api/trashcans', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    const created: ApiTrashcan = await res.json();
    const mapped: Trashcan = {
      id: created.id,
      name: created.adresse || 'Point de collecte',
      lat: Number(created.latitude),
      lng: Number(created.longitude),
      status: created.status,
      type: created.typeDechet,
    };
    setTrashcans([...trashcans, mapped]);
    setTempPosition(null);
    setAdding(false);
    setNewTrashAddress('');
  };

  const cancelAdd = () => { setTempPosition(null); setAdding(false); setNewTrashAddress(''); };

  return (
    <div style={{ position: 'relative', height: '80vh', width: '100%' }}>
      {/* @ts-ignore - relax MapContainer typing for this usage in this project */}
      <MapContainer center={[34.74, 10.76] as unknown as L.LatLngExpression} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Trashcans existants */}
        {trashcans.map((t: Trashcan) => (
          <AnyMarker
            key={t.id}
            position={[t.lat, t.lng]}
            icon={getTrashIcon(t.status) as any}
            draggable={selected?.id === t.id}
            eventHandlers={{
              click: () => setSelected(t),
              dragend: (e: L.DragEndEvent) => handleMove(t.id, e.target.getLatLng()),
            }}
          >
            {selected?.id === t.id && !tempPosition?.id && (
              <Popup>
                <div>
                  <p><b>{t.name}</b></p>
                  <p>Status: {t.status}</p>
                  <p>Type: {t.type || 'non défini'}</p>
                  <button onClick={() => { setTempPosition({ lat: t.lat, lng: t.lng, id: t.id }); setEditAddress(t.name); }}>Modifier</button>
                  <button onClick={() => handleDelete(t.id)}>Supprimer</button>
                </div>
              </Popup>
            )}
          </AnyMarker>
        ))}

        {/* Déplacement */}
        {tempPosition?.id && (
          <AnyMarker
            position={[tempPosition.lat!, tempPosition.lng!]}
            icon={getTrashIcon('vide') as any}
            draggable
            eventHandlers={{
              dragend: (e: L.DragEndEvent) => setTempPosition({ ...tempPosition, lat: e.target.getLatLng().lat, lng: e.target.getLatLng().lng }),
            }}
          >
            <Popup>
              <div>
                <p>Zone / Adresse :</p>
                <input
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Ex: Avenue Habib Bourguiba"
                  style={{ width: '100%', padding: '6px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: 4 }}
                />
                <p>Déplacer la poubelle ?</p>
                <button onClick={confirmMove} disabled={!editAddress.trim() && !trashcans.find(t => t.id === tempPosition.id)?.name}>Confirmer</button>
                <button onClick={cancelMove}>Annuler</button>
              </div>
            </Popup>
          </AnyMarker>
        )}

        {/* Ajout */}
        {adding && <AddMarker onSelectLocation={handleAddTrashcan} />}
        {tempPosition && !tempPosition.id && (
          <AnyMarker position={[tempPosition.lat!, tempPosition.lng!]} icon={getTrashIcon('vide') as any}>
            <Popup>
              <div style={{ minWidth: 220 }}>
                <p>Zone / Adresse :</p>
                <input
                  value={newTrashAddress}
                  onChange={(e) => setNewTrashAddress(e.target.value)}
                  placeholder="Ex: Avenue Habib Bourguiba"
                  style={{ width: '100%', padding: '6px', marginBottom: '6px', border: '1px solid #ccc', borderRadius: 4 }}
                />
                <p>Type de déchets :</p>
                <select
                  value={newTrashType}
                  onChange={(e) => setNewTrashType(e.target.value as 'plastique' | 'verre' | 'papier')}
                  style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: 4 }}
                >
                  <option value="plastique">Plastique</option>
                  <option value="verre">Verre</option>
                  <option value="papier">Papier</option>
                </select>
                <div style={{ marginTop: '8px', display: 'flex', gap: 8 }}>
                  <button onClick={confirmAdd} disabled={!newTrashAddress.trim()} style={{ flex: 1 }}>
                    Ajouter
                  </button>
                  <button onClick={cancelAdd} style={{ flex: 1 }}>
                    Annuler
                  </button>
                </div>
              </div>
            </Popup>
          </AnyMarker>
        )}
      </MapContainer>

      {/* Bouton add.png en bas à droite */}
      <img
        src="/icons/add.png"
        alt="Add Trashcan"
        onClick={handleStartAdd}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          cursor: 'pointer',
          zIndex: 1000,
        }}
      />
    </div>
  );
}
