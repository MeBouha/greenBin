import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

const filePath = path.join(process.cwd(), 'public', 'data', 'rapport.xml');

/**
 * Save a report payload to `public/data/rapport.xml` by inserting a new <rapport> element.
 * Expects body to contain at least: { idTournee?, vehicule?, date?, chef?, presentEmployees: string[], absentEmployees: string[], selectedTrashcans: number[] }
 */
async function saveReportXml(body: any) {
  const dataDir = path.join(process.cwd(), 'public', 'data');
  const filePathLocal = path.join(dataDir, 'rapport.xml');

  await fs.mkdir(dataDir, { recursive: true });

  let xml = '';
  try {
    xml = await fs.readFile(filePathLocal, 'utf8');
  } catch (err) {
    // if file doesn't exist, create a base structure
    xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rapports>\n</rapports>\n`;
  }

  // find next id
  const idMatches = Array.from(xml.matchAll(/<rapport\s+id="(\d+)"/g)).map(m => Number(m[1]));
  const nextId = (idMatches.length ? Math.max(...idMatches) : 0) + 1;

  const date = body?.date || new Date().toISOString().slice(0, 10);
  const tourneeId = body?.idTournee || '';

  // chef
  const chef = body?.chef || null;
  const chefIdAttr = chef?.id ? ` id="${chef.id}"` : '';

  // employees: present and absent
  const present: string[] = Array.isArray(body?.presentEmployees) ? body.presentEmployees : [];
  const absent: string[] = Array.isArray(body?.absentEmployees) ? body.absentEmployees : [];

  // selected trashcans
  const trashIds: number[] = Array.isArray(body?.selectedTrashcans) ? body.selectedTrashcans.map((v: any) => Number(v)) : [];

  // helper to try to lookup user details from users.xml
  async function lookupUserByName(name: string) {
    const usersPath = path.join(process.cwd(), 'public', 'data', 'users.xml');
    try {
      const raw = await fs.readFile(usersPath, 'utf8');
      // parse user blocks and match by id attribute, login, nom or prenom
      const userMatches = Array.from(raw.matchAll(/<user[^>]*id="(\d+)"[^>]*>[\s\S]*?<login>(.*?)<\/login>[\s\S]*?<nom>(.*?)<\/nom>[\s\S]*?<prenom>(.*?)<\/prenom>[\s\S]*?<\/user>/g));
      for (const m of userMatches) {
        const id = m[1].trim();
        const login = (m[2] || '').trim();
        const nom = (m[3] || '').trim();
        const prenom = (m[4] || '').trim();
        if (String(id) === String(name)) return { id, nom, prenom };
        if ([login, nom, prenom].some(s => s && s.toLowerCase() === name.toLowerCase())) {
          return { id, nom, prenom };
        }
      }
    } catch (err) {
      // ignore
    }
    return null;
  }

  // build employees xml
  let employeesXml = '';
  employeesXml += `        <employees>\n`;
  if (chef && chef?.id) {
    // Always emit only the id as attribute for chefTourne
    employeesXml += `            <chefTourne${chefIdAttr}/>\n`;
  } else {
    employeesXml += `            <chefTourne/>\n`;
  }

  employeesXml += `            <ouvriers>\n`;

  for (const name of present) {
    const u = await lookupUserByName(name).catch(()=>null);
    const idAttr = u?.id ? ` id="${escapeXmlInternal(String(u.id))}"` : '';
    const nom = u?.nom || name;
    const prenom = u?.prenom || '';
    employeesXml += `                <ouvrier${idAttr}>\n`;
    employeesXml += `                    <nom>${escapeXmlInternal(String(nom))}</nom>\n`;
    employeesXml += `                    <prenom>${escapeXmlInternal(String(prenom))}</prenom>\n`;
    employeesXml += `                    <status>present</status>\n`;
    employeesXml += `                </ouvrier>\n`;
  }

  for (const name of absent) {
    const u = await lookupUserByName(name).catch(()=>null);
    const idAttr = u?.id ? ` id="${escapeXmlInternal(String(u.id))}"` : '';
    const nom = u?.nom || name;
    const prenom = u?.prenom || '';
    employeesXml += `                <ouvrier${idAttr}>\n`;
    employeesXml += `                    <nom>${escapeXmlInternal(String(nom))}</nom>\n`;
    employeesXml += `                    <prenom>${escapeXmlInternal(String(prenom))}</prenom>\n`;
    employeesXml += `                    <status>absent</status>\n`;
    employeesXml += `                </ouvrier>\n`;
  }

  employeesXml += `            </ouvriers>\n`;
  employeesXml += `        </employees>\n`;

  // build dechetsCollecte
  // selectedTrashcans may be an array of numbers or objects { id, quantite }
  let dechetsXml = `        <dechetsCollecte>\n`;
  const rawTrash = Array.isArray(body?.selectedTrashcans) ? body.selectedTrashcans : [];
  for (const item of rawTrash) {
    let id: number | null = null;
    let quantite: number | null = null;
    if (typeof item === 'number') {
      id = Number(item);
      quantite = 0;
    } else if (item && typeof item === 'object') {
      id = Number(item.id);
      quantite = item.quantite != null ? Number(item.quantite) : 0;
    }
    if (!isNaN(Number(id))) {
      const q = isNaN(Number(quantite)) ? 0 : Number(quantite);
      dechetsXml += `            <trashCan id="${id}" quantite="${q}"/>\n`;
    }
  }
  dechetsXml += `        </dechetsCollecte>\n`;

  // assemble rapport block
  const rapportBlock = [
    `    <rapport id="${nextId}"> <!-- id: key -->`,
    `        <date>${escapeXmlInternal(String(date))}</date>`,
    tourneeId ? `        <tournee id="${escapeXmlInternal(String(tourneeId))}"/>` : `        <tournee/>`,
    employeesXml.trimEnd(),
    dechetsXml.trimEnd(),
    `    </rapport>\n`,
  ].join('\n') + '\n';

  // insert before closing </rapports>
  const closingTag = /<\/rapports>\s*$/i;
  let newXml = '';
  if (closingTag.test(xml)) {
    newXml = xml.replace(closingTag, rapportBlock + '</rapports>\n');
  } else {
    newXml = xml + '\n' + rapportBlock + '</rapports>\n';
  }

  await fs.writeFile(filePathLocal, newXml, 'utf8');

  return { message: 'Rapport enregistré', id: nextId };
}

function escapeXmlInternal(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

interface RapportPayload {
  idTournee: number | string;
  vehicule: string;
  date: string;
  chef: any;
  presentEmployees: string[];
  absentEmployees: string[];
  selectedTrashcans: Array<{ id: number; quantite: number }>;
  kilometrage: number;
  co2Emis: number;
  carburantConsomme: number;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format');
    
    // If format=detailed, return parsed rapports
    if (format === 'detailed') {
      const xml = await fs.readFile(filePath, 'utf8');
      const rapports: any[] = [];
      const rapportMatches = xml.match(/<rapport[^>]*>[\s\S]*?<\/rapport>/g) || [];

      for (const rapportXml of rapportMatches) {
        const id = extractAttr(rapportXml, 'id');
        const date = extractText(rapportXml, 'date');
        const tourneeId = extractAttr(rapportXml.match(/<tournee[^>]*>/)?.[0] || '', 'id');
        const kilometrage = parseFloat(extractText(rapportXml, 'kilometrage'));
        const co2Emis = parseFloat(extractText(rapportXml, 'co2Emis'));
        const carburantConsomme = parseFloat(extractText(rapportXml, 'carburantConsomme'));

        const ouvrierMatches = rapportXml.match(/<ouvrier[^>]*>[\s\S]*?<\/ouvrier>/g) || [];
        const presentEmployees: any[] = [];
        const absentEmployees: any[] = [];

        for (const ouvrierXml of ouvrierMatches) {
          const ouvrId = extractAttr(ouvrierXml, 'id');
          const nom = extractText(ouvrierXml, 'nom');
          const prenom = extractText(ouvrierXml, 'prenom');
          const status = extractText(ouvrierXml, 'status');

          const ouvrier = { id: ouvrId ? parseInt(ouvrId) : undefined, nom, prenom, status };
          if (status === 'present') {
            presentEmployees.push(ouvrier);
          } else {
            absentEmployees.push(ouvrier);
          }
        }

        const bennes = (rapportXml.match(/<trashCan[^>]*>/g) || []).map(b => ({
          id: parseInt(extractAttr(b, 'id')),
          quantite: parseInt(extractAttr(b, 'quantite')),
        }));

        rapports.push({
          id: parseInt(id),
          date,
          tourneeId: parseInt(tourneeId) || parseInt(id),
          chef: null,
          presentEmployees,
          absentEmployees,
          selectedTrashcans: bennes,
          kilometrage,
          co2Emis,
          carburantConsomme,
        });
      }

      return NextResponse.json(rapports);
    }
    
    // Otherwise return raw XML data
    const xml = await fs.readFile(filePath, 'utf8');
    return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
  } catch (err: any) {
    console.error('GET /api/rapports error', err);
    return NextResponse.json({ error: 'Failed to load rapports' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as RapportPayload;
    
    // Check if this is a complex rapport creation (has presentEmployees, etc.)
    if (body.presentEmployees || body.selectedTrashcans) {
      // Use legacy creation logic for complex rapports
      if (!body.idTournee || !body.date) {
        return NextResponse.json({ error: 'Missing required fields: idTournee, date' }, { status: 400 });
      }

      let rapportsContent = '';
      let maxId = 0;

      try {
        rapportsContent = await fs.readFile(filePath, 'utf8');
        const idMatches = rapportsContent.match(/rapport id="(\d+)"/g);
        if (idMatches) {
          maxId = Math.max(...idMatches.map(m => parseInt(m.match(/\d+/)![0])));
        }
      } catch {
        // File doesn't exist
      }

      const newId = maxId + 1;

      const presentXml = (body.presentEmployees || [])
        .map((name, idx) => {
          const parts = name.split(' ');
          const prenom = parts[0] || '';
          const nom = parts.slice(1).join(' ') || '-';
          return `<ouvrier id="${idx + 1}">\n                    <nom>${escapeXml(nom)}</nom>\n                    <prenom>${escapeXml(prenom)}</prenom>\n                    <status>present</status>\n                </ouvrier>`;
        })
        .join('\n                ');
      
      const absentXml = (body.absentEmployees || [])
        .map((name, idx) => {
          const parts = name.split(' ');
          const prenom = parts[0] || '';
          const nom = parts.slice(1).join(' ') || '-';
          return `<ouvrier id="${100 + idx + 1}">\n                    <nom>${escapeXml(nom)}</nom>\n                    <prenom>${escapeXml(prenom)}</prenom>\n                    <status>absent</status>\n                </ouvrier>`;
        })
        .join('\n                ');

      const allOuvrierXml = presentXml + (presentXml && absentXml ? '\n                ' : '') + absentXml;

      const trashcansXml = (body.selectedTrashcans || [])
        .map(tc => `<trashCan id="${tc.id}" quantite="${tc.quantite}"/>`)
        .join('\n            ');

      const newRapportXml = `
    <rapport id="${newId}">
        <date>${body.date}</date>
        <tournee id="${body.idTournee}"/>
        <employees>
            <chefTourne id="${body.chef?.id || 0}"/>
            <ouvriers>
                ${allOuvrierXml}
            </ouvriers>
        </employees>
        <dechetsCollecte>
            ${trashcansXml}
        </dechetsCollecte>
        <kilometrage>${Number(body.kilometrage).toFixed(2)}</kilometrage>
        <co2Emis>${Number(body.co2Emis).toFixed(2)}</co2Emis>
        <carburantConsomme>${Number(body.carburantConsomme).toFixed(2)}</carburantConsomme>
    </rapport>`;

      let updatedXml = rapportsContent;
      if (updatedXml.includes('</rapports>')) {
        updatedXml = updatedXml.replace('</rapports>', `${newRapportXml}\n</rapports>`);
      } else {
        updatedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rapports xmlns:xs="http://www.w3.org/2001/XMLSchema-instance"
           xs:noNamespaceSchemaLocation="greenBin.xsd">${newRapportXml}
</rapports>`;
      }

      await fs.writeFile(filePath, updatedXml, 'utf8');
      return NextResponse.json({ message: 'Rapport créé avec succès', id: newId });
    }
    
    // Otherwise use the standard server-side helper
    const result = await saveReportXml(body);
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('/api/rapports POST error', err);
    return new Response(JSON.stringify({ error: err?.message || 'Erreur serveur' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

async function deleteRapport(id: number): Promise<{ success: boolean }> {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true });

  const xml = await fs.readFile(filePath, 'utf8');
  const parsed = parser.parse(xml) || {};
  const raw = parsed?.rapports?.rapport ?? [];
  const items = Array.isArray(raw) ? raw : [raw];

  const remaining = items.filter((r: any) => Number(r?.['@_id'] ?? r?.id) !== id);
  if (remaining.length === items.length) return { success: false };

  const xmlObj = {
    rapports: {
      '@_xmlns:xs': 'http://www.w3.org/2001/XMLSchema-instance',
      '@_xs:noNamespaceSchemaLocation': 'greenBin.xsd',
      rapport: remaining,
    },
  };

  const xmlBody = builder.build(xmlObj);
  const xmlWithHeader = `<?xml version="1.0" encoding="UTF-8"?>\n${xmlBody}`;
  await fs.writeFile(filePath, xmlWithHeader, 'utf8');
  return { success: true };
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = Number(url.searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'id est requis' }, { status: 400 });

    const { success } = await deleteRapport(id);
    if (!success) return NextResponse.json({ error: 'Rapport non trouvé' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('/api/rapports DELETE error', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export { deleteRapport };

function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function extractAttr(xml: string, attr: string): string {
  const match = xml.match(new RegExp(`${attr}="([^"]*)"`));
  return match ? match[1] : '';
}

function extractText(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>([^<]*)<\/${tag}>`));
  return match ? match[1] : '';
}
