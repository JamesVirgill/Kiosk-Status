import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uhokqclbxoevlxrzeinf.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || '' // Use environment variable for safety
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      raw_subject,
      status,
      id,
      processed_at_iso8601
    } = req.body

    if (!raw_subject || !status || !id) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Extract location from the subject line
    const parts = raw_subject.split(' - ')
    let location = parts[1]?.split(':')[0]?.trim()

    // Normalize known locations
    if (location?.toLowerCase().includes("smitty")) location = "Smitty's Sandyport"
    else if (location?.toLowerCase().includes("qhc") || location?.toLowerCase().includes("quality home")) location = "Quality Home Center Carmichael"
    else if (location?.toLowerCase().includes("rubis")) location = "Rubis East St and Soldier Rd"

    if (!location) {
      return res.status(400).json({ error: 'Could not parse location from subject' })
    }

    const { error } = await supabase
      .from('kiosks')
      .upsert([
        {
          id,
          location,
          status,
          timestamp: processed_at_iso8601
        }
      ], { onConflict: ['location'] })

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ error: 'Failed to update Supabase' })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Unexpected error:', err)
    return res.status(500).json({ error: 'Unexpected error occurred' })
  }
}
