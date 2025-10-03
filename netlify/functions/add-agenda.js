// netlify/functions/add-agenda.js
export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  // Handle CORS preflight
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
    // Parse data
    const data = JSON.parse(event.body)
    console.log('📥 Received data:', data)
    
    // Validasi
    if (!data.tanggal || !data.jam || !data.agenda || !data.pic) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          required: ['tanggal', 'jam', 'agenda', 'pic']
        })
      }
    }

    // Environment variables (HANYA dari Netlify env vars)
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing environment variables')
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Server configuration error',
          details: 'Missing environment variables'
        })
      }
    }
    
    console.log('🔗 Supabase URL:', supabaseUrl)
    console.log('🔑 Using API Key:', supabaseKey.substring(0, 20) + '...')

    const insertData = {
      tanggal: data.tanggal,
      jam: data.jam,
      agenda: data.agenda,
      pic: data.pic,
      tempat: data.tempat || null,
      created_at: new Date().toISOString(),
      updated_by: data.updated_by || null
    }
    
    console.log('🚀 Inserting data:', insertData)

    // Direct REST API call ke Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/agenda`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(insertData)
    })

    console.log('📡 Supabase response status:', response.status)

    const responseText = await response.text()
    console.log('📄 Raw response:', responseText)

    if (!response.ok) {
      console.error('❌ Supabase error:', responseText)
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: 'Database insert failed',
          details: responseText,
          status: response.status
        })
      }
    }

    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr)
      result = { raw: responseText }
    }

    console.log('✅ Insert successful:', result)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Agenda berhasil ditambahkan!',
        data: Array.isArray(result) ? result[0] : result
      })
    }

  } catch (err) {
    console.error('💥 Function error:', err)
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
