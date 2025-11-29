"use client";

import Link from 'next/link';

export default function TourneesIndex() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Gestion des Tournées</h1>
      <p>Choisissez une sous-section :</p>
      <ul>
        <li><Link href="/gestion_tournees/gestion_vehicules">Gestion Véhicules</Link></li>
        <li><Link href="/gestion_tournees/gestion_ts_collectes">Gestion Tâches / Collectes</Link></li>
      </ul>
    </div>
  );
}
