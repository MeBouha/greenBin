import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

type Status = 'vide' | 'moitie' | 'pleine';
type TypeDechet = 'plastique' | 'verre' | 'papier' | 'autre';

interface TrashCanDTO {
  id?: number | string;
  adresse?: string;
  latitude?: number | string;
  longitude?: number | string;
  typeDechet?: TypeDechet;
  status?: Status;
}

class TrashCan {
  id: number;
  adresse: string;
  latitude: number;
  longitude: number;
  typeDechet: TypeDechet;
  status: Status;

  constructor(data: TrashCanDTO) {
    this.id = Number(data.id ?? 0);
    this.adresse = String(data.adresse ?? '');
    this.latitude = Number(data.latitude ?? 0);
    this.longitude = Number(data.longitude ?? 0);
    this.typeDechet = (data.typeDechet as TypeDechet) ?? 'autre';
    this.status = (data.status as Status) ?? 'vide';
  }

  toXml() {
    return {
      '@_id': String(this.id),
      lieu: {
        adresse: this.adresse,
        coordonnees: {
          latitude: this.latitude,
          longitude: this.longitude,
        },
      },
      typeDechet: this.typeDechet,
      status: this.status,
    };
  }
}

class TrashCanService {
  parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true });
  filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async load(): Promise<TrashCan[]> {
    const xml = await fs.readFile(this.filePath, 'utf8');
    const parsed = this.parser.parse(xml) || {};
    const list = parsed?.trashCans?.trashCan ?? [];
    const items = Array.isArray(list) ? list : [list];
    return items
      .filter(Boolean)
      .map((it: any) =>
        new TrashCan({
          id: it['@_id'] ?? it.id,
          adresse: it.lieu?.adresse,
          latitude: it.lieu?.coordonnees?.latitude,
          longitude: it.lieu?.coordonnees?.longitude,
          typeDechet: it.typeDechet,
          status: it.status,
        })
      );
  }

  async save(items: TrashCan[]) {
    const xmlObj = {
      trashCans: {
        '@_xmlns:xs': 'http://www.w3.org/2001/XMLSchema-instance',
        '@_xs:noNamespaceSchemaLocation': 'greenBin.xsd',
        trashCan: items.map((t) => t.toXml()),
      },
    };
    const xmlBody = this.builder.build(xmlObj);
    const xmlWithHeader = `<?xml version="1.0" encoding="UTF-8"?>\n${xmlBody}`;
    await fs.writeFile(this.filePath, xmlWithHeader, 'utf8');
  }

  async getAll() {
    return this.load();
  }

  async add(data: TrashCanDTO) {
    const items = await this.load();
    const nextId = data.id !== undefined ? Number(data.id) : Math.max(0, ...items.map((t) => t.id)) + 1;
    if (items.some((t) => t.id === nextId)) throw new Error('Duplicate id');
    const tc = new TrashCan({ ...data, id: nextId });
    items.push(tc);
    await this.save(items);
    return tc;
  }

  async update(data: TrashCanDTO) {
    if (data.id === undefined) throw new Error('Missing id');
    const items = await this.load();
    const idx = items.findIndex((t) => t.id === Number(data.id));
    if (idx === -1) throw new Error('Not found');
    const current = items[idx];
    const updated = new TrashCan({
      id: current.id,
      adresse: data.adresse ?? current.adresse,
      latitude: data.latitude ?? current.latitude,
      longitude: data.longitude ?? current.longitude,
      typeDechet: (data.typeDechet as TypeDechet) ?? current.typeDechet,
      status: (data.status as Status) ?? current.status,
    });
    items[idx] = updated;
    await this.save(items);
    return updated;
  }

  async updateStatus(id: number, status: Status) {
    const items = await this.load();
    const idx = items.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Not found');
    const current = items[idx];
    const updated = new TrashCan({
      id: current.id,
      adresse: current.adresse,
      latitude: current.latitude,
      longitude: current.longitude,
      typeDechet: current.typeDechet,
      status,
    });
    items[idx] = updated;
    await this.save(items);
    return updated;
  }

  async delete(id: number) {
    const items = await this.load();
    const filtered = items.filter((t) => t.id !== id);
    if (filtered.length === items.length) throw new Error('Not found');
    await this.save(filtered);
  }
}

const filePath = path.join(process.cwd(), 'public', 'data', 'trashCan.xml');
const service = new TrashCanService(filePath);

// Helpers kept for existing imports
export async function getTrashCans() {
  return service.getAll();
}

export async function getTrashCansAdresse(adresse: string) {
  const list = await service.getAll();
  return list.filter((t) => t.adresse.toLowerCase() === adresse.toLowerCase());
}

export async function setTrashcanStatus(id: number, status: Status) {
  return service.updateStatus(id, status);
}

// Handlers
export async function GET() {
  try {
    const data = await service.getAll();
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /trashcans error', err);
    return NextResponse.json({ error: 'Failed to load trash cans' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = Number(url.searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    await service.delete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.message === 'Not found') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    console.error('DELETE /trashcans error', err);
    return NextResponse.json({ error: 'Failed to delete trash can' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TrashCanDTO;
    if (!body.adresse || body.latitude === undefined || body.longitude === undefined || !body.typeDechet || !body.status) {
      return NextResponse.json({ error: 'adresse, latitude, longitude, typeDechet, status are required' }, { status: 400 });
    }
    const created = await service.add(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    if (err?.message === 'Duplicate id') return NextResponse.json({ error: 'ID already exists' }, { status: 400 });
    console.error('POST /trashcans error', err);
    return NextResponse.json({ error: 'Failed to add trash can' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as TrashCanDTO;
    if (body.id === undefined) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    const updated = await service.update(body);
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err?.message === 'Not found') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    console.error('PUT /trashcans error', err);
    return NextResponse.json({ error: 'Failed to update trash can' }, { status: 500 });
  }
}

