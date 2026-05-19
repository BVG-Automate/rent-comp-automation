const { PDFDocument } = require('pdf-parse');
const pdfParse = require('pdf-parse');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const busboy = require('busboy');

// Amenity keyword map
const KEYWORD_MAP = {
  'Security': ['security', 'gated', 'guard'],
  'Gated': ['gated', 'gate'],
  'Common Park': ['park', 'common area'],
  'Swimming Pool': ['pool', 'swimming'],
  'Fitness Center': ['fitness', 'gym', 'workout'],
  'Clubhouse': ['clubhouse', 'club house', 'community center'],
  'Air Conditioning': ['air conditioning', 'a/c', 'ac'],
  'Dishwasher': ['dishwasher'],
  'Balcony/Patio': ['balcony', 'patio', 'porch'],
  'Common Laundry': ['common laundry', 'laundry facilities'],
  'Washer/Dryer Hookups': ['w/d hook', 'washer/dryer hookup'],
  'Washer/Dryer In-Unit': ['in unit laundry', 'washer/dryer', 'in-unit'],
  'Open Parking': ['open parking', 'parking'],
  'Covered Parking': ['covered parking', 'carport'],
  'Driveway': ['driveway'],
  '1 Car Garage': ['1 car garage'],
  '2 Car Garage': ['2 car garage'],
  'Electricity': ['electricity'],
  'Water': ['water'],
  'Hot Water': ['hot water'],
  'Sewer': ['sewer'],
  'Garbage': ['garbage', 'trash'],
  'Cable': ['cable'],
  'Internet': ['internet', 'high-speed']
};

const AMENITY_ROWS = {
  'Security': 10, 'Gated': 11, 'Common Park': 12, 'Swimming Pool': 13,
  'Fitness Center': 14, 'Clubhouse': 15, 'Air Conditioning': 18, 'Dishwasher': 19,
  'Balcony/Patio': 20, 'Common Laundry': 23, 'Washer/Dryer Hookups': 24,
  'Washer/Dryer In-Unit': 25, 'Open Parking': 28, 'Covered Parking': 29,
  'Driveway': 30, '1 Car Garage': 31, '2 Car Garage': 32, 'Electricity': 35,
  'Water': 36, 'Hot Water': 37, 'Sewer': 38, 'Garbage': 39, 'Cable': 40, 'Internet': 41
};

const COMP_COLS = { 1: 'D', 2: 'F', 3: 'H', 4: 'J', 5: 'L' };

function extractAmenities(text) {
  const found = {};
  const textLower = text.toLowerCase();

  for (const [amenity, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const keyword of keywords) {
      if (textLower.includes(keyword)) {
        found[amenity] = 'Yes';
        break;
      }
    }
  }

  return found;
}

function parseComps(text) {
  const comps = [];
  const rentSections = text.split(/Rent\s+#(\d+)/);

  for (let i = 1; i < rentSections.length; i += 2) {
    const rentNum = parseInt(rentSections[i]);
    const section = rentSections[i + 1] || '';

    const addrMatch = section.match(/Address\s+([^\n]+)/i);
    if (addrMatch) {
      const address = addrMatch[1].trim();
      const surveyMatch = section.match(/Survey Comment\s+(.+?)(?=\nRent Roll|$)/is);
      const survey = surveyMatch ? surveyMatch[1].trim() : '';
      const amenities = extractAmenities(survey);

      comps.push({
        comp_num: rentNum,
        address: address,
        survey_comment: survey,
        amenities: amenities
      });
    }
  }

  return comps;
}

exports.handler = async (event, context) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse multipart form data
    const bb = busboy({ headers: event.headers });
    let pdfBuffer = null;
    let pdfFilename = '';

    await new Promise((resolve, reject) => {
      bb.on('file', (fieldname, file, fileinfo) => {
        const chunks = [];
        pdfFilename = fileinfo.filename;

        file.on('data', (data) => {
          chunks.push(data);
        });

        file.on('end', () => {
          pdfBuffer = Buffer.concat(chunks);
        });
      });

      bb.on('close', resolve);
      bb.on('error', reject);
    });

    if (!pdfBuffer) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No PDF file provided' })
      };
    }

    // Parse PDF
    const pdfData = await pdfParse(pdfBuffer);
    const fullText = pdfData.text;

    // Extract comparables
    const comps = parseComps(fullText);

    if (comps.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No comparables found in PDF' })
      };
    }

    // Load template (assume it's in /tmp or fetch from somewhere)
    // For now, create a minimal populated workbook
    const wb = XLSX.utils.book_new();

    // Create "Rent Comp Adjustments" sheet
    const ws = XLSX.utils.aoa_to_sheet([
      ['Item', '$Adj.', 'Subject', 'Comp 1', 'Adj', 'Comp 2', 'Adj', 'Comp 3', 'Adj', 'Comp 4', 'Adj', 'Comp 5', 'Adj']
    ]);

    // Add some rows and populate amenities
    let rowNum = 3;
    for (const [amenity, row] of Object.entries(AMENITY_ROWS)) {
      const colLetter = 'A';
      ws[`${colLetter}${row}`] = { v: amenity, t: 's' };

      // Populate comp columns
      comps.forEach(comp => {
        const col = COMP_COLS[comp.comp_num];
        if (col && comp.amenities[amenity]) {
          ws[`${col}${row}`] = { v: 'Yes', t: 's' };
        }
      });
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Rent Comp Adjustments');

    // Generate buffer and convert to base64 for download
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const base64 = wbout.toString('base64');

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `rent_comp_automated_${timestamp}.xlsx`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        filename: filename,
        downloadUrl: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`,
        comps: comps.map(c => ({
          comp_num: c.comp_num,
          address: c.address,
          amenities_found: Object.keys(c.amenities).length
        }))
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};
