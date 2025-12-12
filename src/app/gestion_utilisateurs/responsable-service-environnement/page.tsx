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

// Helper: Generate pie chart path commands
const generatePieSlice = (
  startAngle: number,
  endAngle: number,
  radius: number,
  centerX: number,
  centerY: number
): string => {
  if (startAngle === endAngle) return '';
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const x1 = centerX + radius * Math.cos(startRad);
  const y1 = centerY + radius * Math.sin(startRad);
  const x2 = centerX + radius * Math.cos(endRad);
  const y2 = centerY + radius * Math.sin(endRad);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};

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
        console.error('Error fetching ', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // 📊 Compute global waste totals for pie chart
  const globalWaste = {
    papier: 0,
    plastique: 0,
    verre: 0,
    autre: 0,
  };

  monthlyWasteData.forEach(month => {
    globalWaste.papier += month.papier;
    globalWaste.plastique += month.plastique;
    globalWaste.verre += month.verre;
    globalWaste.autre += month.autre;
  });

  const totalWaste = globalWaste.papier + globalWaste.plastique + globalWaste.verre + globalWaste.autre;

  // 🥧 Pie Chart Rendering Function — fully corrected positioning
  const renderPieChart = () => {
    const RADIUS = 86; // outer radius
    const INNER_RADIUS = 60; // for center text clearance
    const CENTER_X = 110;
    const CENTER_Y = 110;

    const colors = {
      papier: '#8b5cf6',
      plastique: '#ec4899',
      verre: '#06b6d4',
      autre: '#f59e0b',
    };

    const labels = {
      papier: 'Papier',
      plastique: 'Plastique',
      verre: 'Verre',
      autre: 'Autre',
    };

    let startAngle = -90;
    const slices = [];

    // Generate slices (only for non-zero)
    if (totalWaste > 0) {
      (['papier', 'plastique', 'verre', 'autre'] as const).forEach(type => {
        const value = globalWaste[type];
        if (value <= 0) return;
        const percentage = (value / totalWaste) * 100;
        const angle = (percentage / 100) * 360;
        const endAngle = startAngle + angle;

        slices.push(
          <path
            key={type}
            d={generatePieSlice(startAngle, endAngle, RADIUS, CENTER_X, CENTER_Y)}
            fill={colors[type]}
            stroke="#fff"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        );

        startAngle = endAngle;
      });
    }

    // ✅ Always show all 4 types in legend — including 0.0%
    const legendItems = (['papier', 'plastique', 'verre', 'autre'] as const).map(type => {
      const value = globalWaste[type];
      const percentage = totalWaste > 0 ? (value / totalWaste) * 100 : 0;
      return (
        <div
          key={type}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.95rem',
            padding: '5px 0',
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: colors[type],
              flexShrink: 0,
              border: '1.5px solid #fff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          />
          <span style={{ fontWeight: 500, color: '#4b5563', flexShrink: 0 }}>{labels[type]}:</span>
          <span style={{ fontWeight: 600, color: '#1f2937', minWidth: 40 }}>{percentage.toFixed(1)}%</span>
          <span style={{ color: '#6b7280', fontSize: '0.9rem', flexShrink: 0 }}>({value.toFixed(1)} kg)</span>
        </div>
      );
    });

    // Center label font size (responsive to number length)
    let centerFontSize = 16;
    if (totalWaste >= 1000) centerFontSize = 14;
    if (totalWaste >= 10000) centerFontSize = 12;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          padding: '24px 20px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h4
            style={{
              margin: '0 0 8px 0',
              fontSize: '1.35rem',
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Répartition globale des déchets
          </h4>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>
            Sur l’ensemble des rapports disponibles
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 32,
            alignItems: 'flex-start',
            justifyContent: 'center',
            width: '100%',
            flexWrap: 'wrap',
          }}
        >
          {/* SVG Chart — Corrected positioning */}
          <div style={{ flex: '0 0 auto', textAlign: 'center' }}>
            <svg width="220" height="220" viewBox="0 0 220 220">
              {/* Background ring for empty state */}
              {totalWaste === 0 && (
                <circle
                  cx={CENTER_X}
                  cy={CENTER_Y}
                  r={RADIUS}
                  fill="#f3f4f6"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
              )}

              {/* Slices */}
              {slices}

              {/* Center label — perfectly centered */}
              {totalWaste > 0 ? (
                <>
                  <text
                    x={CENTER_X}
                    y={CENTER_Y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={centerFontSize}
                    fontWeight="700"
                    fill="#111827"
                    fontFamily="system-ui, sans-serif"
                    pointerEvents="none"
                  >
                    {totalWaste.toFixed(1)}
                  </text>
                  <text
                    x={CENTER_X}
                    y={CENTER_Y + 20}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                    fill="#6b7280"
                    fontFamily="system-ui, sans-serif"
                    pointerEvents="none"
                  >
                    kg total
                  </text>
                </>
              ) : (
                <>
                  <text
                    x={CENTER_X}
                    y={CENTER_Y - 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="16"
                    fontWeight="600"
                    fill="#9ca3af"
                    fontFamily="system-ui, sans-serif"
                  >
                    0,0
                  </text>
                  <text
                    x={CENTER_X}
                    y={CENTER_Y + 16}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                    fill="#d1d5db"
                    fontFamily="system-ui, sans-serif"
                  >
                    kg total
                  </text>
                </>
              )}
            </svg>
          </div>

          {/* Legend */}
          <div
            style={{
              flex: '1 1 260px',
              maxWidth: '320px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: '8px 0 4px',
            }}
          >
            {legendItems}
          </div>
        </div>
      </div>
    );
  };

  // Hydration guard
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
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginTop: 100
            }}>
              Émissions de CO₂ par Mois
            </button>
            <button onClick={() => setActiveSection('waste')} style={{
              padding: '12px 16px',
              backgroundColor: activeSection === 'waste' ? '#10b981' : '#f3f4f6',
              color: activeSection === 'waste' ? '#fff' : '#374151',
              borderRadius: 6,
              border: 'none',
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
              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '24px', marginTop:100 }}>
                Émissions de CO₂ par Mois
              </h2>

              {monthlyData.length === 0 ? (
                <p style={{ color: '#6b7280' }}>Aucune donnée disponible</p>
              ) : (
                <div style={{ display: 'grid', gap: 24 }}>
                  {monthlyData.map((month, idx) => {
                    const avgCO2 = month.weeks.length > 0 ? month.totalCO2 / month.weeks.length : 0;
                    const totalReports = month.weeks.reduce((sum, w) => sum + w.rapportCount, 0);

                    return (
                      <div
                        key={idx}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          backgroundColor: '#fff',
                          overflow: 'hidden',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{
                          backgroundColor: '#f9fafb',
                          padding: '16px 20px',
                          borderBottom: '1px solid #e5e7eb',
                        }}>
                          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
                            {month.month}
                          </h3>
                        </div>

                        <div style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
                            {[
                              { label: 'TOTAL CO₂', value: month.totalCO2, unit: 'kg', color: '#047857', bg: '#f0fdf4' },
                              { label: 'MOY. / SEMAINE', value: avgCO2, unit: 'kg', color: '#047857', bg: '#f0fdf4' },
                              { label: 'SEMAINES', value: month.weeks.length, unit: '', color: '#047857', bg: '#f0fdf4' },
                              { label: 'RAPPORTS', value: totalReports, unit: '', color: '#047857', bg: '#f0fdf4' },
                            ].map((item, i) => (
                              <div
                                key={i}
                                style={{
                                  backgroundColor: item.bg,
                                  borderLeft: `4px solid ${item.color}`,
                                  borderRadius: 8,
                                  padding: '14px 16px',
                                }}
                              >
                                <p style={{ margin: 0, fontSize: 12, color: '#065f46', fontWeight: 600 }}>{item.label}</p>
                                <p style={{ margin: '6px 0 0 0', fontSize: 22, fontWeight: 700, color: item.color }}>
                                  {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
                                </p>
                                {item.unit && (
                                  <p style={{ margin: '2px 0 0 0', fontSize: 11, color: '#16a34a' }}>{item.unit}</p>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Weekly Chart */}
                          <div style={{
                            backgroundColor: '#f9fafb',
                            borderRadius: 8,
                            padding: 16,
                            marginBottom: 16,
                            border: '1px solid #e5e7eb',
                          }}>
                            <p style={{ margin: '0 0 12px 0', fontWeight: 600, fontSize: 12, color: '#4b5563' }}>
                              Répartition par semaine
                            </p>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 70 }}>
                              {month.weeks.map((week, wIdx) => {
                                const maxCO2 = Math.max(...month.weeks.map(w => w.totalCO2), 1);
                                const barHeight = (week.totalCO2 / maxCO2) * 56;
                                const startDate = new Date(week.weekStart);
                                return (
                                  <div key={wIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <div
                                      style={{
                                        height: barHeight > 0 ? barHeight : 4,
                                        backgroundColor: '#10b981',
                                        borderRadius: 3,
                                        width: '100%',
                                        minHeight: 4,
                                      }}
                                      title={`${week.totalCO2.toFixed(2)} kg CO₂`}
                                    />
                                    <div style={{ fontSize: 10, textAlign: 'center', color: '#6b7280' }}>
                                      {startDate.getDate()}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Table */}
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                              <thead>
                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#4b5563', borderBottom: '2px solid #e5e7eb' }}>Semaine</th>
                                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: 11, color: '#4b5563', borderBottom: '2px solid #e5e7eb' }}>CO₂ (kg)</th>
                                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: 11, color: '#4b5563', borderBottom: '2px solid #e5e7eb' }}>Rapports</th>
                                </tr>
                              </thead>
                              <tbody>
                                {month.weeks.map((week, wIdx) => (
                                  <tr key={wIdx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '10px 12px', fontSize: 13 }}>
                                      {new Date(week.weekStart).toLocaleDateString('fr-FR')} → {new Date(week.weekEnd).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#047857', fontSize: 13 }}>
                                      {week.totalCO2.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13 }}>
                                      {week.rapportCount}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
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
              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '24px',marginTop:100 }}>
                Déchets recyclables par Mois
              </h2>

              {/* 🥧 Global Pie Chart — Correctly positioned */}
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '14px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.02)',
                  marginBottom: '32px',
                  overflow: 'hidden',
                }}
              >
                {renderPieChart()}
              </div>

              {monthlyWasteData.length === 0 ? (
                <p style={{ color: '#6b7280' }}>Aucune donnée disponible</p>
              ) : (
                <div style={{ display: 'grid', gap: 24 }}>
                  {monthlyWasteData.map((month, idx) => {
                    const avgTotal = month.weeks.length > 0 ? month.total / month.weeks.length : 0;

                    return (
                      <div
                        key={idx}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          backgroundColor: '#fff',
                          overflow: 'hidden',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{
                          backgroundColor: '#f9fafb',
                          padding: '16px 20px',
                          borderBottom: '1px solid #e5e7eb',
                        }}>
                          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
                            {month.month}
                          </h3>
                        </div>

                        <div style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
                            {[
                              { label: 'TOTAL', value: month.total, unit: 'kg', color: '#047857', bg: '#f0fdf4', bar: '#10b981' },
                              { label: 'MOY. / SEMAINE', value: avgTotal, unit: 'kg', color: '#047857', bg: '#f0fdf4', bar: '#10b981' },
                              { label: 'PAPIER', value: month.papier, unit: 'kg', color: '#7c3aed', bg: '#f5f3ff', bar: '#8b5cf6' },
                              { label: 'PLASTIQUE', value: month.plastique, unit: 'kg', color: '#e11d48', bg: '#fef2f2', bar: '#ec4899' },
                              { label: 'VERRE', value: month.verre, unit: 'kg', color: '#0e7490', bg: '#ecfeff', bar: '#06b6d4' },
                              { label: 'AUTRE', value: month.autre, unit: 'kg', color: '#d97706', bg: '#fffbeb', bar: '#f59e0b' },
                            ].map((item, i) => (
                              <div
                                key={i}
                                style={{
                                  backgroundColor: item.bg,
                                  borderLeft: `4px solid ${item.bar}`,
                                  borderRadius: 8,
                                  padding: '14px 16px',
                                }}
                              >
                                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: item.color.replace('700', '600').replace('500', '600') }}>{item.label}</p>
                                <p style={{ margin: '6px 0 0 0', fontSize: 22, fontWeight: 700, color: item.color }}>
                                  {item.value.toFixed(1)}
                                </p>
                                {item.unit && (
                                  <p style={{ margin: '2px 0 0 0', fontSize: 11, color: item.color.replace('700', '400').replace('500', '400') }}>{item.unit}</p>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Weekly Chart */}
                          <div style={{
                            backgroundColor: '#f9fafb',
                            borderRadius: 8,
                            padding: 16,
                            marginBottom: 16,
                            border: '1px solid #e5e7eb',
                          }}>
                            <p style={{ margin: '0 0 12px 0', fontWeight: 600, fontSize: 12, color: '#4b5563' }}>
                              Répartition par semaine
                            </p>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 70 }}>
                              {month.weeks.map((week, wIdx) => {
                                const maxTotal = Math.max(...month.weeks.map(w => w.total), 1);
                                const barHeight = (week.total / maxTotal) * 56;
                                const startDate = new Date(week.weekStart);
                                return (
                                  <div key={wIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <div
                                      style={{
                                        height: barHeight > 0 ? barHeight : 4,
                                        backgroundColor: '#10b981',
                                        borderRadius: 3,
                                        width: '100%',
                                        minHeight: 4,
                                      }}
                                      title={`${week.total.toFixed(2)} kg`}
                                    />
                                    <div style={{ fontSize: 10, textAlign: 'center', color: '#6b7280' }}>
                                      {startDate.getDate()}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Table */}
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                              <thead>
                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#4b5563', borderBottom: '2px solid #e5e7eb' }}>Semaine</th>
                                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: 11, color: '#4b5563', borderBottom: '2px solid #e5e7eb' }}>Total (kg)</th>
                                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: 11, color: '#4b5563', borderBottom: '2px solid #e5e7eb' }}>Papier</th>
                                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: 11, color: '#4b5563', borderBottom: '2px solid #e5e7eb' }}>Plastique</th>
                                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: 11, color: '#4b5563', borderBottom: '2px solid #e5e7eb' }}>Verre</th>
                                </tr>
                              </thead>
                              <tbody>
                                {month.weeks.map((week, wIdx) => (
                                  <tr key={wIdx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '10px 12px', fontSize: 13 }}>
                                      {new Date(week.weekStart).toLocaleDateString('fr-FR')} → {new Date(week.weekEnd).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#047857', fontSize: 13 }}>
                                      {week.total.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, color: '#7c3aed' }}>
                                      {week.papier.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, color: '#e11d48' }}>
                                      {week.plastique.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, color: '#0e7490' }}>
                                      {week.verre.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
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