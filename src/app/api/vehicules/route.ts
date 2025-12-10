import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

export async function getVehicules(): Promise<Array<{ id: number; matricule?: string; chauffeurId?: number; disponibilite?: string }>> {
  const filePath = path.join(process.cwd(), 'public', 'data', 'vehicule.xml');
  const xml = await fs.readFile(filePath, 'utf8');
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const parsed = parser.parse(xml);
  const vehicules = parsed?.vehicules?.vehicule ?? [];
  const items = Array.isArray(vehicules) ? vehicules : [vehicules];

  return items.map((v: any) => {
    const id = parseInt(v['@_id'] ?? '0', 10);
    const matricule = v?.matricule ? String(v.matricule) : undefined;
    const disponibilite = v?.disponibilite ? String(v.disponibilite) : undefined;
    const chauffeurId = v?.chauffeur?.['@_id'] ? parseInt(v.chauffeur['@_id'], 10) : undefined;
    return { id, matricule, chauffeurId, disponibilite };
  });
}

export async function getVehiculeById(id: number): Promise<
  Array<{ id: number; matricule?: string; chauffeurId?: number; disponibilite?: string }>> {
  const filePath = path.join(process.cwd(), 'public', 'data', 'vehicule.xml');
  const xml = await fs.readFile(filePath, 'utf8');

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const parsed = parser.parse(xml);
  const vehicules = parsed?.vehicules?.vehicule ?? [];
  const items = Array.isArray(vehicules) ? vehicules : [vehicules];

  const filtered = items.map((v: any) => {
      const idVehicule =parseInt(v['@_id']);
      // filtrer par adresse
      if (idVehicule !== id) return null;
          const matricule = String(v.matricule );
          const chauffeurId = parseInt(v.chauffeur['@_id'], 10);
          const disponibilite = String(v.disponibilite);
      return {
        id: idVehicule,
        matricule: matricule,
        chauffeurId: chauffeurId,
        disponibilite: disponibilite,
      };
    })
    .filter(Boolean) as Array<{ id: number; matricule?: string; chauffeurId?: number; disponibilite?: string }>; // supprime les nulls

  return filtered;
}

export async function GET() {
  try {
    const data = await getVehicules();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load vehicules' }, { status: 500 });
  }
}
