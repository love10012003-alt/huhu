
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
export async function GET(){
  const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL
  const skey=process.env.SUPABASE_SECRET_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase=createClient(url,skey)
  let tables=[]
  try{
    const {data,error}=await supabase.from('flight_cache').select('iata, updated_at').order('updated_at',{ascending:false}).limit(10)
    if(!error) tables=data
  }catch(e){}
  return NextResponse.json({domain:'f.lal.vn CHECK SCRAPE',supabase_tables:tables,check:'Mở /api/flights?airport=SGN và /api/flights?airport=HAN xem iata có khác nhau không, flights origin có khác không'})
}
