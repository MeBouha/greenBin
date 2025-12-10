import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const filePath = path.join(process.cwd(), 'public', 'data', 'travaux.xml');
type RawTravail = any;

type Travaux= {
    id: number;
    adresse: string;
    latitude: number;
    longitude: number;
    date: string;
    etat: string;
}

export async function getTravaux(): Promise<Array<Travaux>> {
    const filePath = path.join(process.cwd(), 'public', 'data', 'travaux.xml');
    const xml = await fs.readFile(filePath, 'utf8');

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const parsed = parser.parse(xml);

    const travaux = parsed?.travaux?.travail ?? [];
    const items = Array.isArray(travaux) ? travaux : [travaux];

    const mapped = items.map((t: any) => {
    const id = parseInt(t['@_id'] ?? (t.id as any) ?? '0', 10);
    const adresse = String(t.lieu.adresse );
    const latitude = parseFloat(t.lieu.coordonnees.latitude);
    const longitude = parseFloat(t.lieu.coordonnees.longitude);
    const date = String(t.date );
    const etat = String(t.etat );

    return {
        id, adresse, latitude, longitude, date, etat,
    };
  });
  return mapped;
}

export async function getTravailByString(adr : string): Promise<Array<Travaux>> {
    const filePath = path.join(process.cwd(), 'public', 'data', 'travaux.xml');
     const xml = await fs.readFile(filePath, 'utf8');
    
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const parsed = parser.parse(xml);
    const raw = parsed?.travaux?.travail ?? [];
    const items = Array.isArray(raw) ? raw : [raw];
    
    const filtered = items.map((t: any) => {
        const adresseT =String(t.lieu.adresse);
        // filtrer par adresse
        if (adresseT !== adr) return null;
                const id = parseInt(t['@_id'] ?? (t.id as any) ?? '0', 10);
                const adresse = String(t.lieu.adresse );
                const latitude = parseFloat(t.lieu.coordonnees.latitude);
                const longitude = parseFloat(t.lieu.coordonnees.longitude);
                const date = String(t.date );
                const etat = String(t.etat );
    
        return {
                id: id,
                adresse: adresse,
                latitude: latitude,
                longitude: longitude,
                date: date,
                etat: etat,
          };
        })
        .filter(Boolean) as Array<Travaux>;
    
      return filtered;
    }

export async function GET(){
    try {
        const travaux = await getTravaux();
        return NextResponse.json(travaux, { status: 200 });
    }
    catch(error){
        return NextResponse.json({ error: 'Failed to fetch travaux' }, { status: 500 });
    }
}