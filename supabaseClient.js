import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://uhokqclbxoevlxrzeinf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVob2txY2xieG9ldmx4cnplaW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTg5NDMsImV4cCI6MjA2MzA5NDk0M30.1EtiWsCOnC3cPklPKUNVGJ0M9fFtvAAf0znRDVy9Tqk'

export const supabase = createClient(supabaseUrl, supabaseKey)
