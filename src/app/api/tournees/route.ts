import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { getUserById } from '@/app/api/users/route';
import { getVehiculeById } from '@/app/api/vehicules/route';
import { getTrashCansAdresse } from '@/app/api/trashcans/route';

const filePath = path.join(process.cwd(), 'public', 'data', 'tournee.xml');

type RawId = string | number | undefined;

export class Tournee {
  id: number;
  zone: string;
  trashCanIds: number[];
  ouvrierIds: number[];
  vehiculeId: number;
  date: string;

  constructor(data: any) {
    this.id = Number(data.id ?? data['@_id'] ?? 0);
    this.zone = String(data.zone ?? '');

    const trashCansRaw = data.trashCanIds ?? data?.trashCans?.trashCan ?? [];
    const trashCanArray = Array.isArray(trashCansRaw) ? trashCansRaw : [trashCansRaw];
    this.trashCanIds = trashCanArray
      .filter(Boolean)
      .map((t: any) => Number((t as any)?.['@_id'] ?? (t as any)?.id ?? t))
      .filter((n: number) => !Number.isNaN(n));

    const ouvriersRaw = data.ouvrierIds ?? data?.ouvriers?.ouvrier ?? [];
    const ouvriersArray = Array.isArray(ouvriersRaw) ? ouvriersRaw : [ouvriersRaw];
    this.ouvrierIds = ouvriersArray
      .filter(Boolean)
      .map((o: any) => Number((o as any)?.['@_id'] ?? (o as any)?.id ?? o))
      .filter((n: number) => !Number.isNaN(n));

    const vehId: RawId = data.vehiculeId ?? data?.vehicule?.['@_id'] ?? data?.vehicule?.id;
    this.vehiculeId = Number(vehId ?? 0);
    this.date = String(data.date ?? '');
  }

  toXML() {
    const node: any = {
      '@_id': String(this.id),
    };
    
    node.zone = this.zone;
    
    if (this.ouvrierIds.length) {
      node.ouvriers = { ouvrier: this.ouvrierIds.map(id => ({ '@_id': String(id) })) };
    }
    
    node.vehicule = { '@_id': String(this.vehiculeId) };
    node.date = this.date;

    return node;
  }
}

export class Tournees {
  tournees: Tournee[];

  constructor(data: any) {
    const raw = data?.tournees?.tournee ?? [];
    const items = Array.isArray(raw) ? raw : [raw];
    this.tournees = items.filter(Boolean).map((t: any) => new Tournee(t));
  }

  toXML() {
    return { tournee: this.tournees.map(t => t.toXML()) };
  }
}

export class TourneeService {
  filePath: string;
  parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true });

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async load(): Promise<Tournees> {
    const xml = await fs.readFile(this.filePath, 'utf8');
    const parsed = this.parser.parse(xml) || {};
    return new Tournees(parsed);
  }

  async save(tournees: Tournees) {
    const xmlObj = {
      tournees: {
        '@_xmlns:xs': 'http://www.w3.org/2001/XMLSchema-instance',
        '@_xs:noNamespaceSchemaLocation': 'greenBin.xsd',
        ...tournees.toXML(),
      },
    };

    const xmlBody = this.builder.build(xmlObj);
    const xmlWithHeader = `<?xml version="1.0" encoding="UTF-8"?>\n${xmlBody}`;
    await fs.writeFile(this.filePath, xmlWithHeader, 'utf8');
  }

  async getAll(): Promise<Tournee[]> {
    const tournees = await this.load();
    return tournees.tournees;
  }

  async getById(id: number): Promise<Tournee | null> {
    const tournees = await this.load();
    return tournees.tournees.find(t => t.id === id) ?? null;
  }

  async addTournee(tournee: Tournee): Promise<number> {
    const tournees = await this.load();
    const maxId = Math.max(0, ...tournees.tournees.map(t => t.id));
    tournee.id = maxId + 1;
    tournees.tournees.push(tournee);
    await this.save(tournees);
    return tournee.id;
  }

  async updateTournee(tournee: Tournee): Promise<void> {
    const tournees = await this.load();
    const index = tournees.tournees.findIndex(t => t.id === tournee.id);
    if (index < 0) {
      throw new Error('Tournee not found');
    }
    tournees.tournees[index] = tournee;
    await this.save(tournees);
  }

  async delete(id: number): Promise<boolean> {
    const tournees = await this.load();
    const initialLength = tournees.tournees.length;
    tournees.tournees = tournees.tournees.filter(t => t.id !== id);
    if (tournees.tournees.length === initialLength) return false;
    await this.save(tournees);
    return true;
  }

  async affecterEmployes(tourneeId: number, employeIds: number[]): Promise<Tournee | null> {
    const tournees = await this.load();
    const tournee = tournees.tournees.find(t => t.id === tourneeId);
    if (!tournee) return null;
    
    tournee.ouvrierIds = employeIds;
    await this.save(tournees);
    return tournee;
  }

  async affecterVehicule(vehiculeId: number, tourneeId: number): Promise<Tournee | null> {
    const tournees = await this.load();
    const tournee = tournees.tournees.find(t => t.id === tourneeId);
    if (!tournee) return null;
    
    tournee.vehiculeId = vehiculeId;
    await this.save(tournees);
    return tournee;
  }

  async verifyConstraint(tourneeId: number): Promise<boolean> {
    const tournee = await this.getById(tourneeId);
    if (!tournee) return false;
    
    const dateSysteme = new Date();
    const dateTournee = new Date(tournee.date);
    
    // Retourne true si la date système est inférieure à la date de tournée
    return dateSysteme < dateTournee;
  }
}

