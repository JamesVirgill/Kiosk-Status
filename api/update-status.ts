import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://uhokqclbxoevlxrzeinf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVob2txY2xieG9ldmx4cnplaW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTg5NDMsImV4cCI6MjA2MzA5NDk0M30.1EtiWsCOnC3cPklPKUNVGJ0M9fFtvAAf0znRDVy9Tqk'
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { location, status } = req.body

    if (!location || !status) {
      return res.status(400).json({ error: 'Missing location or status' })
    }

    // Insert or update kiosk status
    const { error } = await supabase
      .from('kiosks')
      .upsert([
        {
          location,
          status,
          timestamp: new Date().toISOString(),
        }
      ], { onConflict: ['location'] })

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ error: 'Failed to update status' })
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('Webhook handler error:', err)
    return res.status(500).json({ error: 'Unexpected server error' })
  }
}
