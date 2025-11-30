import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseString, Builder } from 'xml2js';

// DELETE method
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    console.log('🔴 DELETE API Called - Notification ID:', id);
    
    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
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
        
        if (!result.notifications || !result.notifications.notification) {
          console.error('❌ No notifications found in XML');
          resolve(NextResponse.json({ error: 'No notifications found in XML' }, { status: 404 }));
          return;
        }

        const originalNotifications = result.notifications.notification;
        console.log(`📋 Found ${originalNotifications.length} notifications`);

        const filteredNotifications = originalNotifications.filter(notification => notification.$.id !== id);

        console.log(`📊 After filter: ${filteredNotifications.length} notifications remain`);

        if (filteredNotifications.length === originalNotifications.length) {
          console.error(`❌ Notification ${id} not found in XML`);
          resolve(NextResponse.json({ error: `Notification ${id} not found` }, { status: 404 }));
          return;
        }

        result.notifications.notification = filteredNotifications;

        const builder = new Builder();
        const updatedXml = builder.buildObject(result);

        fs.writeFile(xmlPath, updatedXml, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('❌ Error writing XML file:', writeErr);
            resolve(NextResponse.json({ error: 'Cannot update XML file' }, { status: 500 }));
            return;
          }

          console.log('✅ Notification deleted successfully:', id);
          resolve(NextResponse.json({
            success: true,
            message: 'Notification deleted successfully',
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
    
    console.log('🟡 PUT API Called - Update Notification ID:', id);
    console.log('📝 Updated data:', updatedData);
    
    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
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
        
        if (!result.notifications || !result.notifications.notification) {
          console.error('❌ No notifications found in XML');
          resolve(NextResponse.json({ error: 'No notifications found in XML' }, { status: 404 }));
          return;
        }

        const notifications = result.notifications.notification;
        console.log(`📋 Found ${notifications.length} notifications`);

        const notificationToUpdate = notifications.find(notification => notification.$.id === id);
        
        if (!notificationToUpdate) {
          console.error(`❌ Notification ${id} not found in XML`);
          resolve(NextResponse.json({ error: `Notification ${id} not found` }, { status: 404 }));
          return;
        }

        console.log('🔍 Found notification to update:', notificationToUpdate);

        // Update the notification data
        notificationToUpdate.chefTournee[0].$.id = updatedData.chefTourneeId;
        notificationToUpdate.travail[0].$.id = updatedData.travailId;
        notificationToUpdate.contenu[0] = updatedData.contenu;

        console.log('✅ Notification data updated');

        const builder = new Builder();
        const updatedXml = builder.buildObject(result);

        fs.writeFile(xmlPath, updatedXml, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('❌ Error writing XML file:', writeErr);
            resolve(NextResponse.json({ error: 'Cannot update XML file' }, { status: 500 }));
            return;
          }

          console.log('✅ Notification updated successfully:', id);
          resolve(NextResponse.json({
            success: true,
            message: 'Notification updated successfully',
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