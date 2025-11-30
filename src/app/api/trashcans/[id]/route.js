import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseString, Builder } from 'xml2js';

// DELETE method
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    console.log('🔴 DELETE API Called - TrashCan ID:', id);
    
    if (!id) {
      return NextResponse.json({ error: 'TrashCan ID is required' }, { status: 400 });
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
        
        if (!result.trashCans || !result.trashCans.trashCan) {
          console.error('❌ No trash cans found in XML');
          resolve(NextResponse.json({ error: 'No trash cans found in XML' }, { status: 404 }));
          return;
        }

        const originalTrashCans = result.trashCans.trashCan;
        console.log(`📋 Found ${originalTrashCans.length} trash cans`);

        const filteredTrashCans = originalTrashCans.filter(trashCan => trashCan.$.id !== id);

        console.log(`📊 After filter: ${filteredTrashCans.length} trash cans remain`);

        if (filteredTrashCans.length === originalTrashCans.length) {
          console.error(`❌ TrashCan ${id} not found in XML`);
          resolve(NextResponse.json({ error: `TrashCan ${id} not found` }, { status: 404 }));
          return;
        }

        result.trashCans.trashCan = filteredTrashCans;

        const builder = new Builder();
        const updatedXml = builder.buildObject(result);

        fs.writeFile(xmlPath, updatedXml, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('❌ Error writing XML file:', writeErr);
            resolve(NextResponse.json({ error: 'Cannot update XML file' }, { status: 500 }));
            return;
          }

          console.log('✅ TrashCan deleted successfully:', id);
          resolve(NextResponse.json({
            success: true,
            message: 'TrashCan deleted successfully',
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
    
    console.log('🟡 PUT API Called - Update TrashCan ID:', id);
    console.log('📝 Updated data:', updatedData);
    
    if (!id) {
      return NextResponse.json({ error: 'TrashCan ID is required' }, { status: 400 });
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
        
        if (!result.trashCans || !result.trashCans.trashCan) {
          console.error('❌ No trash cans found in XML');
          resolve(NextResponse.json({ error: 'No trash cans found in XML' }, { status: 404 }));
          return;
        }

        const trashCans = result.trashCans.trashCan;
        console.log(`📋 Found ${trashCans.length} trash cans`);

        const trashCanToUpdate = trashCans.find(trashCan => trashCan.$.id === id);
        
        if (!trashCanToUpdate) {
          console.error(`❌ TrashCan ${id} not found in XML`);
          resolve(NextResponse.json({ error: `TrashCan ${id} not found` }, { status: 404 }));
          return;
        }

        console.log('🔍 Found trash can to update:', trashCanToUpdate);

        // Update the trash can data
        trashCanToUpdate.lieu[0].adresse[0] = updatedData.adresse;
        trashCanToUpdate.lieu[0].coordonnees[0].latitude[0] = updatedData.latitude;
        trashCanToUpdate.lieu[0].coordonnees[0].longitude[0] = updatedData.longitude;
        trashCanToUpdate.typeDechet[0] = updatedData.typeDechet;
        trashCanToUpdate.status[0] = updatedData.status;

        console.log('✅ Trash can data updated');

        const builder = new Builder();
        const updatedXml = builder.buildObject(result);

        fs.writeFile(xmlPath, updatedXml, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('❌ Error writing XML file:', writeErr);
            resolve(NextResponse.json({ error: 'Cannot update XML file' }, { status: 500 }));
            return;
          }

          console.log('✅ TrashCan updated successfully:', id);
          resolve(NextResponse.json({
            success: true,
            message: 'TrashCan updated successfully',
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