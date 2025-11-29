"use client";

import { useState } from 'react';

export default function ReclamationsPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // placeholder: in real app we'd POST to an API
    setStatus('Réclamation créée (simulée)');
    setTitle('');
    setDescription('');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Gestion des Réclamations</h1>
      <form onSubmit={submit} style={{ maxWidth: 600 }}>
        <div>
          <label>Titre</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <button type="submit">Soumettre</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}
