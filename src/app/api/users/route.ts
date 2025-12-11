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
  compte: Compte;
  nom: string;
  prenom: string;
  role: string;

  constructor(data: any) {
    // accept id coming from body or from xml attribute
    this.id = Number(data.id ?? data['@_id'] ?? 0);
    this.nom = String(data.nom ?? '');
    this.prenom = String(data.prenom ?? '');
    this.compte = new Compte(data.compte ?? {});
    this.role = String(data.role ?? '');
  }

  toXML(): any {
    return {
      '@_id': String(this.id),
      compte: {
        login: this.compte.login,
        password: this.compte.password,
        etat: this.compte.etat,
      },
      nom: this.nom,
      prenom: this.prenom,
      role: this.role,
    };
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

  async addOrUpdate(user: User) {
    const users = await this.load();
    const index = users.users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      // update existing user - use modifierCompte for compte changes
      const existingUser = users.users[index];
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
      users.users[index] = user;
    } else {
      // add new user - use addCompte to create compte
      user.id = Math.max(0, ...users.users.map(u => u.id)) + 1; // new ID
      user.compte = await this.addCompte(user.compte.login, user.compte.password);
      users.users.push(user);
    }
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
    user.compte.login = login;
    user.compte.password = password;
    await this.save(users);
    return user;
  }

  async activerCompte(id: number) {
    const users = await this.load();
    const user = users.users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
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
      if (user && user.compte.etat === 'actif') {
        disponibles.push(user);
      } else {
        indisponibles.push(empId);
      }
    }

    return { disponibles, indisponibles };
  }
}

// === Exported helper function ===
export async function getUserById(id: number): Promise<User | null> {
  const service = new UserService(filePath);
  return service.getById(id);
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
    await service.addOrUpdate(user);
    return NextResponse.json(await service.getAll());
  } catch {
    return NextResponse.json({ error: 'Failed to save user' }, { status: 500 });
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
