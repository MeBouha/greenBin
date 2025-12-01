import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { getUsers } from '@/app/gestion_utilisateurs/users';

const filePath = path.join(process.cwd(), 'public', 'data', 'users.xml');

export async function GET() {
  try {
    const data = await getUsers();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body) return NextResponse.json({ error: 'No body' }, { status: 400 });

    const xml = await fs.readFile(filePath, 'utf8');
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const parsed = parser.parse(xml) || {};

    let usersNode: any = parsed?.users ?? {};
    const rootAttrs: any = {};
    // preserve root attributes like xmlns if present
    Object.keys(usersNode).forEach(k => {
      if (k.startsWith('@_')) rootAttrs[k] = usersNode[k];
    });

    let items = usersNode.user ?? [];
    if (!Array.isArray(items)) items = [items].filter(Boolean);

    const incomingId = Number(body.id) || 0;

    if (incomingId > 0) {
      // update existing
      let found = false;
      items = items.map((u: any) => {
        const uid = Number(u['@_id'] ?? u.id ?? 0);
        if (uid === incomingId) {
          found = true;
          return {
            '@_id': String(incomingId),
            login: body.login || '',
            password: body.password || '',
            nom: body.nom || '',
            prenom: body.prenom || '',
            role: body.role || '',
          };
        }
        return u;
      });
      if (!found) {
        // add as new
        items.push({
          '@_id': String(incomingId),
          login: body.login || '',
          password: body.password || '',
          nom: body.nom || '',
          prenom: body.prenom || '',
          role: body.role || '',
        });
      }
    } else {
      // create new id
      const maxId = items.reduce((m: number, u: any) => Math.max(m, Number(u['@_id'] ?? u.id ?? 0)), 0);
      const newId = maxId + 1;
      items.push({
        '@_id': String(newId),
        login: body.login || '',
        password: body.password || '',
        nom: body.nom || '',
        prenom: body.prenom || '',
        role: body.role || '',
      });
    }

    // rebuild object
    const builderObj: any = { users: {} };
    // reattach preserved root attrs
    Object.keys(rootAttrs).forEach(k => (builderObj.users[k] = rootAttrs[k]));
    builderObj.users.user = items;

    const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true });
    const newXml = builder.build(builderObj);
    await fs.writeFile(filePath, newXml, 'utf8');

    const data = await getUsers();
    return NextResponse.json(data);
  } catch (err) {
    console.error('PUT /api/users error', err);
    return NextResponse.json({ error: 'Failed to save user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const xml = await fs.readFile(filePath, 'utf8');
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const parsed = parser.parse(xml) || {};

    let items = parsed?.users?.user ?? [];
    if (!Array.isArray(items)) items = [items].filter(Boolean);

    const newItems = items.filter((u: any) => String(u['@_id'] ?? u.id ?? '') !== String(id));

    const builderObj: any = { users: {} };
    builderObj.users.user = newItems;
    const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true });
    const newXml = builder.build(builderObj);
    await fs.writeFile(filePath, newXml, 'utf8');

    const data = await getUsers();
    return NextResponse.json(data);
  } catch (err) {
    console.error('DELETE /api/users error', err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
