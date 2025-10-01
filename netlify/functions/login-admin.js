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
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email dan password harus diisi' })
      };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    // Query admin dengan email dan password
    const response = await fetch(
      `${supabaseUrl}/rest/v1/admin?email=eq.${encodeURIComponent(email)}&password=eq.${encodeURIComponent(password)}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const adminData = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'Database error', details: adminData })
      };
    }

    // Check if admin exists
    if (adminData.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Email atau password salah' })
      };
    }

    // Login successful
    const admin = adminData[0];
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Login berhasil',
        admin: {
          id_admin: admin.id_admin,
          email: admin.email,        
          nama: admin.nama           
        }
      })
    };

  } catch (err) {
    console.error('Login error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error', details: err.message })
    };
  }
};
