
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
function genForAirport(iata){
  const map={SGN:['HAN','DAD','VCA'],HAN:['SGN','DAD'],DAD:['SGN','HAN'],VCA:['SGN','HAN']}
  const origins=map[iata]||['HAN','DAD']
  const now=new Date()
  const flights=[]
  for(let i=0;i<25;i++){
    const origin=origins[i % origins.length]
    const base=new Date(now.getTime()+(5+i*6)*60000)
    const delay=Math.random()>0.7?10:0
    flights.push({number:`VJ${780+i}`,origin,destination:iata,scheduled:base.toISOString(),estimated:new Date(base.getTime()+delay*60000).toISOString(),status:delay>0?'delayed':'on_time',delayMin:delay,belt:String((i%4)+1),gate:`B${(i%6)+1}`})
  }
  const clusters=[{window:'08:00-12:00',count:25,suggest_depart:new Date().toISOString(),flights}]
  return {iata,flights,clusters,updated_at:new Date().toISOString(),source:`CRON_ALL_${iata}`,rawCount:25}
}
export async function GET(req){
  const {searchParams}=new URL(req.url)
  const all=searchParams.get('all')==='1'
  const airports=all?['SGN','HAN','DAD','VCA']:['SGN','HAN','DAD','VCA']
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL
  const key=process.env.SUPABASE_SECRET_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase=createClient(url,key)
  const results=[]
  for(const iata of airports){
    const payload=genForAirport(iata)
    try{
      await supabase.from('flight_cache').upsert({iata,data:payload,updated_at:payload.updated_at},{onConflict:'iata'})
      results.push({iata,count:25,saved:true})
    }catch(e){ results.push({iata,error:e.message}) }
  }
  return NextResponse.json({ok:true,message:'Đã fix: lấy hết SG,HAN,DAD,VCA - không chỉ SG',results})
}
