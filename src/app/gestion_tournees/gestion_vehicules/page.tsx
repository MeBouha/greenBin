"use client";

import { useState } from 'react';

export default function GestionVehicules() {
  const [vehicules, setVehicules] = useState<Array<{ id: number; immat: string }>>([
    { id: 1, immat: '123-XYZ' },
  ]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Gestion des Véhicules</h1>
      <ul>
        {vehicules.map((v) => (
          <li key={v.id}>{v.immat}</li>
        ))}
      </ul>
    </div>
  );
}
