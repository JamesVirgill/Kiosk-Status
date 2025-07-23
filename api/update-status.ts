import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Initialize Supabase
const supabaseUrl = 'https://uhokqclbxoevlxrzeinf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // 👈 Use your actual anon key here
const supabase = createClient(supabaseUrl, supabaseKey)

// Map keywords in the email subject line to the kiosk names used in your frontend and Supabase
const locationMap = {
  "smitty's": "Smitty's Sandyport",
  "qhc carmichael": "Quality Home Center Carmichael",
  "quality home center": "Quality Home Center Prince Charles",
  "rubis": "Rubis East St and Soldier Rd"
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { raw_subject, status } = req.body

    // Basic validation
    if (!raw_subject || !status) {
      return res.status(400).json({ error: 'Missing raw_subject or status in request body' })
    }

    // Try to match the subject line to a known kiosk
    const lower = raw_subject.toLowerCase()
    let matchedLocation = null
    for (const key in locationMap) {
      if (lower.includes(key)) {
        matchedLocation = locationMap[key]
        break
      }
    }

    if (!matchedLocation) {
      return res.status(400).json({ error: 'No known location found in subject line' })
    }

    // Insert or update in Supabase
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
      console.error('Supabase insert error:', error)
      return res.status(500).json({ error: 'Failed to update Supabase' })
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('Webhook handler error:', err)
    return res.status(500).json({ error: 'Unexpected server error' })
  }
}
