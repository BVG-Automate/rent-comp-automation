exports.handler = async (event, context) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Return a simple success response for now
    const comps = [
      { comp_num: 1, address: 'Sample Address 1', amenities_found: 5 },
      { comp_num: 2, address: 'Sample Address 2', amenities_found: 6 },
      { comp_num: 3, address: 'Sample Address 3', amenities_found: 4 },
      { comp_num: 4, address: 'Sample Address 4', amenities_found: 7 },
      { comp_num: 5, address: 'Sample Address 5', amenities_found: 5 }
    ];

    // Create a simple Excel file as base64
    const excelContent = Buffer.from([
      0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00,
      0x08, 0x00, 0x00, 0x00, 0x21, 0x00, 0xeb, 0xac,
      0xad, 0xab, 0xcb, 0x81, 0x1c, 0x07, 0x1c, 0x07
    ]).toString('base64');

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        filename: 'rent_comp_automated.xlsx',
        downloadUrl: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelContent}`,
        comps: comps
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
