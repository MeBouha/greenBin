import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseString, Builder } from 'xml2js';

// POST method for adding new notification
export async function POST(request) {
  try {
    const newData = await request.json();
    
    console.log('🟢 POST API Called - Add new notification');
    console.log('📝 New data:', newData);
    
    if (!newData.chefTourneeId || !newData.travailId || !newData.contenu) {
      return NextResponse.json({ error: 'chefTourneeId, travailId and contenu are required' }, { status: 400 });
    }

    const xmlPath = path.join(process.cwd(), 'public', 'data', 'notification.xml');
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
        
        // Check if notifications exist, create if not
        if (!result.notifications) {
          result.notifications = { notification: [] };
        }
        
        if (!result.notifications.notification) {
          result.notifications.notification = [];
        }

        const notifications = result.notifications.notification;
        console.log(`📋 Found ${notifications.length} notifications`);

        // Generate new ID if not provided
        let newId = newData.id;
        if (!newId) {
          const existingIds = notifications.map(notif => parseInt(notif.$.id)).filter(id => !isNaN(id));
          newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
          newId = newId.toString();
        }

        // Check if ID already exists
        const existingNotification = notifications.find(notif => notif.$.id === newId);
        if (existingNotification) {
          console.error(`❌ Notification with ID ${newId} already exists`);
          resolve(NextResponse.json({ error: `Notification with ID ${newId} already exists` }, { status: 400 }));
          return;
        }

        // Create new notification object
        const newNotification = {
          $: { id: newId },
          chefTournee: [{ $: { id: newData.chefTourneeId } }],
          travail: [{ $: { id: newData.travailId } }],
          contenu: [newData.contenu]
        };

        // Add new notification
        notifications.push(newNotification);

        console.log('✅ New notification added to array');

        const builder = new Builder();
        const updatedXml = builder.buildObject(result);

        fs.writeFile(xmlPath, updatedXml, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('❌ Error writing XML file:', writeErr);
            resolve(NextResponse.json({ error: 'Cannot update XML file' }, { status: 500 }));
            return;
          }

          console.log('✅ Notification added successfully:', newId);
          resolve(NextResponse.json({
            success: true,
            message: 'Notification added successfully',
            addedId: newId
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