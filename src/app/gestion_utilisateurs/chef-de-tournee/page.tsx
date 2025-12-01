"use client";


import dynamic from 'next/dynamic';
import Header from '../header';

const TrashMapChef = dynamic(() => import('../../gestion_tournees/gestion_ts_collectes/TrashMapChef'), { ssr: false });

export default function ChefDeTournee() {
  return (
    <div>
      <Header/>
      <main style={{ padding: 20 }}>
        <TrashMapChef/>
      </main>
    </div>
  );
}
