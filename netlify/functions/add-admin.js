export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const data = JSON.parse(event.body)
    
    if (!data.nama || !data.email || !data.password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          required: ['nama', 'email', 'password']
        })
      }
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      }
    }

    // Hash password (simple base64 encoding - in production use bcrypt)
    const hashedPassword = Buffer.from(data.password).toString('base64')

    const insertData = {
      nama: data.nama,
      email: data.email,
      password: hashedPassword,
      created_at: new Date().toISOString()
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(insertData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Supabase error: ${errorText}`)
    }

    const result = await response.json()

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Admin berhasil ditambahkan!',
        data: Array.isArray(result) ? result[0] : result
      })
    }
  } catch (err) {
    console.error('Add admin error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server error',
        details: err.message
      })
    }
  }
}
