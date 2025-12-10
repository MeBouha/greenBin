import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const filePath = path.join(process.cwd(), 'public', 'data', 'users.xml');
type RawUser = any;

export async function getUsers(): Promise<Array<{ id: number; nom: string; prenom: string; role: string; login: string; password: string;}>> {
    const filePath = path.join(process.cwd(), 'public', 'data', 'users.xml');
    const xml = await fs.readFile(filePath, 'utf8');

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const parsed = parser.parse(xml);

    const users = parsed?.users?.user ?? [];
    const items = Array.isArray(users) ? users : [users];

    const mapped = items.map((u: any) => {
    const id = parseInt(u['@_id'] ?? (u.id as any) ?? '0', 10);
    const nom = String(u.nom );
    const prenom = String(u.prenom );
    const role = String(u.role );
    const login = String(u.login );
    const password = String(u.password );

    return {
        id, nom, prenom, role, login, password,
    };
  });
  return mapped;
}

export async function getUserById(id: number): Promise<
  Array<{ id: number; nom: string; prenom: string; role: string; login: string; password: string;}>> {
    const filePath = path.join(process.cwd(), 'public', 'data', 'users.xml');
  const xml = await fs.readFile(filePath, 'utf8');

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const parsed = parser.parse(xml) as { users?: { user?: RawUser } };
  const raw = parsed?.users?.user ?? [];
  const items = Array.isArray(raw) ? raw : [raw];

  const filtered = items.map((u: any) => {
      const idUser =parseInt(u['@_id']);
      // filtrer par adresse
      if (idUser !== id) return null;
          const nom = String(u.nom );
          const prenom = String(u.prenom );
          const role = String(u.role );
          const login = String(u.login );
          const password = String(u.password );

      return {
        id: idUser,
        nom: nom,
        prenom: prenom,
        role: role,
        login: login,
        password: password,
      };
    })
    .filter(Boolean) as Array<{ id: number; nom: string; prenom: string; role: string; login: string; password: string }>; // supprime les nulls

  return filtered;
}

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
