
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
export async function GET(){
  const url=process.env.SUPABASE_URL
  const skey=process.env.SUPABASE_SECRET_KEY
  const akey=process.env.AVIATIONSTACK_KEY
  const supabase=createClient(url,skey)
  const res=await fetch(`https://api.aviationstack.com/v1/flights?access_key=${akey}&arr_iata=SGN&limit=25`,{cache:'no-store'})
  const j=await res.json()
  const flights=(j.data||[]).map(f=>({number:f.flight?.iata||f.flight?.number,origin:f.departure?.iata,scheduled:f.arrival?.scheduled,estimated:f.arrival?.estimated||f.arrival?.scheduled,status:'on_time',belt:'1',gate:'B1'}))
  const payload={iata:'SGN',flights,clusters:[{window:'08:00-09:00',count:flights.length,suggest_depart:new Date().toISOString(),flights}],updated_at:new Date().toISOString(),is_mock:flights.length===0,rawCount:j.data?.length||0}
  await supabase.from('flight_cache').upsert({iata:'SGN',data:payload,updated_at:payload.updated_at},{onConflict:'iata'})
  return NextResponse.json({ok:true,count:flights.length,is_mock:flights.length===0})
}
