import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

const filePath = path.join(process.cwd(), 'public', 'data', 'travaux.xml');

export class Travail {
    id: number;
    adresse: string;
    latitude: number;
    longitude: number;
    date: string;
    etat: string;

    constructor(data: any) {
        this.id = Number(data.id ?? data['@_id'] ?? 0);
        this.adresse = String(data.adresse ?? data.lieu?.adresse ?? data.lieu ?? '');
        this.latitude = Number(data.latitude ?? data.lieu?.coordonnees?.latitude ?? 0);
        this.longitude = Number(data.longitude ?? data.lieu?.coordonnees?.longitude ?? 0);
        this.date = String(data.date ?? '');
        this.etat = String(data.etat ?? '');
    }

    toXML() {
        return {
            '@_id': String(this.id),
            date: this.date,
            lieu: {
                adresse: this.adresse,
                coordonnees: {
                    latitude: this.latitude,
                    longitude: this.longitude,
                },
            },
            etat: this.etat,
        };
    }
}

export class Travaux {
    travaux: Travail[];

    constructor(data: any) {
        const raw = data?.travaux?.travail ?? [];
        const items = Array.isArray(raw) ? raw : [raw];
        this.travaux = items.filter(Boolean).map((t: any) => new Travail(t));
    }

    toXML() {
        return { travail: this.travaux.map(t => t.toXML()) };
    }
}

export class TravauxService {
    filePath: string;
    parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true });

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    async load(): Promise<Travaux> {
        const xml = await fs.readFile(this.filePath, 'utf8');
        const parsed = this.parser.parse(xml) || {};
        return new Travaux(parsed);
    }

    async save(travaux: Travaux) {
        const xmlObj = {
            travaux: {
                '@_xmlns:xs': 'http://www.w3.org/2001/XMLSchema-instance',
                '@_xs:noNamespaceSchemaLocation': 'greenBin.xsd',
                ...travaux.toXML(),
            },
        };

        const xmlBody = this.builder.build(xmlObj);
        const xmlWithHeader = `<?xml version="1.0" encoding="UTF-8"?>\n${xmlBody}`;
        await fs.writeFile(this.filePath, xmlWithHeader, 'utf8');
    }

    async getAll(): Promise<Travail[]> {
        const travaux = await this.load();
        return travaux.travaux;
    }

    async getByAdresse(adresse: string): Promise<Travail[]> {
        const travaux = await this.load();
        return travaux.travaux.filter(t => t.adresse === adresse);
    }

    async addOrUpdate(travail: Travail): Promise<number> {
        const travaux = await this.load();
        if (!travail.id || travail.id <= 0) {
            const maxId = Math.max(0, ...travaux.travaux.map(t => t.id));
            travail.id = maxId + 1;
        }

        const index = travaux.travaux.findIndex(t => t.id === travail.id);
        if (index >= 0) {
            travaux.travaux[index] = travail;
        } else {
            travaux.travaux.push(travail);
        }

        await this.save(travaux);
        return travail.id;
    }

    async delete(id: number): Promise<boolean> {
        const travaux = await this.load();
        const initialLength = travaux.travaux.length;
        travaux.travaux = travaux.travaux.filter(t => t.id !== id);
        if (travaux.travaux.length === initialLength) return false;
        await this.save(travaux);
        return true;
    }
}

export const travauxService = new TravauxService(filePath);

export async function getTravaux(): Promise<Travail[]> {
    return travauxService.getAll();
}

export async function getTravailByString(adresse: string): Promise<Travail[]> {
    return travauxService.getByAdresse(adresse);
}

function validateTravail(travail: Travail, { requireId }: { requireId?: boolean } = {}) {
    if (requireId && !travail.id) return 'id est requis';
    if (!travail.adresse) return 'adresse est requise';
    if (Number.isNaN(travail.latitude) || Number.isNaN(travail.longitude)) return 'coordonnées invalides';
    if (!travail.date) return 'date est requise';
    if (!travail.etat) return 'etat est requis';
    return null;
}

export async function GET() {
    try {
        const travaux = await travauxService.getAll();
        return NextResponse.json(travaux, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch travaux' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const travail = new Travail(body);
        const error = validateTravail(travail);
        if (error) return NextResponse.json({ error }, { status: 400 });

        await travauxService.addOrUpdate(travail);
        return NextResponse.json(await travauxService.getAll());
    } catch {
        return NextResponse.json({ error: 'Failed to add travail' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const travail = new Travail(body);
        const error = validateTravail(travail, { requireId: true });
        if (error) return NextResponse.json({ error }, { status: 400 });

        const exists = (await travauxService.getAll()).some(t => t.id === travail.id);
        if (!exists) return NextResponse.json({ error: 'Travail non trouvé' }, { status: 404 });

        await travauxService.addOrUpdate(travail);
        return NextResponse.json(await travauxService.getAll());
    } catch {
        return NextResponse.json({ error: 'Failed to update travail' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = Number(url.searchParams.get('id'));
        if (!id) return NextResponse.json({ error: 'id est requis' }, { status: 400 });

        const deleted = await travauxService.delete(id);
        if (!deleted) return NextResponse.json({ error: 'Travail non trouvé' }, { status: 404 });

        return NextResponse.json(await travauxService.getAll());
    } catch {
        return NextResponse.json({ error: 'Failed to delete travail' }, { status: 500 });
    }
}