import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhokqclbxoevlxrzeinf.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mail_subject, status } = req.body;

    if (!mail_subject || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Extract the raw machine name from subject
    const subjectMatch = mail_subject.match(/Connect Alert - (.+?):/);
    const rawLocation = subjectMatch ? subjectMatch[1].trim() : 'Unknown';

    // Optional mapping to friendly names
    const locationMap: Record<string, string> = {
      "QHC Carmichael": "Quality Home Center Carmichael",
      "Rubis": "Rubis East St and Soldier Rd",
      "Smitty's": "Smitty's Sandyport",
      "Quality Home Center": "Quality Home Center Prince Charles"
    };

    const location = locationMap[rawLocation] || rawLocation;

    // Upsert into Supabase
    const { error } = await supabase
      .from('kiosks')
      .upsert({
        location,
        status,
        timestamp: new Date().toISOString()
      }, { onConflict: 'location' });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to update status' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
