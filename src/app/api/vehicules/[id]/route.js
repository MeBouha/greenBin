import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseString, Builder } from 'xml2js';

// DELETE method
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    console.log('🔴 DELETE API Called - Vehicule ID:', id);
    
    if (!id) {
      return NextResponse.json({ error: 'Vehicule ID is required' }, { status: 400 });
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
        
        if (!result.vehicules || !result.vehicules.vehicule) {
          console.error('❌ No vehicules found in XML');
          resolve(NextResponse.json({ error: 'No vehicules found in XML' }, { status: 404 }));
          return;
        }

        const originalVehicules = result.vehicules.vehicule;
        console.log(`📋 Found ${originalVehicules.length} vehicules`);

        const filteredVehicules = originalVehicules.filter(vehicule => vehicule.$.id !== id);

        console.log(`📊 After filter: ${filteredVehicules.length} vehicules remain`);

        if (filteredVehicules.length === originalVehicules.length) {
          console.error(`❌ Vehicule ${id} not found in XML`);
          resolve(NextResponse.json({ error: `Vehicule ${id} not found` }, { status: 404 }));
          return;
        }

        result.vehicules.vehicule = filteredVehicules;

        const builder = new Builder();
        const updatedXml = builder.buildObject(result);

        fs.writeFile(xmlPath, updatedXml, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('❌ Error writing XML file:', writeErr);
            resolve(NextResponse.json({ error: 'Cannot update XML file' }, { status: 500 }));
            return;
          }

          console.log('✅ Vehicule deleted successfully:', id);
          resolve(NextResponse.json({
            success: true,
            message: 'Vehicule deleted successfully',
            deletedId: id
          }));
        });
      });
    });

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT method for updating
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const updatedData = await request.json();
    
    console.log('🟡 PUT API Called - Update Vehicule ID:', id);
    console.log('📝 Updated data:', updatedData);
    
    if (!id) {
      return NextResponse.json({ error: 'Vehicule ID is required' }, { status: 400 });
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
        
        if (!result.vehicules || !result.vehicules.vehicule) {
          console.error('❌ No vehicules found in XML');
          resolve(NextResponse.json({ error: 'No vehicules found in XML' }, { status: 404 }));
          return;
        }

        const vehicules = result.vehicules.vehicule;
        console.log(`📋 Found ${vehicules.length} vehicules`);

        const vehiculeToUpdate = vehicules.find(vehicule => vehicule.$.id === id);
        
        if (!vehiculeToUpdate) {
          console.error(`❌ Vehicule ${id} not found in XML`);
          resolve(NextResponse.json({ error: `Vehicule ${id} not found` }, { status: 404 }));
          return;
        }

        console.log('🔍 Found vehicule to update:', vehiculeToUpdate);

        // Update the vehicule data
        vehiculeToUpdate.matricule[0] = updatedData.matricule;
        vehiculeToUpdate.chauffeur[0].$.id = updatedData.chauffeurId;
        vehiculeToUpdate.disponibilite[0] = updatedData.disponibilite;

        console.log('✅ Vehicule data updated');

        const builder = new Builder();
        const updatedXml = builder.buildObject(result);

        fs.writeFile(xmlPath, updatedXml, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('❌ Error writing XML file:', writeErr);
            resolve(NextResponse.json({ error: 'Cannot update XML file' }, { status: 500 }));
            return;
          }

          console.log('✅ Vehicule updated successfully:', id);
          resolve(NextResponse.json({
            success: true,
            message: 'Vehicule updated successfully',
            updatedId: id
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
      'Access-Control-Allow-Methods': 'DELETE, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}