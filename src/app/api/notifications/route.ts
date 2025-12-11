import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const filePath = path.join(process.cwd(), 'public', 'data', 'notification.xml');

type NotificationStatus = 'new' | 'in-progress' | 'resolved' | string; // status not defined in XSD, keep flexible

interface NotificationDTO {
  id?: number;
  chefTourneeId?: number;
  travailId?: number;
  contenu?: string;
  status?: NotificationStatus;
}

class Notification {
  id: number;
  chefTourneeId: number;
  travailId: number;
  contenu: string;
  status?: NotificationStatus;

  constructor(data: NotificationDTO) {
    this.id = Number(data.id ?? 0);
    this.chefTourneeId = Number(data.chefTourneeId ?? 0);
    this.travailId = Number(data.travailId ?? 0);
    this.contenu = String(data.contenu ?? '');
    this.status = data.status;
  }

  toXml() {
    const node: any = {
      '@_id': String(this.id),
    };
    
    node.chefTournee = { '@_id': String(this.chefTourneeId) };
    node.travail = { '@_id': String(this.travailId) };
    node.contenu = this.contenu;
    
    return node;
  }
}

class NotificationService {
  parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true });
  filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async load(): Promise<Notification[]> {
    const xml = await fs.readFile(this.filePath, 'utf8');
    const parsed = this.parser.parse(xml) || {};
    const list = parsed?.notifications?.notification ?? [];
    const items = Array.isArray(list) ? list : [list];
    return items
      .filter(Boolean)
      .map((n: any) =>
        new Notification({
          id: Number(n['@_id'] ?? 0),
          chefTourneeId: Number(n.chefTournee?.['@_id'] ?? 0),
          travailId: Number(n.travail?.['@_id'] ?? 0),
          contenu: n.contenu ?? '',
        })
      );
  }

  async save(items: Notification[]) {
    const xmlObj = {
      notifications: {
        '@_xmlns:xs': 'http://www.w3.org/2001/XMLSchema-instance',
        '@_xs:noNamespaceSchemaLocation': 'greenBin.xsd',
        notification: items.map((n) => n.toXml()),
      },
    };
    const xmlBody = this.builder.build(xmlObj);
    const xmlWithHeader = `<?xml version="1.0" encoding="UTF-8"?>\n${xmlBody}`;
    await fs.writeFile(this.filePath, xmlWithHeader, 'utf8');
  }

  async getAll() {
    return this.load();
  }

  async add(data: NotificationDTO) {
    const items = await this.load();
    const nextId = data.id ?? Math.max(0, ...items.map((n) => n.id)) + 1;
    if (items.some((n) => n.id === nextId)) {
      throw new Error('Duplicate id');
    }
    const notif = new Notification({ ...data, id: nextId });
    items.push(notif);
    await this.save(items);
    return notif;
  }

  async update(data: NotificationDTO) {
    if (!data.id) throw new Error('Missing id');
    const items = await this.load();
    const idx = items.findIndex((n) => n.id === Number(data.id));
    if (idx === -1) throw new Error('Not found');
    const current = items[idx];
    const updated = new Notification({
      id: current.id,
      chefTourneeId: data.chefTourneeId ?? current.chefTourneeId,
      travailId: data.travailId ?? current.travailId,
      contenu: data.contenu ?? current.contenu,
      status: data.status ?? current.status,
    });
    items[idx] = updated;
    await this.save(items);
    return updated;
  }

  async delete(id: number) {
    const items = await this.load();
    const filtered = items.filter((n) => n.id !== id);
    if (filtered.length === items.length) throw new Error('Not found');
    await this.save(filtered);
  }
}

const service = new NotificationService(filePath);

export async function GET() {
  try {
    const data = await service.getAll();
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /notifications error', err);
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NotificationDTO;
    if (!body.chefTourneeId || !body.travailId || !body.contenu) {
      return NextResponse.json({ error: 'chefTourneeId, travailId, contenu are required' }, { status: 400 });
    }
    const created = await service.add(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    if (err?.message === 'Duplicate id') {
      return NextResponse.json({ error: 'ID already exists' }, { status: 400 });
    }
    console.error('POST /notifications error', err);
    return NextResponse.json({ error: 'Failed to add notification' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as NotificationDTO;
    if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    const updated = await service.update(body);
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err?.message === 'Not found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('PUT /notifications error', err);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
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
    console.error('DELETE /notifications error', err);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
