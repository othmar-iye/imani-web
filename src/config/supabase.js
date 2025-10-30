import { createClient } from '@supabase/supabase-js'

// Utilisez vos vraies valeurs ici
const supabaseUrl = "https://dxlbyqkrcfkwrtyidpsn.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4bGJ5cWtyY2Zrd3J0eWlkcHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDYzNTgsImV4cCI6MjA3Njk4MjM1OH0.SNtQ65-c0tEWfFhXVRVUKh6Ov9tKsiySE9XYFy6h8_o"

console.log('🔑 Configuration Supabase:')
console.log('URL:', supabaseUrl)
console.log('Clé présente:', !!supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)