import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const filePath = path.join(process.cwd(), 'public', 'data', 'users.xml');

// === Définition des classes (comme JAXB) ===

export class Compte {
  login: string;
  password: string;
  etat: string; // actif, bloqué
  constructor(data: any) {
    this.login = String(data.login ?? '');
    this.password = String(data.password ?? '');
    this.etat = String(data.etat ?? 'actif');
  }
}

export class User {
  id: number;
  compte?: Compte;
  nom: string;
  prenom: string;
  role: string;
  disponibilite?: string;

  constructor(data: any) {
    // accept id coming from body or from xml attribute
    this.id = Number(data.id ?? data['@_id'] ?? 0);
    this.nom = String(data.nom ?? '');
    this.prenom = String(data.prenom ?? '');
    // Only create compte if data.compte exists
    if (data.compte) {
      this.compte = new Compte(data.compte);
    }
    this.role = String(data.role ?? '');
    // Include disponibilite if present
    if (data.disponibilite) {
      this.disponibilite = String(data.disponibilite);
    }
    // Ignore any extra fields
  }

  toXML(): any {
    const result: any = {
      '@_id': String(this.id),
      nom: this.nom,
      prenom: this.prenom,
      role: this.role,
    };
    
    // Only include compte in XML if it exists and has non-empty data
    if (this.compte && (this.compte.login || this.compte.password)) {
      result.compte = {
        login: this.compte.login,
        password: this.compte.password,
        etat: this.compte.etat || 'actif', // Ensure etat is always present
      };
    }
    
    // Always include disponibilite in the proper order (after compte)
    if (this.disponibilite) {
      result.disponibilite = this.disponibilite;
    }
    
    return result;
  }
}

export class Users {
  users: User[];

  constructor(data: any) {
    const rawUsers = data?.users?.user ?? [];
    const items = Array.isArray(rawUsers) ? rawUsers : [rawUsers];
    this.users = items.map(u => new User(u));
  }

  toXML(): any {
    return { user: this.users.map(u => u.toXML()) };
  }
}

// === Service XML (analogue à JAXBContext/Marshaller/Unmarshaller) ===
export class UserService {
  filePath: string;
  parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true });

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async load(): Promise<Users> {
    const xml = await fs.readFile(this.filePath, 'utf8');
    const parsed = this.parser.parse(xml) || {};
    return new Users(parsed);
  }

  async save(users: Users) {
    const xmlObj = { 
      users: {
        '@_xmlns:xs': 'http://www.w3.org/2001/XMLSchema-instance',
        '@_xs:noNamespaceSchemaLocation': 'greenBin.xsd',
        ...users.toXML()
      }
    };
    const xmlBody = this.builder.build(xmlObj);
    const xmlWithHeader = `<?xml version="1.0" encoding="UTF-8"?>\n${xmlBody}`;
    await fs.writeFile(this.filePath, xmlWithHeader, 'utf8');
  }

  async getAll(): Promise<User[]> {
    const users = await this.load();
    return users.users;
  }

  async getById(id: number): Promise<User | null> {
    const users = await this.load();
    return users.users.find(u => u.id === id) ?? null;
  }

  async addUser(user: User): Promise<number> {
    const users = await this.load();
    // add new user
    user.id = Math.max(0, ...users.users.map(u => u.id)) + 1; // new ID
    
    // If role != 'citoyen', set disponibilite to 'disponible' by default
    if (user.role !== 'citoyen') {
      user.disponibilite = 'disponible';
    }
    
    // Only create compte if login and password are provided
    if (user.compte?.login && user.compte?.password) {
      user.compte = new Compte({
        login: user.compte.login,
        password: user.compte.password,
        etat: 'actif'
      });
    } else {
      // No compte if login/password not provided
      user.compte = undefined;
    }
    
    users.users.push(user);
    await this.save(users);
    return user.id;
  }

  async updateUser(user: User): Promise<void> {
    const users = await this.load();
    const index = users.users.findIndex(u => u.id === user.id);
    if (index < 0) {
      throw new Error('User not found');
    }
    
    // update existing user - use modifierCompte for compte changes
    const existingUser = users.users[index];
    
    // Preserve disponibilite from existing user if not provided
    if (!user.disponibilite && existingUser.disponibilite) {
      user.disponibilite = existingUser.disponibilite;
    }
    
    if (user.compte && existingUser.compte) {
      if (user.compte.login !== existingUser.compte.login || 
          user.compte.password !== existingUser.compte.password) {
        await this.modifierCompte(user.id, user.compte.login, user.compte.password);
        user.compte.etat = existingUser.compte.etat; // preserve etat
      }
      // use activerCompte if etat is being set to 'actif'
      if (user.compte.etat === 'actif' && existingUser.compte.etat !== 'actif') {
        await this.activerCompte(user.id);
      } else {
        user.compte.etat = existingUser.compte.etat;
      }
    }
    users.users[index] = user;
    await this.save(users);
  }

  async delete(id: number) {
    const users = await this.load();
    users.users = users.users.filter(u => u.id !== id);
    await this.save(users);
  }

  async addCompte(login: string, password: string): Promise<Compte> {
    const newCompte = new Compte({
      login,
      password,
      etat: 'actif'
    });
    return newCompte;
  }

  async modifierCompte(id: number, login: string, password: string) {
    const users = await this.load();
    const user = users.users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    if (!user.compte) throw new Error('User has no compte');
    user.compte.login = login;
    user.compte.password = password;
    await this.save(users);
    return user;
  }
    
  async activerCompte(id: number) {
    const users = await this.load();
    const user = users.users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    if (!user.compte) throw new Error('User has no compte');
    user.compte.etat = 'actif';
    await this.save(users);
    return user;
  }

  async verifierDisponibilite(employes: number[]): Promise<{ disponibles: User[], indisponibles: number[] }> {
    const users = await this.load();
    const disponibles: User[] = [];
    const indisponibles: number[] = [];

    for (const empId of employes) {
      const user = users.users.find(u => u.id === empId);
      // Un utilisateur est disponible si:
      // - il n'a pas de compte (disponible par défaut)
      // - ou son compte a l'état 'actif'
      if (user && (!user.compte || user.compte.etat === 'actif')) {
        disponibles.push(user);
      } else {
        indisponibles.push(empId);
      }
    }

    return { disponibles, indisponibles };
  }

  async setDisponibilite(ids: number[], value: string) {
    const users = await this.load();
    const idSet = new Set(ids.map(Number));
    users.users = users.users.map(u => {
      if (idSet.has(Number(u.id))) {
        u.disponibilite = value;
      }
      return u;
    });
    await this.save(users);
    return users.users.filter(u => idSet.has(Number(u.id)));
  }
}

