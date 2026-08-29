
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
export async function GET(){
  const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL
  const skey=process.env.SUPABASE_SECRET_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const rawKeys=(process.env.AVIATIONSTACK_KEY||'').split(',').map(k=>k.trim()).filter(Boolean)
  let supabaseCheck={ok:false,error:''}
  try{
    const supabase=createClient(url,skey)
    const {error}=await supabase.from('flight_cache').select('iata').limit(1)
    if(error) supabaseCheck.error=error.message
    else supabaseCheck.ok=true
  }catch(e){ supabaseCheck.error=e.message }
  let aviationCheck={ok:false,error:'',count:0,keysTried:rawKeys.length}
  for(const ak of rawKeys){
    try{
      const res=await fetch(`https://api.aviationstack.com/v1/flights?access_key=${ak}&arr_iata=SGN&limit=3`,{cache:'no-store'})
      const j=await res.json()
      if(j.error){ aviationCheck.error=j.error.code+' - '+j.error.message; continue }
      if(j.data){ aviationCheck.ok=true; aviationCheck.count=j.data.length; aviationCheck.error=''; break }
    }catch(e){ aviationCheck.error=e.message }
  }
  return NextResponse.json({domain:'f.lal.vn FULL',env:{SUPABASE_URL:!!url,SECRET:!!skey,AVIATION:rawKeys.length},supabase:supabaseCheck,aviation:aviationCheck,keyMoi:'7632472d'})
}
