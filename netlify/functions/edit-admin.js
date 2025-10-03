// netlify/functions/edit-admin.js
import bcrypt from 'bcryptjs';

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
    const { id_admin, nama, email, password } = JSON.parse(event.body);

    if (!id_admin || !nama || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'ID, nama, dan email harus diisi' })
      };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const updateData = { nama, email };

    // Jika ada password baru, hash terlebih dahulu
    if (password && password.length > 0) {
      if (password.length < 6) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Password minimal 6 karakter' })
        };
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/admin?id_admin=eq.${id_admin}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'Database error', details: data })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data })
    };

  } catch (err) {
    console.error('Edit admin error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error', details: err.message })
    };
  }
};
