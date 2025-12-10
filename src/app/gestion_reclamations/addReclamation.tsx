"use client";
  
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Props = { onClose?: () => void };

export default function AddReclamation({ onClose }: Props) {
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [AuthComponent, setAuthComponent] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        citoyenNom: formData.get('citoyenNom'),
        citoyenPrenom: formData.get('citoyenPrenom'),
        contenu: formData.get('contenu'),
        type: formData.get('type'),
        status: 'new',
        date: new Date().toISOString().split('T')[0],
      };

      const res = await fetch('/api/reclamations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }

      const result = await res.json();
      console.log('✅ Reclamation added:', result);

      // Reset form
      if (formRef.current) {
        formRef.current.reset();
      }

      // Close modal if onClose provided
      if (onClose) {
        onClose();
      } else {
        alert('Réclamation ajoutée avec succès!');
      }
    } catch (err) {
      console.error('Failed to add reclamation', err);
      alert('Erreur lors de l\'ajout de la réclamation: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const formStyles: React.CSSProperties = {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    alignItems: 'start',
  };

  const fullWidthStyle: React.CSSProperties = { gridColumn: '1 / -1' };
  const labelStyle: React.CSSProperties = { fontSize: 13, color: '#374151', marginBottom: 6 };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' };
  const textareaStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', minHeight: 120 };
  const btnPrimary: React.CSSProperties = { backgroundColor: '#059669', color: '#fff', padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700 };
  const btnSecondary: React.CSSProperties = { backgroundColor: '#f3f4f6', color: '#111827', padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer' };

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 20px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>GB</div>
          <div style={{ fontWeight: 600 }}>GreenBin</div>
        </div>
        <div>
          <img
            src="/profile_pic.png"
            alt="profile"
            style={{ width: 36, height: 36, borderRadius: 18, cursor: 'pointer' }}
            onClick={() => {
              setShowAuth(true);
              if (!AuthComponent) {
                import('../gestion_utilisateurs/auth').then((m: any) => setAuthComponent(() => (m.default ?? m.AuthPage ?? m))).catch(() => {});
              }
            }}
          />
        </div>
      </header>

      {showAuth && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', zIndex: 2000 }}>
          <div style={{ width: 'min(900px,96%)', maxHeight: '90vh', overflow: 'auto', background: '#fff', borderRadius: 8, padding: 12 }}>
            {AuthComponent ? <AuthComponent onClose={() => setShowAuth(false)} /> : <div>Loading...</div>}
          </div>
        </div>
      )}

      <main style={{ padding: 20 }}>
        <section style={{ width: '100%', maxWidth: 900, margin: '0 auto', padding: '24px 0', background: '#fff', borderRadius: 12, boxShadow: '0 6px 20px rgba(15,23,42,0.06)', paddingBottom: 28 }}>
          <h3 style={{ margin: '8px 20px', fontSize: 20 }}>Ajouter une réclamation</h3>
          <form ref={formRef} onSubmit={handleSubmit} style={{ padding: '8px 20px 20px' }}>
            <div style={formStyles}>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="citoyenNom" style={labelStyle}>Nom du citoyen</label>
                <input style={inputStyle} type="text" id="citoyenNom" name="citoyenNom" placeholder="Ex: Dubois" />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="citoyenPrenom" style={labelStyle}>Prenom du citoyen</label>
                <input style={inputStyle} type="text" id="citoyenPrenom" name="citoyenPrenom" placeholder="Ex: Michel" />
              </div>

              <div style={fullWidthStyle}>
                <label htmlFor="contenu" style={labelStyle}>Contenu</label>
                <textarea style={textareaStyle} id="contenu" name="contenu" rows={4} placeholder="Décrire la réclamation"></textarea>
              </div>

              <div>
                <label htmlFor="type" style={labelStyle}>Type</label>
                <select id="type" name="type" style={inputStyle}>
                  <option value="Sanitaire">Sanitaire</option>
                  <option value="Horaire">Horaire</option>
                  <option value="Collecte">Collecte</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div style={{ ...fullWidthStyle, display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="submit" style={btnPrimary} disabled={submitting}>
                  {submitting ? 'Ajout en cours...' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose();
                    else router.back();
                  }}
                  style={btnSecondary}
                  disabled={submitting}
                >
                  Fermer
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
