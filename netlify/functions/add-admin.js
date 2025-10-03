// netlify/functions/add-admin.js
import bcrypt from 'bcryptjs';

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
    const { nama, email, password } = JSON.parse(event.body);

    if (!nama || !email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Semua field harus diisi' })
      };
    }

    if (password.length < 6) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Password minimal 6 karakter' })
      };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    const response = await fetch(`${supabaseUrl}/rest/v1/admin`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        nama,
        email,
        password: hashedPassword // Simpan password yang sudah di-hash
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'Database error', details: data })
      };
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ success: true, data })
    };

  } catch (err) {
    console.error('Add admin error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error', details: err.message })
    };
  }
};
