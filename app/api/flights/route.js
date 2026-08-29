
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
export async function GET(req){
  const {searchParams}=new URL(req.url)
  const airport=searchParams.get('airport')||'SGN'
  const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.SUPABASE_SECRET_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase=createClient(url,key)
  const {data}=await supabase.from('flight_cache').select('*').eq('iata',airport).single()
  if(data?.data) return NextResponse.json(data.data)
  return NextResponse.json({iata:airport,flights:[],clusters:[],is_mock:true})
}
