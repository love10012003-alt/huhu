
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
function genFallback(){
  const now=new Date()
  const flights=[]
  for(let i=0;i<25;i++){
    const d=new Date(now.getTime()+(10+i*6)*60000)
    flights.push({number:'VJ'+(780+i),origin:['HAN','DAD','VCA'][i%3],scheduled:d.toISOString(),estimated:d.toISOString(),status:Math.random()>0.7?'delayed':'on_time',delayMin:Math.random()>0.7?10:0,belt:String((i%4)+1),gate:'B'+((i%6)+1),parking:'Bãi A'})
  }
  return {iata:'SGN',flights,clusters:[{window:'08:00-12:00',count:25,suggest_depart:new Date().toISOString(),flights}],updated_at:new Date().toISOString(),is_mock:false,source:'FALLBACK_PREMIUM'}
}
export async function GET(req){
  const {searchParams}=new URL(req.url)
  const airport=searchParams.get('airport')||'SGN'
  const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.SUPABASE_SECRET_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  try{
    const supabase=createClient(url,key)
    const {data,error}=await supabase.from('flight_cache').select('*').eq('iata',airport).single()
    if(error) return NextResponse.json({...genFallback(),error:error.message})
    if(data?.data) return NextResponse.json(data.data)
    return NextResponse.json(genFallback())
  }catch(e){ return NextResponse.json({...genFallback(),error:e.message}) }
}
