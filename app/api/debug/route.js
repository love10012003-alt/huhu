
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
export async function GET(){
  const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL
  const skey=process.env.SUPABASE_SECRET_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const akey=process.env.AVIATIONSTACK_KEY||process.env.AVIATION_KEY
  let supabaseCheck={ok:false,error:'',tableExists:false}
  try{
    if(!url||!skey) supabaseCheck.error='Thieu SUPABASE env'
    else{
      const supabase=createClient(url,skey)
      const {error}=await supabase.from('flight_cache').select('iata').limit(1)
      if(error) supabaseCheck.error=error.message
      else supabaseCheck.ok=true
    }
  }catch(e){ supabaseCheck.error=e.message }
  let aviationCheck={ok:false,error:'',count:0}
  try{
    const res=await fetch(`https://api.aviationstack.com/v1/flights?access_key=${akey}&arr_iata=SGN&limit=5`,{cache:'no-store'})
    const j=await res.json()
    if(j.data){ aviationCheck.ok=true; aviationCheck.count=j.data.length } else aviationCheck.error=JSON.stringify(j).slice(0,300)
  }catch(e){ aviationCheck.error=e.message }
  return NextResponse.json({domain:'f.lal.vn',env:{SUPABASE_URL:!!url,SECRET:!!skey,AVIATION:!!akey},supabase:supabaseCheck,aviation:aviationCheck})
}
