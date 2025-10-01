export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'PATCH') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { 
      id, 
      tanggal, 
      jam, 
      agenda, 
      pic, 
      tempat, 
      status, 
      keterangan, 
      foto,
      id_admin,        // TAMBAHKAN INI
      updated_by       // TAMBAHKAN INI
    } = data;

    // Validate required fields
    if (!id || !tanggal || !jam || !agenda) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Validate id_admin
    if (!id_admin || !updated_by) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Admin information required' })
      };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const updateBody = {
      tanggal,
      jam,
      agenda,
      pic: pic || null,
      tempat: tempat || null,
      status: status || 'belum_selesai',
      keterangan: keterangan || null,
      foto: foto || null,
      id_admin,              // TAMBAHKAN INI
      updated_by,            // TAMBAHKAN INI
      updated_at: new Date().toISOString()  // TAMBAHKAN INI
    };

    console.log('Updating agenda with data:', { ...updateBody, foto: foto ? '[base64 data]' : null });

    const response = await fetch(`${supabaseUrl}/rest/v1/agenda?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updateBody)
    });

    const responseData = await response.text();

    if (!response.ok) {
      console.error('Supabase error:', responseData);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: 'Update failed',
          details: responseData
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Agenda updated successfully'
      })
    };

  } catch (err) {
    console.error('Server error:', err);
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
