"use client";

import { useState } from 'react';

export default function GestionTsCollectes() {
  const [taches, setTaches] = useState<Array<{ id: number; nom: string }>>([
    { id: 1, nom: 'Collecte quartier A' },
  ]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Gestion Tâches / Collectes</h1>
      <ul>
        {taches.map((t) => (
          <li key={t.id}>{t.nom}</li>
        ))}
      </ul>
    </div>
  );
}
