import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://uhokqclbxoevlxrzeinf.supabase.co'
const supabaseKey = 'YOUR_SUPABASE_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

// Map substrings found in email subjects to the real kiosk location names
const locationMap = {
  "Smitty": "Smitty's Sandyport",
  "QHC Carmichael": "Quality Home Center Carmichael",
  "Rubis": "Rubis East St and Soldier Rd",
  "Quality Home Center": "Quality Home Center Prince Charles"
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { raw_subject, status } = req.body

    if (!raw_subject || !status) {
      return res.status(400).json({ error: 'Missing raw_subject or status' })
    }

    // Find matching location by checking for known substrings
    let matchedLocation = null
    for (const key in locationMap) {
      if (raw_subject.includes(key)) {
        matchedLocation = locationMap[key]
        break
      }
    }

    if (!matchedLocation) {
      return res.status(400).json({ error: 'No known location found in subject' })
    }

    const { error } = await supabase
      .from('kiosks')
      .upsert([
        {
          location: matchedLocation,
          status,
          timestamp: new Date().toISOString()
        }
      ], { onConflict: ['location'] })

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ error: 'Failed to update status' })
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('Webhook error:', err)
    return res.status(500).json({ error: 'Unexpected server error' })
  }
}
