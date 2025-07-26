export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { id } = data;

    console.log('🗑️ Attempting to delete ID:', id);
    console.log('🗑️ ID type:', typeof id);

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing ID' })
      };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    console.log('🔗 Supabase URL exists:', !!supabaseUrl);
    console.log('🔑 Supabase Key exists:', !!supabaseKey);

    const deleteUrl = `${supabaseUrl}/rest/v1/agenda?id=eq.${id}`;
    console.log('🎯 Delete URL:', deleteUrl);

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    console.log('📥 Supabase response status:', response.status);
    console.log('📥 Supabase response ok:', response.ok);

    const responseText = await response.text();
    console.log('📥 Supabase response text:', responseText);

    if (!response.ok) {
      console.error('❌ Supabase delete failed');
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: 'Delete failed', 
          details: responseText,
          supabaseStatus: response.status
        })
      };
    }

    // Check if any rows were affected
    let deletedData = [];
    try {
      deletedData = responseText ? JSON.parse(responseText) : [];
    } catch (e) {
      console.log('Response was not JSON, that\'s OK for DELETE');
    }

    console.log('✅ Delete operation completed');
    console.log('📊 Deleted rows:', deletedData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Agenda deleted successfully', 
        deletedCount: Array.isArray(deletedData) ? deletedData.length : 0,
        deletedData: deletedData
      })
    };

  } catch (err) {
    console.error('💥 Server error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server error', 
        details: err.message,
        stack: err.stack
      })
    };
  }
};
