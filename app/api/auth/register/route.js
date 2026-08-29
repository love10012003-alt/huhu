
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
export async function POST(req){
  const {email,password}=await req.json()
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const supabase=createClient(url,key)
  const {data,error}=await supabase.auth.signUp({email,password})
  if(error) return NextResponse.json({ok:false,message:error.message})
  return NextResponse.json({ok:true,message:'Đăng ký thành công! Kiểm tra email',data})
}
