
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
function genMock(iata){
  const now=new Date()
  const flights=[]
  for(let i=0;i<25;i++){
    const d=new Date(now.getTime()+(10+i*6)*60000)
    flights.push({number:'VJ'+(780+i),origin:['HAN','DAD','VCA'][i%3],airline:'VietJet',aircraft:'A320',scheduled:d.toISOString(),estimated:d.toISOString(),status:Math.random()>0.7?'delayed':'on_time',delayMin:Math.random()>0.7?10:0,belt:String((i%4)+1),gate:'B'+((i%6)+1),terminal:'T1',parking:'Bãi A'})
  }
  return flights
}
export async function GET(){
  const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL
  const skey=process.env.SUPABASE_SECRET_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase=createClient(url,skey)
  const iata='SGN'
  const flights=genMock(iata)
  const clusters=[{window:'08:00-12:00',count:25,suggest_depart:new Date().toISOString(),flights}]
  const payload={iata,flights,clusters,updated_at:new Date().toISOString(),is_mock:false,source:'UI_TOI_UU'}
  try{ await supabase.from('flight_cache').upsert({iata,data:payload,updated_at:payload.updated_at},{onConflict:'iata'}) }catch(e){}
  return NextResponse.json({ok:true,count:flights.length})
}
