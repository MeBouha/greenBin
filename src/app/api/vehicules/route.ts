import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

const filePath = path.join(process.cwd(), 'public', 'data', 'vehicule.xml');

export class Vehicule {
  id: number;
  matricule: string;
  chauffeurId?: number;
  disponibilite: string;

  constructor(data: any) {
    this.id = Number(data.id ?? data['@_id'] ?? 0);
    this.matricule = String(data.matricule ?? '');
    const rawChauffeur = data.chauffeurId ?? data?.chauffeur?.['@_id'] ?? data?.chauffeur?.id;
    this.chauffeurId = rawChauffeur !== undefined ? Number(rawChauffeur) : undefined;
    this.disponibilite = String(data.disponibilite ?? '');
  }

  toXML() {
    const node: any = {
      '@_id': String(this.id),
      matricule: this.matricule,
    };

    if (this.chauffeurId !== undefined) {
      node.chauffeur = { '@_id': String(this.chauffeurId) };
    }

    node.disponibilite = this.disponibilite;

    return node;
  }
}

export class Vehicules {
  vehicules: Vehicule[];

  constructor(data: any) {
    const raw = data?.vehicules?.vehicule ?? [];
    const items = Array.isArray(raw) ? raw : [raw];
    this.vehicules = items.filter(Boolean).map((v: any) => new Vehicule(v));
  }

  toXML() {
    return { vehicule: this.vehicules.map(v => v.toXML()) };
  }
}

export class VehiculeService {
  filePath: string;
  parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true });

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async load(): Promise<Vehicules> {
    const xml = await fs.readFile(this.filePath, 'utf8');
    const parsed = this.parser.parse(xml) || {};
    return new Vehicules(parsed);
  }

  async save(vehicules: Vehicules) {
    const xmlObj = {
      vehicules: {
        '@_xmlns:xs': 'http://www.w3.org/2001/XMLSchema-instance',
        '@_xs:noNamespaceSchemaLocation': 'greenBin.xsd',
        ...vehicules.toXML(),
      },
    };

    const xmlBody = this.builder.build(xmlObj);
    const xmlWithHeader = `<?xml version="1.0" encoding="UTF-8"?>\n${xmlBody}`;
    await fs.writeFile(this.filePath, xmlWithHeader, 'utf8');
  }

  async getAll(): Promise<Vehicule[]> {
    const vehicules = await this.load();
    return vehicules.vehicules;
  }

  async getById(id: number): Promise<Vehicule | null> {
    const vehicules = await this.load();
    return vehicules.vehicules.find(v => v.id === id) ?? null;
  }

  async addOrUpdate(vehicule: Vehicule): Promise<number> {
    const vehicules = await this.load();
    if (!vehicule.id || vehicule.id <= 0) {
      const maxId = Math.max(0, ...vehicules.vehicules.map(v => v.id));
      vehicule.id = maxId + 1;
    }

    const index = vehicules.vehicules.findIndex(v => v.id === vehicule.id);
    if (index >= 0) {
      vehicules.vehicules[index] = vehicule;
    } else {
      vehicules.vehicules.push(vehicule);
    }

    await this.save(vehicules);
    return vehicule.id;
  }

  async delete(id: number): Promise<boolean> {
    const vehicules = await this.load();
    const initialLength = vehicules.vehicules.length;
    vehicules.vehicules = vehicules.vehicules.filter(v => v.id !== id);
    if (vehicules.vehicules.length === initialLength) return false;
    await this.save(vehicules);
    return true;
  }
}

export const vehiculeService = new VehiculeService(filePath);

export async function getVehicules(): Promise<Vehicule[]> {
  return vehiculeService.getAll();
}

export async function getVehiculeById(id: number): Promise<Vehicule | null> {
  return vehiculeService.getById(id);
}

function validateMatricule(matricule?: string) {
  if (!matricule) return 'Matricule est requis';
  const matriculeRegex = /^[0-9]{3}TUN[0-9]{4}$/;
  if (!matriculeRegex.test(matricule)) return 'Format matricule invalide (ex: 123TUN1234)';
  return null;
}

export async function GET() {
  try {
    const data = await vehiculeService.getAll();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to load vehicules' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const error = validateMatricule(body?.matricule);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const vehicule = new Vehicule(body);
    if (!vehicule.chauffeurId || !vehicule.disponibilite) {
      return NextResponse.json({ error: 'chauffeurId et disponibilite sont requis' }, { status: 400 });
    }

    await vehiculeService.addOrUpdate(vehicule);
    return NextResponse.json(await vehiculeService.getAll());
  } catch {
    return NextResponse.json({ error: 'Failed to save vehicule' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const vehicule = new Vehicule(body);
    if (!vehicule.id) return NextResponse.json({ error: 'id est requis' }, { status: 400 });
    const error = validateMatricule(vehicule.matricule);
    if (error) return NextResponse.json({ error }, { status: 400 });
    if (!vehicule.chauffeurId || !vehicule.disponibilite) {
      return NextResponse.json({ error: 'chauffeurId et disponibilite sont requis' }, { status: 400 });
    }

    const exists = await vehiculeService.getById(vehicule.id);
    if (!exists) return NextResponse.json({ error: 'Vehicule non trouvé' }, { status: 404 });

    await vehiculeService.addOrUpdate(vehicule);
    return NextResponse.json(await vehiculeService.getAll());
  } catch {
    return NextResponse.json({ error: 'Failed to update vehicule' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = Number(url.searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'id est requis' }, { status: 400 });

    const deleted = await vehiculeService.delete(id);
    if (!deleted) return NextResponse.json({ error: 'Vehicule non trouvé' }, { status: 404 });

    return NextResponse.json(await vehiculeService.getAll());
  } catch {
    return NextResponse.json({ error: 'Failed to delete vehicule' }, { status: 500 });
  }
}
