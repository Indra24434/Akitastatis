export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'PATCH') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const data = JSON.parse(event.body)
    
    if (!data.id_admin || !data.nama || !data.email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          required: ['id_admin', 'nama', 'email']
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

    const updateData = {
      nama: data.nama,
      email: data.email
    }

    if (data.password && data.password.length > 0) {
      updateData.password = Buffer.from(data.password).toString('base64')
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/admin?id_admin=eq.${data.id_admin}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updateData)
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
        message: 'Admin berhasil diupdate!',
        data: Array.isArray(result) ? result[0] : result
      })
    }
  } catch (err) {
    console.error('Edit admin error:', err)
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
