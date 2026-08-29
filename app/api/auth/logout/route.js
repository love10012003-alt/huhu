
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
export async function POST(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase=createClient(url,key)
  await supabase.auth.signOut()
  return NextResponse.json({ok:true,message:'Đã đăng xuất'})
}
