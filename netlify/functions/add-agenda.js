export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { 
      tanggal, 
      jam, 
      agenda, 
      pic, 
      tempat,
      id_admin,        // TAMBAHKAN INI
      updated_by       // TAMBAHKAN INI
    } = data;

    if (!tanggal || !jam || !agenda) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    if (!id_admin || !updated_by) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Admin information required' })
      };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const insertBody = {
      tanggal,
      jam,
      agenda,
      pic: pic || null,
      tempat: tempat || null,
      status: 'belum_selesai',
      id_admin,              // TAMBAHKAN INI
      updated_by,            // TAMBAHKAN INI
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/agenda`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(insertBody)
    });

    const responseData = await response.text();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: 'Insert failed',
          details: responseData
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Agenda added successfully'
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server error', 
        details: err.message 
      })
    };
  }
};
