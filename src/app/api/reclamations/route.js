import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseString, Builder } from 'xml2js';

// POST method for adding new reclamation
export async function POST(request) {
  try {
    const newData = await request.json();
    
    console.log('🟢 POST API Called - Add new reclamation');
    console.log('📝 New data:', newData);
    
    if (!newData.citoyenNom || !newData.contenu || !newData.type) {
      return NextResponse.json({ error: 'Nom, contenu and type are required' }, { status: 400 });
    }

    const xmlPath = path.join(process.cwd(), 'public', 'data', 'reclamation.xml');
    const usersXmlPath = path.join(process.cwd(), 'public', 'data', 'users.xml');
    
    console.log('📁 XML Path:', xmlPath);

    if (!fs.existsSync(xmlPath)) {
      console.error('❌ XML file not found');
      return NextResponse.json({ error: 'XML file not found' }, { status: 404 });
    }

    if (!fs.existsSync(usersXmlPath)) {
      console.error('❌ Users XML file not found');
      return NextResponse.json({ error: 'Users XML file not found' }, { status: 404 });
    }

    const xmlData = fs.readFileSync(xmlPath, 'utf8');
    const usersXmlData = fs.readFileSync(usersXmlPath, 'utf8');
    console.log('📄 XML files read successfully');

    return new Promise((resolve) => {
      // Parse users.xml first to find or create citizen
      parseString(usersXmlData, (usersParseErr, usersResult) => {
        if (usersParseErr) {
          console.error('❌ Users XML Parse Error:', usersParseErr);
          resolve(NextResponse.json({ error: 'Cannot parse users XML' }, { status: 500 }));
          return;
        }

        // Ensure users structure exists
        if (!usersResult.users) {
          usersResult.users = { user: [] };
        }
        if (!usersResult.users.user) {
          usersResult.users.user = [];
        }

        const users = usersResult.users.user;
        const citoyenFullName = newData.citoyenPrenom 
          ? `${newData.citoyenPrenom} ${newData.citoyenNom}`
          : newData.citoyenNom;

        // Search for existing citizen by name
        let citoyenId = null;
        const existingCitizen = users.find(u => {
          const userNom = u.nom?.[0] || '';
          const userPrenom = u.prenom?.[0] || '';
          const fullName = userPrenom ? `${userPrenom} ${userNom}` : userNom;
          return fullName.toLowerCase() === citoyenFullName.toLowerCase();
        });

        if (existingCitizen) {
          citoyenId = existingCitizen.$.id;
          console.log('✅ Found existing citizen with ID:', citoyenId);
        } else {
          // Create new citizen
          const maxUserId = users.length > 0 
            ? Math.max(...users.map(u => parseInt(u.$.id || '0'))) 
            : 0;
          citoyenId = String(maxUserId + 1);

          const newCitizen = {
            $: { id: citoyenId },
            login: [`citoyen${citoyenId}`],
            password: ['12345678'],
            nom: [newData.citoyenNom],
            prenom: [newData.citoyenPrenom || ''],
            role: ['citoyen']
          };

          users.push(newCitizen);
          console.log('✅ Created new citizen with ID:', citoyenId);

          // Write updated users.xml
          const usersBuilder = new Builder();
          const updatedUsersXml = usersBuilder.buildObject(usersResult);
          fs.writeFileSync(usersXmlPath, updatedUsersXml, 'utf8');
          console.log('✅ Users XML updated');
        }

        // Now parse reclamations.xml
        parseString(xmlData, (parseErr, result) => {
          if (parseErr) {
            console.error('❌ XML Parse Error:', parseErr);
            resolve(NextResponse.json({ error: 'Cannot parse XML' }, { status: 500 }));
            return;
          }

          console.log('📊 XML parsed successfully');
          
          // Check if reclamations exist, create if not
          if (!result.reclamations) {
            result.reclamations = { reclamation: [] };
          }
          
          if (!result.reclamations.reclamation) {
            result.reclamations.reclamation = [];
          }

          const reclamations = result.reclamations.reclamation;
          console.log(`📋 Found ${reclamations.length} reclamations`);

          // Generate new ID (max + 1)
          const maxId = reclamations.length > 0 
            ? Math.max(...reclamations.map(r => parseInt(r.$.id || '0'))) 
            : 0;
          const newId = String(maxId + 1);

          // Create new reclamation object
          const newReclamation = {
            $: { id: newId },
            citoyen: [{ $: { id: citoyenId }, _: citoyenFullName }],
            contenu: [newData.contenu],
            date: [newData.date || new Date().toISOString().split('T')[0]],
            status: [newData.status || 'new'],
            type: [newData.type]
          };

          // Add new reclamation
          reclamations.push(newReclamation);

          console.log('✅ New reclamation added to array');

          const builder = new Builder();
          const updatedXml = builder.buildObject(result);

          fs.writeFile(xmlPath, updatedXml, 'utf8', (writeErr) => {
            if (writeErr) {
              console.error('❌ Error writing XML file:', writeErr);
              resolve(NextResponse.json({ error: 'Cannot update XML file' }, { status: 500 }));
              return;
            }

            console.log('✅ Reclamation added successfully:', newId);
            resolve(NextResponse.json({
              success: true,
              message: 'Reclamation added successfully',
              addedId: newId,
              citoyenId: citoyenId
            }));
          });
        });
      });
    });

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    console.log('🔴 DELETE API Called - Reclamation ID:', id);
    
    if (!id) {
      return NextResponse.json({ error: 'Reclamation ID is required' }, { status: 400 });
    }

    // Path to XML file
    const xmlPath = path.join(process.cwd(), 'public', 'data', 'reclamation.xml');
    console.log('📁 XML Path:', xmlPath);

    // Check if file exists
    if (!fs.existsSync(xmlPath)) {
      console.error('❌ XML file not found');
      return NextResponse.json({ error: 'XML file not found' }, { status: 404 });
    }

    // Read XML file
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
        
        // Check if reclamations exist
        if (!result.reclamations || !result.reclamations.reclamation) {
          console.error('❌ No reclamations found in XML');
          resolve(NextResponse.json({ error: 'No reclamations found in XML' }, { status: 404 }));
          return;
        }

        const originalReclamations = result.reclamations.reclamation;
        console.log(`📋 Found ${originalReclamations.length} reclamations`);

        // Log all IDs for debugging
        const allIds = originalReclamations.map(rec => rec.$.id);
        console.log('🔍 All reclamation IDs:', allIds);

        // Filter out the reclamation to delete
        const filteredReclamations = originalReclamations.filter(rec => {
          const match = rec.$.id !== id;
          console.log(`🔍 Comparing: ${rec.$.id} === ${id} ? ${!match}`);
          return match;
        });

        console.log(`📊 After filter: ${filteredReclamations.length} reclamations remain`);

        // If nothing was removed, reclamation not found
        if (filteredReclamations.length === originalReclamations.length) {
          console.error(`❌ Reclamation ${id} not found in XML`);
          resolve(NextResponse.json({ error: `Reclamation ${id} not found` }, { status: 404 }));
          return;
        }

        // Update the reclamations
        result.reclamations.reclamation = filteredReclamations;

        // Convert back to XML
        const builder = new Builder();
        const updatedXml = builder.buildObject(result);

        // Write back to file
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

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}