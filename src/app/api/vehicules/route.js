import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseString, Builder } from 'xml2js';

// POST method for adding new vehicle
export async function POST(request) {
  try {
    const newData = await request.json();
    
    console.log('🟢 POST API Called - Add new vehicle');
    console.log('📝 New data:', newData);
    
    if (!newData.id || !newData.matricule || !newData.chauffeurId || !newData.disponibilite) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate matricule format
    const matriculeRegex = /^[0-9]{3}TUN[0-9]{4}$/;
    if (!matriculeRegex.test(newData.matricule)) {
      return NextResponse.json({ error: 'Invalid matricule format. Expected: 123TUN1234' }, { status: 400 });
    }

    const xmlPath = path.join(process.cwd(), 'public', 'data', 'vehicule.xml');
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
        
        // Check if vehicules exist, create if not
        if (!result.vehicules) {
          result.vehicules = { vehicule: [] };
        }
        
        if (!result.vehicules.vehicule) {
          result.vehicules.vehicule = [];
        }

        const vehicules = result.vehicules.vehicule;
        console.log(`📋 Found ${vehicules.length} vehicules`);

        // Check if ID already exists
        const existingVehicule = vehicules.find(vehicule => vehicule.$.id === newData.id);
        if (existingVehicule) {
          console.error(`❌ Vehicule with ID ${newData.id} already exists`);
          resolve(NextResponse.json({ error: `Vehicule with ID ${newData.id} already exists` }, { status: 400 }));
          return;
        }

        // Create new vehicule object
        const newVehicule = {
          $: { id: newData.id },
          matricule: [newData.matricule],
          chauffeur: [{ $: { id: newData.chauffeurId } }],
          disponibilite: [newData.disponibilite]
        };

        // Add new vehicule
        vehicules.push(newVehicule);

        console.log('✅ New vehicule added to array');

        const builder = new Builder();
        const updatedXml = builder.buildObject(result);

        fs.writeFile(xmlPath, updatedXml, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('❌ Error writing XML file:', writeErr);
            resolve(NextResponse.json({ error: 'Cannot update XML file' }, { status: 500 }));
            return;
          }

          console.log('✅ Vehicule added successfully:', newData.id);
          resolve(NextResponse.json({
            success: true,
            message: 'Vehicule added successfully',
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