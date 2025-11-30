import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseString, Builder } from 'xml2js';

// POST method for adding new trash can
export async function POST(request) {
  try {
    const newData = await request.json();
    
    console.log('🟢 POST API Called - Add new trash can');
    console.log('📝 New data:', newData);
    
    if (!newData.id || !newData.adresse || !newData.latitude || !newData.longitude || !newData.typeDechet || !newData.status) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const xmlPath = path.join(process.cwd(), 'public', 'data', 'trashcan.xml');
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
        
        // Check if trashCans exist, create if not
        if (!result.trashCans) {
          result.trashCans = { trashCan: [] };
        }
        
        if (!result.trashCans.trashCan) {
          result.trashCans.trashCan = [];
        }

        const trashCans = result.trashCans.trashCan;
        console.log(`📋 Found ${trashCans.length} trash cans`);

        // Check if ID already exists
        const existingTrashCan = trashCans.find(trashCan => trashCan.$.id === newData.id);
        if (existingTrashCan) {
          console.error(`❌ TrashCan with ID ${newData.id} already exists`);
          resolve(NextResponse.json({ error: `TrashCan with ID ${newData.id} already exists` }, { status: 400 }));
          return;
        }

        // Create new trashCan object
        const newTrashCan = {
          $: { id: newData.id },
          lieu: [{
            adresse: [newData.adresse],
            coordonnees: [{
              latitude: [newData.latitude],
              longitude: [newData.longitude]
            }]
          }],
          typeDechet: [newData.typeDechet],
          status: [newData.status]
        };

        // Add new trash can
        trashCans.push(newTrashCan);

        console.log('✅ New trash can added to array');

        const builder = new Builder();
        const updatedXml = builder.buildObject(result);

        fs.writeFile(xmlPath, updatedXml, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('❌ Error writing XML file:', writeErr);
            resolve(NextResponse.json({ error: 'Cannot update XML file' }, { status: 500 }));
            return;
          }

          console.log('✅ TrashCan added successfully:', newData.id);
          resolve(NextResponse.json({
            success: true,
            message: 'TrashCan added successfully',
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