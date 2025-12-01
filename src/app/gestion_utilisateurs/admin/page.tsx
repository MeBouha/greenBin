"use client";

import Header from '../header';
import dynamic from 'next/dynamic';

const GestionUsers = dynamic(() => import('../gestion_users'), { ssr: false });

export default function AdminPage() {
  return (
    <div>
      <Header/>
      <main style={{ padding: 20 }}>
        <GestionUsers/>
      </main>
    </div>
  );
}
