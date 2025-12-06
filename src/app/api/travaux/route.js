import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseString, Builder } from 'xml2js';

const XML_PATH = path.join(process.cwd(), 'public', 'travaux.xml');

// Helper function to read XML
const readXml = async () => {
  try {
    if (!fs.existsSync(XML_PATH)) {
      // Create default XML if doesn't exist
      const defaultXml = `<?xml version="1.0" encoding="UTF-8"?>
<travaux xmlns:xs="http://www.w3.org/2001/XMLSchema-instance"
           xs:noNamespaceSchemaLocation="greenBin.xsd">
    <travail id="1">
        <date>2024-06-10</date>
        <lieu>hay el ons</lieu>
        <cords>
            <latitude>34</latitude>
            <longitude>5.18</longitude>
        </cords>
        <etat>complet</etat>
    </travail>
</travaux>`;
      fs.writeFileSync(XML_PATH, defaultXml);
    }
    
    const xmlData = fs.readFileSync(XML_PATH, 'utf8');
    return new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

// Helper function to write XML
const writeXml = async (data) => {
  try {
    const builder = new Builder();
    const xml = builder.buildObject(data);
    fs.writeFileSync(XML_PATH, xml);
  } catch (error) {
    throw error;
  }
};

// GET all travaux
export async function GET() {
  try {
    const result = await readXml();
    return NextResponse.json(result.travaux.travail || []);
  } catch (error) {
    console.error('Error reading XML:', error);
    return NextResponse.json(
      { error: 'Failed to read travaux data' },
      { status: 500 }
    );
  }
}

// POST - Add new travail
export async function POST(request) {
  try {
    const body = await request.json();
    const { date, lieu, latitude, longitude, etat } = body;
    
    if (!date || !lieu || !latitude || !longitude || !etat) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    const xmlData = await readXml();
    const travaux = xmlData.travaux;
    
    // Generate new ID
    const existingIds = travaux.travail ? travaux.travail.map(t => parseInt(t.$.id)) : [];
    const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    
    // Create new travail
    const newTravail = {
      $: { id: newId.toString() },
      date: [date],
      lieu: [lieu],
      cords: [{
        latitude: [latitude],
        longitude: [longitude]
      }],
      etat: [etat]
    };
    
    // Add to array
    if (!travaux.travail) {
      travaux.travail = [newTravail];
    } else {
      travaux.travail.push(newTravail);
    }
    
    await writeXml(xmlData);
    
    return NextResponse.json({
      success: true,
      message: 'Travail added successfully',
      id: newId
    });
  } catch (error) {
    console.error('Error adding travail:', error);
    return NextResponse.json(
      { error: 'Failed to add travail' },
      { status: 500 }
    );
  }
}

// PUT - Update existing travail
export async function PUT(request) {
  try {
    const { id, date, lieu, latitude, longitude, etat } = await request.json();
    
    if (!id || !date || !lieu || !latitude || !longitude || !etat) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    const xmlData = await readXml();
    const travaux = xmlData.travaux;
    
    if (!travaux.travail) {
      return NextResponse.json(
        { error: 'No travaux found' },
        { status: 404 }
      );
    }
    
    const travailIndex = travaux.travail.findIndex(t => t.$.id === id.toString());
    
    if (travailIndex === -1) {
      return NextResponse.json(
        { error: 'Travail not found' },
        { status: 404 }
      );
    }
    
    // Update travail
    travaux.travail[travailIndex] = {
      $: { id: id.toString() },
      date: [date],
      lieu: [lieu],
      cords: [{
        latitude: [latitude],
        longitude: [longitude]
      }],
      etat: [etat]
    };
    
    await writeXml(xmlData);
    
    return NextResponse.json({
      success: true,
      message: 'Travail updated successfully'
    });
  } catch (error) {
    console.error('Error updating travail:', error);
    return NextResponse.json(
      { error: 'Failed to update travail' },
      { status: 500 }
    );
  }
}

// DELETE - Remove travail
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Travail ID is required' },
        { status: 400 }
      );
    }
    
    const xmlData = await readXml();
    const travaux = xmlData.travaux;
    
    if (!travaux.travail) {
      return NextResponse.json(
        { error: 'No travaux found' },
        { status: 404 }
      );
    }
    
    const initialLength = travaux.travail.length;
    travaux.travail = travaux.travail.filter(t => t.$.id !== id.toString());
    
    if (travaux.travail.length === initialLength) {
      return NextResponse.json(
        { error: 'Travail not found' },
        { status: 404 }
      );
    }
    
    await writeXml(xmlData);
    
    return NextResponse.json({
      success: true,
      message: 'Travail deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting travail:', error);
    return NextResponse.json(
      { error: 'Failed to delete travail' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}