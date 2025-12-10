import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { getUserById } from '@/app/api/users/route';
import { getVehiculeById } from '@/app/api/vehicules/route';
import { getTrashCansAdresse } from '@/app/api/trashcans/route';

type User = { id: number; nom: string; prenom: string; role: string; login: string; password: string };
type Vehicule = { id: number; matricule?: string; chauffeurId?: number; disponibilite?: string };
type TrashCan = { id: number; adresse: string; lat: number; lng: number; status: string };

export async function getTournees(): Promise<
  Array<{
    id: number;
    zone: string;
    trashCans: TrashCan[];
    ouvriers: User[];
    vehicule: Vehicule | null;
    chef: User | null;
    date?: string;
  }>
> {
  const filePath = path.join(process.cwd(), 'public', 'data', 'tournee.xml');
  const xml = await fs.readFile(filePath, 'utf8');

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const parsed = parser.parse(xml);
  const tournees = parsed?.tournees?.tournee ?? [];
  const items = Array.isArray(tournees) ? tournees : [tournees];

  const mapped = await Promise.all(
    items.map(async (t: any) => {
      const id = parseInt(t['@_id'] ?? '0', 10);

      const zone = String(t.zone ?? '');

      // 🔹 TrashCans
      const adresse = String(t.zone ?? '');
      const trashCans = await getTrashCansAdresse(adresse);

      // 🔹 Ouvriers
      const ouvArray = t.ouvriers?.ouvrier
        ? Array.isArray(t.ouvriers.ouvrier)
          ? t.ouvriers.ouvrier
          : [t.ouvriers.ouvrier]
        : [];
      const ouvriers: User[] = (
        await Promise.all(
          ouvArray.map(async (o: any) => {
            const idOuvrier = parseInt(String(o?.['@_id'] ?? o?.id ?? '0'), 10);
            const user = await getUserById(idOuvrier); // retourne User[]
            return user?.[0] ?? null;
          })
        )
      ).filter(Boolean);

      // 🔹 Véhicule
      let vehicule: Vehicule | null = null;
      const vehId = t.vehicule?.['@_id'] ? parseInt(t.vehicule['@_id'], 10) : undefined;
      if (vehId) {
        const vehArray = await getVehiculeById(vehId);
        vehicule = vehArray?.[0] ?? null;
      }

      // 🔹 Chef
      let chef: User | null = null;
      const chefId = t?.chefTourne?.['@_id'] ? parseInt(t.chefTourne['@_id'], 10) : vehicule?.chauffeurId;
      if (chefId) {
        const chefUser = await getUserById(chefId);
        chef = chefUser?.[0] ?? null;
      }

      // 🔹 Date
      const date = t?.date ? String(t.date) : undefined;

      return {
        id,
        zone,
        trashCans,
        ouvriers,
        vehicule,
        chef,
        date,
      };
    })
  );

  return mapped;
}

export async function GET() {
  try {
    const data = await getTournees();
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /api/tournee error', err);
    return NextResponse.json({ error: 'Failed to load tournees' }, { status: 500 });
  }
}
