
import { createClient } from '@supabase/supabase-js'
const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL
const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const secret=process.env.SUPABASE_SECRET_KEY||anon
export const supabaseAnon = createClient(url,anon)
export const supabaseAdmin = createClient(url,secret)
