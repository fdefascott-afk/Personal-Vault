import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
})

export const fileStorage = {
  buckets: {
    image: 'Docs',
    audio: 'Docs',
    video: 'Video',
    pdf: 'PDF',
  },
  folders: {
    image: 'imgane',
    audio: 'imgane',
    pdf: 'documents',
    video: 'video',
  },
  subfolders: {
    image: 'image',
    audio: 'audio',
  },
}