export const tourneeService = new TourneeService(filePath);

export async function getTournees(): Promise<Tournee[]> {
  return tourneeService.getAll();
}

export async function getTourneeById(id: number): Promise<Tournee | null> {
  return tourneeService.getById(id);
}

function validateTournee(tournee: Tournee, { requireId }: { requireId?: boolean } = {}) {
  if (requireId && !tournee.id) return 'id est requis';
  if (!tournee.date) return 'date est requise';
  if (!tournee.vehiculeId) return 'vehiculeId est requis';
  return null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const enriched = url.searchParams.get('enriched');
    
    // If enriched query param is present, return enriched tournees with joined data
    if (enriched === 'true') {
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
      const xml = await fs.readFile(filePath, 'utf8');
      const parsed = parser.parse(xml);
      const tournees = parsed?.tournees?.tournee ?? [];
      const items = Array.isArray(tournees) ? tournees : [tournees];

      const mapped = await Promise.all(
        items.map(async (t: any) => {
          const id = parseInt(t['@_id'] ?? '0', 10);
          const zone = String(t.zone ?? '');
          const trashCans = await getTrashCansAdresse(zone);

          const ouvArray = t.ouvriers?.ouvrier
            ? Array.isArray(t.ouvriers.ouvrier)
              ? t.ouvriers.ouvrier
              : [t.ouvriers.ouvrier]
            : [];
          const ouvriers = (
            await Promise.all(
              ouvArray.map(async (o: any) => {
                const idOuvrier = parseInt(String(o?.['@_id'] ?? o?.id ?? '0'), 10);
                return await getUserById(idOuvrier);
              })
            )
          ).filter(Boolean);

          let vehicule = null;
          const vehId = t.vehicule?.['@_id'] ? parseInt(t.vehicule['@_id'], 10) : undefined;
          if (vehId) {
            vehicule = await getVehiculeById(vehId);
          }

          let chef = null;
          const chefId = t?.chefTourne?.['@_id'] ? parseInt(t.chefTourne['@_id'], 10) : vehicule?.chauffeurId;
          if (chefId) {
            chef = await getUserById(chefId);
          }

          const date = t?.date ? String(t.date) : undefined;

          return { id, zone, trashCans, ouvriers, vehicule, chef, date };
        })
      );

      return NextResponse.json(mapped);
    }
    
    // Otherwise return standard tournees
    return NextResponse.json(await tourneeService.getAll());
  } catch {
    return NextResponse.json({ error: 'Failed to load tournees' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tournee = new Tournee(body);
    const error = validateTournee(tournee);
    if (error) return NextResponse.json({ error }, { status: 400 });

    if (tournee.id) {
      const existing = await tourneeService.getById(tournee.id);
      if (existing) return NextResponse.json({ error: 'Tournee existe déjà' }, { status: 400 });
    }

    // Create the tournee
    await tourneeService.addTournee(tournee);

    // After creation: set disponibilite = 'en service' for selected ouvriers, the chef (vehicule chauffeur), and the vehicule
    try {
      const ids: number[] = [...(tournee.ouvrierIds || [])];
      const veh = await getVehiculeById(Number(tournee.vehiculeId));
      if (veh?.chauffeurId && !Number.isNaN(veh.chauffeurId)) ids.push(Number(veh.chauffeurId));

      if (ids.length) {
        // Call the users API to batch update disponibilite
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignIds: ids, value: 'en service' }),
        }).catch(() => {});
      }

      // Also mark the vehicule as en service
      if (veh) {
        const vehBody = {
          id: veh.id,
          matricule: veh.matricule,
          chauffeurId: veh.chauffeurId,
          disponibilite: 'en service',
        };
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/vehicules`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehBody),
        }).catch(() => {});
      }
    } catch {
      // non-blocking
    }

    return NextResponse.json(await tourneeService.getAll());
  } catch {
    return NextResponse.json({ error: 'Failed to save tournee' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const tournee = new Tournee(body);
    const error = validateTournee(tournee, { requireId: true });
    if (error) return NextResponse.json({ error }, { status: 400 });

    const exists = await tourneeService.getById(tournee.id);
    if (!exists) return NextResponse.json({ error: 'Tournee non trouvée' }, { status: 404 });

    await tourneeService.updateTournee(tournee);
    return NextResponse.json(await tourneeService.getAll());
  } catch {
    return NextResponse.json({ error: 'Failed to update tournee' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = Number(url.searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'id est requis' }, { status: 400 });

    const deleted = await tourneeService.delete(id);
    if (!deleted) return NextResponse.json({ error: 'Tournee non trouvée' }, { status: 404 });

    return NextResponse.json(await tourneeService.getAll());
  } catch {
    return NextResponse.json({ error: 'Failed to delete tournee' }, { status: 500 });
  }
}
