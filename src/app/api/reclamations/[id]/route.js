import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseString, Builder } from 'xml2js';

// DELETE method for deleting a reclamation
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    console.log('🔴 DELETE API Called - Reclamation ID:', id);
    
    if (!id) {
      return NextResponse.json({ error: 'Reclamation ID is required' }, { status: 400 });
    }

    const xmlPath = path.join(process.cwd(), 'public', 'data', 'reclamation.xml');
    console.log('📁 XML Path:', xmlPath);

    // Check if XML file exists
    if (!fs.existsSync(xmlPath)) {
      console.error('❌ XML file not found');
      return NextResponse.json({ error: 'Reclamation XML file not found' }, { status: 404 });
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
        
        // Check if reclamations exist in XML
        if (!result.reclamations || !result.reclamations.reclamation) {
          console.error('❌ No reclamations found in XML');
          resolve(NextResponse.json({ error: 'No reclamations found in XML' }, { status: 404 }));
          return;
        }

        const originalReclamations = result.reclamations.reclamation;
        console.log(`📋 Found ${originalReclamations.length} reclamations`);

        // Filter out the reclamation to delete
        const filteredReclamations = originalReclamations.filter(reclamation => reclamation.$.id !== id);

        console.log(`📊 After filter: ${filteredReclamations.length} reclamations remain`);

        // Check if reclamation was found
        if (filteredReclamations.length === originalReclamations.length) {
          console.error(`❌ Reclamation ${id} not found in XML`);
          resolve(NextResponse.json({ error: `Reclamation ${id} not found` }, { status: 404 }));
          return;
        }

        // Update the XML structure
        result.reclamations.reclamation = filteredReclamations;

        // Build the updated XML
        const builder = new Builder();
        const updatedXml = builder.buildObject(result);

        // Write the updated XML back to file
        fs.writeFile(xmlPath, updatedXml, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('❌ Error writing XML file:', writeErr);
            resolve(NextResponse.json({ error: 'Cannot update XML file' }, { status: 500 }));
            return;
          }

          console.log('✅ Reclamation deleted successfully:', id);
          resolve(NextResponse.json({
            success: true,
            message: 'Reclamation deleted successfully',
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

// PUT method for updating a reclamation (mark as resolved)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    console.log('🟡 PUT API Called - Update Reclamation ID:', id);
    
    if (!id) {
      return NextResponse.json({ error: 'Reclamation ID is required' }, { status: 400 });
    }

    const xmlPath = path.join(process.cwd(), 'public', 'data', 'reclamation.xml');
    console.log('📁 XML Path:', xmlPath);

    // Check if XML file exists
    if (!fs.existsSync(xmlPath)) {
      console.error('❌ XML file not found');
      return NextResponse.json({ error: 'Reclamation XML file not found' }, { status: 404 });
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
        
        // Check if reclamations exist in XML
        if (!result.reclamations || !result.reclamations.reclamation) {
          console.error('❌ No reclamations found in XML');
          resolve(NextResponse.json({ error: 'No reclamations found in XML' }, { status: 404 }));
          return;
        }

        const reclamations = result.reclamations.reclamation;
        console.log(`📋 Found ${reclamations.length} reclamations`);

        // Find the reclamation to update
        const reclamationToUpdate = reclamations.find(reclamation => reclamation.$.id === id);
        
        if (!reclamationToUpdate) {
          console.error(`❌ Reclamation ${id} not found in XML`);
          resolve(NextResponse.json({ error: `Reclamation ${id} not found` }, { status: 404 }));
          return;
        }

        console.log('🔍 Found reclamation to update:', reclamationToUpdate);

        // Update the status to "resolved"
        reclamationToUpdate.status[0] = 'resolved';

        console.log('✅ Reclamation status updated to resolved');

        // Build the updated XML
        const builder = new Builder();
        const updatedXml = builder.buildObject(result);

        // Write the updated XML back to file
        fs.writeFile(xmlPath, updatedXml, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('❌ Error writing XML file:', writeErr);
            resolve(NextResponse.json({ error: 'Cannot update XML file' }, { status: 500 }));
            return;
          }

          console.log('✅ Reclamation updated successfully:', id);
          resolve(NextResponse.json({
            success: true,
            message: 'Reclamation marked as resolved',
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