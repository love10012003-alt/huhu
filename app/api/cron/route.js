
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
export async function GET(){
  const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL
  const skey=process.env.SUPABASE_SECRET_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const akey=process.env.AVIATIONSTACK_KEY||process.env.AVIATION_KEY
  if(!url||!skey) return NextResponse.json({ok:false,domain:'f.lal.vn',error:'Thieu SUPABASE env - them vao Vercel Env'}, {status:500})
  if(!akey) return NextResponse.json({ok:false,domain:'f.lal.vn',error:'Thieu AVIATIONSTACK_KEY'}, {status:500})
  const supabase=createClient(url,skey)
  try{
    const res=await fetch(`https://api.aviationstack.com/v1/flights?access_key=${akey}&arr_iata=SGN&limit=25`,{cache:'no-store'})
    const j=await res.json()
    if(j.error) return NextResponse.json({ok:false,domain:'f.lal.vn',error:'Aviation loi: '+j.error.code+' - '+j.error.message,raw:j},{status:500})
    const flights=(j.data||[]).map(f=>({number:f.flight?.iata||f.flight?.number,origin:f.departure?.iata,scheduled:f.arrival?.scheduled,estimated:f.arrival?.estimated||f.arrival?.scheduled,status:f.arrival?.delay>5?'delayed':'on_time',belt:'1',gate:'B1'}))
    if(flights.length===0) return NextResponse.json({ok:false,domain:'f.lal.vn',error:'Aviation tra ve 0 chuyen - co the het quota',raw:j})
    const payload={iata:'SGN',flights,clusters:[{window:'08:00-09:00',count:flights.length,suggest_depart:new Date().toISOString(),flights}],updated_at:new Date().toISOString(),is_mock:false,rawCount:flights.length}
    const {error}=await supabase.from('flight_cache').upsert({iata:'SGN',data:payload,updated_at:payload.updated_at},{onConflict:'iata'})
    if(error) return NextResponse.json({ok:false,domain:'f.lal.vn',error:'Supabase upsert loi: '+error.message+' - Chay: alter table flight_cache disable row level security;',supabaseError:error},{status:500})
    return NextResponse.json({ok:true,domain:'f.lal.vn',count:flights.length,message:'Da nap REAL cho f.lal.vn'})
  }catch(e){ return NextResponse.json({ok:false,domain:'f.lal.vn',error:e.message},{status:500}) }
}
