"use client";

import dynamic from 'next/dynamic';

const GererPointsCollecte = dynamic(() => import('./GererPointsCollecteMap'), { ssr: false });

export default GererPointsCollecte;