// === Exported helper function ===
export async function getUserById(id: number): Promise<User | null> {
  const service = new UserService(filePath);
  return service.getById(id);
}

// Helper to lookup a user by id or matching login/nom/prenom (for cross-route usage)
export async function lookupUserByName(name: string) {
  try {
    const xml = await fs.readFile(filePath, 'utf8');
    const matches = Array.from(xml.matchAll(/<user[^>]*id="(\d+)"[^>]*>[\s\S]*?<login>(.*?)<\/login>[\s\S]*?<nom>(.*?)<\/nom>[\s\S]*?<prenom>(.*?)<\/prenom>[\s\S]*?<\/user>/g));
    for (const m of matches) {
      const id = m[1].trim();
      const login = (m[2] || '').trim();
      const nom = (m[3] || '').trim();
      const prenom = (m[4] || '').trim();
      if (String(id) === String(name)) return { id, nom, prenom };
      if ([login, nom, prenom].some((s) => s && s.toLowerCase() === name.toLowerCase())) {
        return { id, nom, prenom };
      }
    }
  } catch {
    // ignore and fall through
  }
  return null;
}

// === API Next.js ===
const service = new UserService(filePath);

export async function GET() {
  try {
    const data = await service.getAll();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body) return NextResponse.json({ error: 'No body' }, { status: 400 });
    const user = new User(body);
    
    // Check if user exists
    const existingUser = await service.getById(user.id);
    if (existingUser) {
      await service.updateUser(user);
    } else {
      await service.addUser(user);
    }
    
    return NextResponse.json(await service.getAll());
  } catch {
    return NextResponse.json({ error: 'Failed to save user' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body) return NextResponse.json({ error: 'No body' }, { status: 400 });
    // Special action: assign employees -> set disponibilite to 'en service'
    if (Array.isArray(body.assignIds)) {
      const ids = body.assignIds.map((x: any) => Number(x)).filter((n: number) => !isNaN(n));
      const updated = await service.setDisponibilite(ids, body.value ?? 'en service');
      return NextResponse.json({ updated });
    }
    const user = new User(body);
    await service.addUser(user);
    return NextResponse.json(await service.getAll());
  } catch (err) {
    console.error('POST /api/users error:', err);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = Number(url.searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await service.delete(id);
    return NextResponse.json(await service.getAll());
  } catch {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}