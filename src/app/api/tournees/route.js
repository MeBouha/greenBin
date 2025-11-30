import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseString, Builder } from 'xml2js';

// POST method for adding new tournee
export async function POST(request) {
  try {
    const newData = await request.json();
    
    console.log('🟢 POST API Called - Add new tournee');
    console.log('📝 New data:', newData);
    
    if (!newData.id || !newData.date || !newData.vehiculeId) {
      return NextResponse.json({ error: 'ID, date and vehiculeId are required' }, { status: 400 });
    }

    const xmlPath = path.join(process.cwd(), 'public', 'data', 'tournee.xml');
    console.log('📁 XML Path:', xmlPath);

    if (!fs.existsSync(xmlPath)) {
      console.error('❌ XML file not found');
      return NextResponse.json({ error: 'XML file not found' }, { status: 404 });
    }

    const xmlData = fs.readFileSync(xmlPath, 'utf8');
    console.log('📄 XML file read successfully');

    return new Promise((resolve) => {
      parseString(xmlData, (parseErr, result) => {
        if (parseErr) {
          console.error('❌ XML Parse Error:', parseErr);
          resolve(NextResponse.json({ error: 'Cannot parse XML' }, { status: 500 }));
          return;
        }

        console.log('📊 XML parsed successfully');
        
        // Check if tournees exist, create if not
        if (!result.tournees) {
          result.tournees = { tournee: [] };
        }
        
        if (!result.tournees.tournee) {
          result.tournees.tournee = [];
        }

        const tournees = result.tournees.tournee;
        console.log(`📋 Found ${tournees.length} tournees`);

        // Check if ID already exists
        const existingTournee = tournees.find(tournee => tournee.$.id === newData.id);
        if (existingTournee) {
          console.error(`❌ Tournee with ID ${newData.id} already exists`);
          resolve(NextResponse.json({ error: `Tournee with ID ${newData.id} already exists` }, { status: 400 }));
          return;
        }

        // Create trashCans array
        const trashCans = newData.trashCanIds ? newData.trashCanIds.map(id => ({ $: { id: id } })) : [];

        // Create ouvriers array
        const ouvriers = newData.ouvrierIds ? newData.ouvrierIds.map(id => ({ $: { id: id } })) : [];

        // Create new tournee object
        const newTournee = {
          $: { id: newData.id },
          trashCans: [{ trashCan: trashCans }],
          ouvriers: [{ ouvrier: ouvriers }],
          vehicule: [{ $: { id: newData.vehiculeId } }],
          date: [newData.date]
        };

        // Add new tournee
        tournees.push(newTournee);

        console.log('✅ New tournee added to array');

        const builder = new Builder();
        const updatedXml = builder.buildObject(result);

        fs.writeFile(xmlPath, updatedXml, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('❌ Error writing XML file:', writeErr);
            resolve(NextResponse.json({ error: 'Cannot update XML file' }, { status: 500 }));
            return;
          }

          console.log('✅ Tournee added successfully:', newData.id);
          resolve(NextResponse.json({
            success: true,
            message: 'Tournee added successfully',
            addedId: newData.id
          }));
        });
      });
    });

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}