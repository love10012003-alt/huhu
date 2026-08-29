
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
function genMockForAirport(iata){
  const originsMap={SGN:['HAN','DAD','VCA','CXR','PQC'],HAN:['SGN','DAD','VCA'],DAD:['SGN','HAN','CXR'],VCA:['SGN','HAN'],CXR:['SGN','HAN','DAD'],PQC:['SGN','HAN']}
  const origins=originsMap[iata]||['HAN','DAD']
  const now=new Date()
  const flights=[]
  for(let i=0;i<25;i++){
    const origin=origins[i % origins.length]
    const d=new Date(now.getTime()+(10+i*6)*60000)
    flights.push({number:`VJ${780+i}${iata}`,origin,airline:'VietJet',aircraft:'A320',scheduled:d.toISOString(),estimated:d.toISOString(),status:Math.random()>0.7?'delayed':'on_time',delayMin:0,belt:String((i%4)+1),gate:'B'+((i%6)+1),parking:'Bãi A'})
  }
  return flights
}
export async function GET(req){
  const {searchParams}=new URL(req.url)
  const all=searchParams.get('all')==='1'
  const airports=all?['SGN','HAN','DAD','VCA','CXR','PQC']:['SGN']
  const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL
  const skey=process.env.SUPABASE_SECRET_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase=createClient(url,skey)
  const results=[]
  for(const iata of airports){
    const flights=genMockForAirport(iata)
    const clusters=[{window:'08:00-12:00',count:25,suggest_depart:new Date().toISOString(),flights}]
    const payload={iata,flights,clusters,updated_at:new Date().toISOString(),is_mock:false,source:'MOCK_'+iata+'_THAY_DOI_THEO_SAN_BAY',rawCount:flights.length}
    try{
      const {error}=await supabase.from('flight_cache').upsert({iata,data:payload,updated_at:payload.updated_at},{onConflict:'iata'})
      if(error) results.push({iata,error:error.message})
      else results.push({iata,count:flights.length,source:payload.source,saved:true,origins:flights.slice(0,3).map(f=>f.origin).join(',')})
    }catch(e){ results.push({iata,error:e.message}) }
    await new Promise(r=>setTimeout(r,500))
  }
  return NextResponse.json({ok:true,message:'Da luu data theo tung san bay, bam san bay khac se thay doi theo',results})
}
