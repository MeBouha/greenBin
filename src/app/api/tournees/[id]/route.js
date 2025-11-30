import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseString, Builder } from 'xml2js';

// DELETE method
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    console.log('🔴 DELETE API Called - Tournee ID:', id);
    
    if (!id) {
      return NextResponse.json({ error: 'Tournee ID is required' }, { status: 400 });
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
        
        if (!result.tournees || !result.tournees.tournee) {
          console.error('❌ No tournees found in XML');
          resolve(NextResponse.json({ error: 'No tournees found in XML' }, { status: 404 }));
          return;
        }

        const originalTournees = result.tournees.tournee;
        console.log(`📋 Found ${originalTournees.length} tournees`);

        const filteredTournees = originalTournees.filter(tournee => tournee.$.id !== id);

        console.log(`📊 After filter: ${filteredTournees.length} tournees remain`);

        if (filteredTournees.length === originalTournees.length) {
          console.error(`❌ Tournee ${id} not found in XML`);
          resolve(NextResponse.json({ error: `Tournee ${id} not found` }, { status: 404 }));
          return;
        }

        result.tournees.tournee = filteredTournees;

        const builder = new Builder();
        const updatedXml = builder.buildObject(result);

        fs.writeFile(xmlPath, updatedXml, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('❌ Error writing XML file:', writeErr);
            resolve(NextResponse.json({ error: 'Cannot update XML file' }, { status: 500 }));
            return;
          }

          console.log('✅ Tournee deleted successfully:', id);
          resolve(NextResponse.json({
            success: true,
            message: 'Tournee deleted successfully',
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
    
    console.log('🟡 PUT API Called - Update Tournee ID:', id);
    console.log('📝 Updated data:', updatedData);
    
    if (!id) {
      return NextResponse.json({ error: 'Tournee ID is required' }, { status: 400 });
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
        
        if (!result.tournees || !result.tournees.tournee) {
          console.error('❌ No tournees found in XML');
          resolve(NextResponse.json({ error: 'No tournees found in XML' }, { status: 404 }));
          return;
        }

        const tournees = result.tournees.tournee;
        console.log(`📋 Found ${tournees.length} tournees`);

        const tourneeToUpdate = tournees.find(tournee => tournee.$.id === id);
        
        if (!tourneeToUpdate) {
          console.error(`❌ Tournee ${id} not found in XML`);
          resolve(NextResponse.json({ error: `Tournee ${id} not found` }, { status: 404 }));
          return;
        }

        console.log('🔍 Found tournee to update:', tourneeToUpdate);

        // Update the tournee data
        tourneeToUpdate.date[0] = updatedData.date;
        tourneeToUpdate.vehicule[0].$.id = updatedData.vehiculeId;

        // Update trash cans
        const trashCans = updatedData.trashCanIds ? updatedData.trashCanIds.map(trashId => ({ $: { id: trashId } })) : [];
        tourneeToUpdate.trashCans[0].trashCan = trashCans;

        // Update ouvriers
        const ouvriers = updatedData.ouvrierIds ? updatedData.ouvrierIds.map(ouvrierId => ({ $: { id: ouvrierId } })) : [];
        tourneeToUpdate.ouvriers[0].ouvrier = ouvriers;

        console.log('✅ Tournee data updated');

        const builder = new Builder();
        const updatedXml = builder.buildObject(result);

        fs.writeFile(xmlPath, updatedXml, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('❌ Error writing XML file:', writeErr);
            resolve(NextResponse.json({ error: 'Cannot update XML file' }, { status: 500 }));
            return;
          }

          console.log('✅ Tournee updated successfully:', id);
          resolve(NextResponse.json({
            success: true,
            message: 'Tournee updated successfully',
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