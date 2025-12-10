"use client";

import Reclamation from '@/app/gestion_reclamations/reclamation';
import Header from '../header';

export default function Citoyen() {
  return (
    <div>
          <Header/>
          <main style={{ padding: 20 }}>
            <Reclamation/>
          </main>
        </div>
  );
}
