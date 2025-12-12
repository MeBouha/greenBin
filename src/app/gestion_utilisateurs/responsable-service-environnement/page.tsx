"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../header';

interface WeekData {
  weekStart: string;
  weekEnd: string;
  totalCO2: number;
  rapportCount: number;
}

interface MonthlyData {
  month: string;
  year: number;
  weeks: WeekData[];
  totalCO2: number;
}

interface WeekWasteData {
  weekStart: string;
  weekEnd: string;
  total: number;
  papier: number;
  plastique: number;
  verre: number;
  autre: number;
}

interface MonthlyWasteData {
  month: string;
  year: number;
  weeks: WeekWasteData[];
  total: number;
  papier: number;
  plastique: number;
  verre: number;
  autre: number;
}

export default function RespEnvironnement() {
  const router = useRouter();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [monthlyWasteData, setMonthlyWasteData] = useState<MonthlyWasteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'co2' | 'waste'>('co2');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    setMounted(true);
    try {
      const raw = sessionStorage.getItem('user');
      if (raw) {
        const userData = JSON.parse(raw);
        setCurrentUser(userData);
        
        // Check if user has permission to access this page
        const allowedRoles = ['responsable service d\'environnement', 'admin', 'responsable municipalite'];
        if (!allowedRoles.includes(userData.role?.toLowerCase())) {
          router.push('/gestion_utilisateurs');
        }
      } else {
        // No user logged in, redirect to login
        router.push('/gestion_utilisateurs');
      }
    } catch (e) {
      console.error('Error reading user from sessionStorage:', e);
      router.push('/gestion_utilisateurs');
    }
  }, [router]);

  // Only fetch data if user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        // Fetch CO2 data
        const co2Res = await fetch('/api/rapports?format=co2-by-week');
        const co2Weeks: WeekData[] = await co2Res.json();

        // Group CO2 weeks by month
        const co2MonthMap = new Map<string, MonthlyData>();
        for (const week of co2Weeks) {
          const date = new Date(week.weekStart);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthName = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

          if (!co2MonthMap.has(monthKey)) {
            co2MonthMap.set(monthKey, {
              month: monthName,
              year: date.getFullYear(),
              weeks: [],
              totalCO2: 0,
            });
          }

          const monthData = co2MonthMap.get(monthKey)!;
          monthData.weeks.push(week);
          monthData.totalCO2 += week.totalCO2;
        }

        const co2Result = Array.from(co2MonthMap.values()).sort(
          (a, b) => new Date(`${b.year}-01-01`).getTime() - new Date(`${a.year}-01-01`).getTime()
        );
        setMonthlyData(co2Result);

        // Fetch waste data
        const wasteRes = await fetch('/api/rapports?format=dechets-by-week');
        const wasteWeeks: WeekWasteData[] = await wasteRes.json();

        // Group waste weeks by month
        const wasteMonthMap = new Map<string, MonthlyWasteData>();
        for (const week of wasteWeeks) {
          const date = new Date(week.weekStart);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthName = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

          if (!wasteMonthMap.has(monthKey)) {
            wasteMonthMap.set(monthKey, {
              month: monthName,
              year: date.getFullYear(),
              weeks: [],
              total: 0,
              papier: 0,
              plastique: 0,
              verre: 0,
              autre: 0,
            });
          }

          const monthData = wasteMonthMap.get(monthKey)!;
          monthData.weeks.push(week);
          monthData.total += week.total;
          monthData.papier += week.papier;
          monthData.plastique += week.plastique;
          monthData.verre += week.verre;
          monthData.autre += week.autre;
        }

        const wasteResult = Array.from(wasteMonthMap.values()).sort(
          (a, b) => new Date(`${b.year}-01-01`).getTime() - new Date(`${a.year}-01-01`).getTime()
        );
        setMonthlyWasteData(wasteResult);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div>
        <Header />
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
          <main style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            <h1>Responsable Service d'Environnement Dashboard</h1>
            <p>Chargement...</p>
          </main>
        </div>
      </div>
    );
  }

  // If not authenticated, show loading or redirect
  if (!currentUser) {
    return (
      <div>
        <Header />
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
          <main style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            <h1>Responsable Service d'Environnement Dashboard</h1>
            <p>Redirection vers la page de connexion...</p>
          </main>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
          <main style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            <h1>Responsable Service d'Environnement Dashboard</h1>
            <p>Chargement des données...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        {/* Sidebar */}
        <aside style={{
          width: 240,
          flexShrink: 0,
          backgroundColor: '#f9fafb',
          borderRight: '1px solid #e5e7eb',
          padding: 20,
          overflowY: 'auto',
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => setActiveSection('co2')} style={{
              padding: '12px 16px',
              backgroundColor: activeSection === 'co2' ? '#10b981' : '#f3f4f6',
              color: activeSection === 'co2' ? '#fff' : '#374151',
              borderRadius: 6,
              border: 'none',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginTop: 100
            }}>
              Émissions de CO2 par Mois
            </button>
            <button onClick={() => setActiveSection('waste')} style={{
              padding: '12px 16px',
              backgroundColor: activeSection === 'waste' ? '#10b981' : '#f3f4f6',
              color: activeSection === 'waste' ? '#fff' : '#374151',
              borderRadius: 6,
              border: 'none',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}>
              Déchets recyclables par Mois
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {activeSection === 'co2' && (
            <>
              <h2>Émissions de CO2 par Mois</h2>

              {monthlyData.length === 0 ? (
                <p>Aucune donnée disponible</p>
              ) : (
                <div style={{ display: 'grid', gap: 20 }}>
            {monthlyData.map((month, idx) => {
              const avgCO2 = month.weeks.length > 0 ? month.totalCO2 / month.weeks.length : 0;
              const totalReports = month.weeks.reduce((sum, w) => sum + w.rapportCount, 0);

              return (
              <div key={idx}>
                <h3 style={{ margin: '0 0 12px 0' }}>{month.month}</h3>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    backgroundColor: '#fff',
                    borderLeft: '4px solid #10b981',
                    borderRadius: 6,
                    padding: 12,
                  }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 600 }}>TOTAL CO2</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
                      {month.totalCO2.toFixed(1)}
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: 10, color: '#9ca3af' }}>kg</p>
                  </div>

                  <div style={{
                    backgroundColor: '#fff',
                    borderLeft: '4px solid #10b981',
                    borderRadius: 6,
                    padding: 12,
                  }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 600 }}>MOY. PAR SEMAINE</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
                      {avgCO2.toFixed(1)}
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: 10, color: '#9ca3af' }}>kg</p>
                  </div>

                  <div style={{
                    backgroundColor: '#fff',
                    borderLeft: '4px solid #10b981',
                    borderRadius: 6,
                    padding: 12,
                  }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 600 }}>SEMAINES</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
                      {month.weeks.length}
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: '#fff',
                    borderLeft: '4px solid #10b981',
                    borderRadius: 6,
                    padding: 12,
                  }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 600 }}>RAPPORTS</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
                      {totalReports}
                    </p>
                  </div>
                </div>

                {/* Main Content Card */}
                <div style={{
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  padding: 12,
                  backgroundColor: '#f9fafb'
                }}>
                
                {/* Weekly Breakdown Chart */}
                <div style={{
                  backgroundColor: '#fff',
                  borderLeft: '4px solid #10b981',
                  borderRadius: 6,
                  padding: 12,
                  marginBottom: 12,
                }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: 600, fontSize: 11, color: '#6b7280' }}>RÉPARTITION PAR SEMAINE</p>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 80 }}>
                    {month.weeks.map((week, wIdx) => {
                      const maxCO2 = Math.max(...month.weeks.map(w => w.totalCO2), 1);
                      const barHeight = (week.totalCO2 / maxCO2) * 60;
                      const startDate = new Date(week.weekStart);
                      const weekLabel = `${startDate.getDate()}/${startDate.getMonth() + 1}`;

                      return (
                        <div
                          key={wIdx}
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <div
                            style={{
                              height: barHeight,
                              backgroundColor: '#10b981',
                              borderRadius: 2,
                              width: '100%',
                              minHeight: 4,
                              position: 'relative',
                            }}
                            title={`${week.totalCO2.toFixed(2)} kg CO2`}
                          />
                          <div style={{ fontSize: 9, textAlign: 'center', width: '100%', color: '#6b7280' }}>
                            {weekLabel}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Weekly Details Table */}
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  backgroundColor: '#fff',
                  fontSize: 12,
                  marginBottom: 16,
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: 8, textAlign: 'left', fontWeight: 600, fontSize: 10, color: '#6b7280' }}>Semaine</th>
                      <th style={{ padding: 8, textAlign: 'right', fontWeight: 600, fontSize: 10, color: '#6b7280' }}>CO2 (kg)</th>
                      <th style={{ padding: 8, textAlign: 'right', fontWeight: 600, fontSize: 10, color: '#6b7280' }}>Rapports</th>
                    </tr>
                  </thead>
                  <tbody>
                    {month.weeks.map((week, wIdx) => (
                      <tr key={wIdx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: 8 }}>
                          {new Date(week.weekStart).toLocaleDateString('fr-FR')} → {new Date(week.weekEnd).toLocaleDateString('fr-FR')}
                        </td>
                        <td style={{ padding: 8, textAlign: 'right', fontWeight: 600, color: '#10b981' }}>
                          {week.totalCO2.toFixed(2)}
                        </td>
                        <td style={{ padding: 8, textAlign: 'right' }}>
                          {week.rapportCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
              );
            })}
          </div>
        )}
            </>
          )}

        {activeSection === 'waste' && (
          <>
            <h2>Déchets recyclables par Mois</h2>

            {monthlyWasteData.length === 0 ? (
              <p>Aucune donnée disponible</p>
            ) : (
              <div style={{ display: 'grid', gap: 20 }}>
            {monthlyWasteData.map((month, idx) => {
              const avgTotal = month.weeks.length > 0 ? month.total / month.weeks.length : 0;

              return (
              <div key={idx}>
                <h3 style={{ margin: '0 0 12px 0' }}>{month.month}</h3>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    backgroundColor: '#fff',
                    borderLeft: '4px solid #10b981',
                    borderRadius: 6,
                    padding: 12,
                  }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 600 }}>TOTAL DÉCHETS</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
                      {month.total.toFixed(1)}
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: 10, color: '#9ca3af' }}>kg</p>
                  </div>

                  <div style={{
                    backgroundColor: '#fff',
                    borderLeft: '4px solid #10b981',
                    borderRadius: 6,
                    padding: 12,
                  }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 600 }}>MOY. PAR SEMAINE</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
                      {avgTotal.toFixed(1)}
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: 10, color: '#9ca3af' }}>kg</p>
                  </div>

                  <div style={{
                    backgroundColor: '#fff',
                    borderLeft: '4px solid #8b5cf6',
                    borderRadius: 6,
                    padding: 12,
                  }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 600 }}>PAPIER</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
                      {month.papier.toFixed(1)}
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: 10, color: '#9ca3af' }}>kg</p>
                  </div>

                  <div style={{
                    backgroundColor: '#fff',
                    borderLeft: '4px solid #ec4899',
                    borderRadius: 6,
                    padding: 12,
                  }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 600 }}>PLASTIQUE</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
                      {month.plastique.toFixed(1)}
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: 10, color: '#9ca3af' }}>kg</p>
                  </div>

                  <div style={{
                    backgroundColor: '#fff',
                    borderLeft: '4px solid #06b6d4',
                    borderRadius: 6,
                    padding: 12,
                  }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 600 }}>VERRE</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
                      {month.verre.toFixed(1)}
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: 10, color: '#9ca3af' }}>kg</p>
                  </div>

                  <div style={{
                    backgroundColor: '#fff',
                    borderLeft: '4px solid #f59e0b',
                    borderRadius: 6,
                    padding: 12,
                  }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 600 }}>AUTRE</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
                      {month.autre.toFixed(1)}
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: 10, color: '#9ca3af' }}>kg</p>
                  </div>
                </div>

                {/* Main Content Card */}
                <div style={{
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  padding: 12,
                  backgroundColor: '#f9fafb'
                }}>
                
                {/* Weekly Breakdown Chart */}
                <div style={{
                  backgroundColor: '#fff',
                  borderLeft: '4px solid #10b981',
                  borderRadius: 6,
                  padding: 12,
                  marginBottom: 12,
                }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: 600, fontSize: 11, color: '#6b7280' }}>RÉPARTITION PAR SEMAINE</p>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 80 }}>
                    {month.weeks.map((week, wIdx) => {
                      const maxTotal = Math.max(...month.weeks.map(w => w.total), 1);
                      const barHeight = (week.total / maxTotal) * 60;
                      const startDate = new Date(week.weekStart);
                      const weekLabel = `${startDate.getDate()}/${startDate.getMonth() + 1}`;

                      return (
                        <div
                          key={wIdx}
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <div
                            style={{
                              height: barHeight,
                              backgroundColor: '#10b981',
                              borderRadius: 2,
                              width: '100%',
                              minHeight: 4,
                              position: 'relative',
                            }}
                            title={`${week.total.toFixed(2)} kg`}
                          />
                          <div style={{ fontSize: 9, textAlign: 'center', width: '100%', color: '#6b7280' }}>
                            {weekLabel}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Weekly Details Table */}
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  backgroundColor: '#fff',
                  fontSize: 12,
                  marginBottom: 16,
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: 8, textAlign: 'left', fontWeight: 600, fontSize: 10, color: '#6b7280' }}>Semaine</th>
                      <th style={{ padding: 8, textAlign: 'right', fontWeight: 600, fontSize: 10, color: '#6b7280' }}>Total (kg)</th>
                      <th style={{ padding: 8, textAlign: 'right', fontWeight: 600, fontSize: 10, color: '#6b7280' }}>Papier</th>
                      <th style={{ padding: 8, textAlign: 'right', fontWeight: 600, fontSize: 10, color: '#6b7280' }}>Plastique</th>
                      <th style={{ padding: 8, textAlign: 'right', fontWeight: 600, fontSize: 10, color: '#6b7280' }}>Verre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {month.weeks.map((week, wIdx) => (
                      <tr key={wIdx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: 8 }}>
                          {new Date(week.weekStart).toLocaleDateString('fr-FR')} → {new Date(week.weekEnd).toLocaleDateString('fr-FR')}
                        </td>
                        <td style={{ padding: 8, textAlign: 'right', fontWeight: 600, color: '#10b981' }}>
                          {week.total.toFixed(2)}
                        </td>
                        <td style={{ padding: 8, textAlign: 'right' }}>
                          {week.papier.toFixed(2)}
                        </td>
                        <td style={{ padding: 8, textAlign: 'right' }}>
                          {week.plastique.toFixed(2)}
                        </td>
                        <td style={{ padding: 8, textAlign: 'right' }}>
                          {week.verre.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
              );
            })}
          </div>
            )}
          </>
        )}
        </main>
      </div>
    </div>
  );
}