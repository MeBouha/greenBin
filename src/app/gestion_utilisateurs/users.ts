import fs from 'fs/promises';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

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
        id,
        nom,
        prenom,
        role,
        login,
        password,
    };
  });

  return mapped;
}
