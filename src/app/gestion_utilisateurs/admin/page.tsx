"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../header';
import dynamic from 'next/dynamic';

const GestionUsers = dynamic(() => import('../gestion_users'), { ssr: false });

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Authentication & authorization check
  useEffect(() => {
    setMounted(true);
    try {
      const raw = sessionStorage.getItem('user');
      if (raw) {
        const userData = JSON.parse(raw);
        setCurrentUser(userData);

        // Only allow admin / specific roles
        const allowedRoles = ['admin']; // ⚠️ Adjust based on your needs (e.g., add 'super admin' etc.)
        if (!allowedRoles.map(r => r.toLowerCase()).includes(userData.role?.toLowerCase())) {
          router.push('/gestion_utilisateurs');
          return;
        }
      } else {
        router.push('/gestion_utilisateurs');
        return;
      }
    } catch (e) {
      console.error('Auth check failed:', e);
      router.push('/gestion_utilisateurs');
    }
  }, [router]);

  // Early return before mount (hydration safety)
  if (!mounted) {
    return (
      <div>
        <Header />
        <main style={{ padding: 20 }}>
          <p>Chargement...</p>
        </main>
      </div>
    );
  }

  // Show nothing or minimal UI while redirecting (Next.js will handle nav)
  if (!currentUser) {
    return null;
  }

  return (
    <div>
      <Header />
      <main style={{ padding: 20 }}>
        <GestionUsers />
      </main>
    </div>
  );
}