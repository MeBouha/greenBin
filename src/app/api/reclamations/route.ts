import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const filePath = path.join(process.cwd(), 'public', 'data', 'reclamation.xml');

// ---- Types ----
interface ReclamationDTO {
  id?: number;
  citoyenId?: number;
  citoyenNom?: string;
  citoyen?: string;
  contenu?: string;
  date?: string;
  status?: 'new' | 'in-progress' | 'resolved';
  type?: 'Collecte' | 'Horaire' | 'Sanitaire' | 'Autre';
}

class Reclamation {
  id: number;
  citoyenId: number;
  citoyenNom: string;
  contenu: string;
  date: string;
  status: 'new' | 'in-progress' | 'resolved';
  type: 'Collecte' | 'Horaire' | 'Sanitaire' | 'Autre';

  constructor(data: ReclamationDTO) {
    this.id = Number(data.id ?? 0);
    this.citoyenId = Number(data.citoyenId ?? data.id ?? 0);
    this.citoyenNom = String(
      data.citoyenNom ?? data.citoyen ?? 'Citoyen inconnu'
    );
    this.contenu = String(data.contenu ?? '');
    this.date = data.date ?? new Date().toISOString().split('T')[0];
    this.status = (data.status as any) || 'new';
    this.type = (data.type as any) || 'Autre';
  }

  toXmlObject() {
    const node: any = {
      '@_id': String(this.id),
    };
    
    node.citoyen = {
      '@_id': String(this.citoyenId),
      '#text': this.citoyenNom,
    };
    node.contenu = this.contenu;
    node.date = this.date;
    node.status = this.status;
    node.type = this.type;
    
    return node;
  }
}

class ReclamationService {
  parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', textNodeName: '#text' });
  builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true, suppressEmptyNode: true, textNodeName: '#text' });
  filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async load(): Promise<Reclamation[]> {
    const xml = await fs.readFile(this.filePath, 'utf8');
    const parsed = this.parser.parse(xml) || {};
    const list = parsed?.reclamations?.reclamation ?? [];
    const items = Array.isArray(list) ? list : [list];
    return items
      .filter(Boolean)
      .map((r: any) =>
        new Reclamation({
          id: Number(r['@_id'] ?? 0),
          citoyenId: Number(r.citoyen?.['@_id'] ?? 0),
          citoyenNom: r.citoyen?.['#text'] ?? '',
          contenu: r.contenu ?? '',
          date: r.date ?? '',
          status: r.status,
          type: r.type,
        })
      );
  }

  async save(items: Reclamation[]) {
    const xmlObj = {
      reclamations: {
        '@_xmlns:xs': 'http://www.w3.org/2001/XMLSchema-instance',
        '@_xs:noNamespaceSchemaLocation': 'greenBin.xsd',
        reclamation: items.map((r) => r.toXmlObject()),
      },
    };
    const xmlBody = this.builder.build(xmlObj);
    const xmlWithHeader = `<?xml version="1.0" encoding="UTF-8"?>\n${xmlBody}`;
    await fs.writeFile(this.filePath, xmlWithHeader, 'utf8');
  }

  async getAll() {
    return this.load();
  }

  async add(data: ReclamationDTO) {
    const items = await this.load();
    const nextId = Math.max(0, ...items.map((r) => r.id)) + 1;
    const rec = new Reclamation({ ...data, id: nextId, citoyenId: data.citoyenId ?? nextId });
    items.push(rec);
    await this.save(items);
    return rec;
  }

  async update(data: ReclamationDTO) {
    if (!data.id) throw new Error('Missing id');
    const items = await this.load();
    const idx = items.findIndex((r) => r.id === Number(data.id));
    if (idx === -1) throw new Error('Not found');
    const current = items[idx];
    const updated = new Reclamation({
      id: current.id,
      citoyenId: data.citoyenId ?? current.citoyenId,
      citoyenNom: data.citoyenNom ?? current.citoyenNom,
      contenu: data.contenu ?? current.contenu,
      date: data.date ?? current.date,
      status: data.status ?? current.status,
      type: data.type ?? current.type,
    });
    items[idx] = updated;
    await this.save(items);
    return updated;
  }

  async delete(id: number) {
    const items = await this.load();
    const filtered = items.filter((r) => r.id !== id);
    if (filtered.length === items.length) throw new Error('Not found');
    await this.save(filtered);
  }
}

const service = new ReclamationService(filePath);

// ---- Handlers ----
export async function GET() {
  try {
    const data = await service.getAll();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load reclamations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReclamationDTO;
    if (!body.contenu || !body.citoyenNom) {
      return NextResponse.json({ error: 'contenu and citoyenNom are required' }, { status: 400 });
    }
    const rec = await service.add(body);
    return NextResponse.json(rec, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to add reclamation' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as ReclamationDTO;
    if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    const rec = await service.update(body);
    return NextResponse.json(rec);
  } catch (err: any) {
    if (err?.message === 'Not found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Failed to update reclamation' }, { status: 500 });
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
    if (err?.message === 'Not found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete reclamation' }, { status: 500 });
  }
}
