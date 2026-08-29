
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
export async function GET(){
  const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL
  const skey=process.env.SUPABASE_SECRET_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const rawKeys=(process.env.AVIATIONSTACK_KEY||process.env.AVIATION_KEY||'').split(',').map(k=>k.trim()).filter(Boolean)
  let supabaseCheck={ok:false,error:'',tableExists:false}
  try{
    const supabase=createClient(url,skey)
    const {error}=await supabase.from('flight_cache').select('iata').limit(1)
    if(error) supabaseCheck.error=error.message
    else supabaseCheck.ok=true
  }catch(e){ supabaseCheck.error=e.message+' - Supabase co the bi PAUSE, vao dashboard restore' }
  let aviationCheck={ok:false,error:'',count:0,keysTried:rawKeys.length}
  for(const akey of rawKeys){
    try{
      const res=await fetch(`https://api.aviationstack.com/v1/flights?access_key=${akey}&arr_iata=SGN&limit=3`,{cache:'no-store'})
      const j=await res.json()
      if(j.error){ aviationCheck.error=j.error.code+' - '+j.error.message; continue }
      if(j.data){ aviationCheck.ok=true; aviationCheck.count=j.data.length; aviationCheck.error=''; break }
    }catch(e){ aviationCheck.error=e.message }
  }
  if(!aviationCheck.ok && rawKeys.length===0) aviationCheck.error='Thieu AVIATIONSTACK_KEY - them key vao Vercel Env, co the nhieu key cach nhau dau phay'
  return NextResponse.json({
    domain:'f.lal.vn - BEST SEAMLESS',
    mechanism:'Aviation (multi-key rotation) -> Fallback REAL mock 25 chuyen -> Supabase cache -> Fallback truc tiep neu Supabase loi',
    limitation:'Free Aviation 1000 req/thang de het quota, Supabase free pause 7 ngay, Vercel Hobby chi cho cron daily',
    bestPlan:'Multi-key + Fallback mock REAL lien mach + Supabase fallback + Github Actions cron 10p + Nut kiem tra loi tren man hinh chinh',
    time:new Date().toISOString(),
    env:{SUPABASE_URL:!!url,SECRET:!!skey,AVIATION:rawKeys.length,AVIATION_KEYS:rawKeys.length},
    supabase:supabaseCheck,
    aviation:aviationCheck
  })
}
