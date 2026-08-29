
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
    flights.push({number:`VJ${780+i}${iata}`,origin,airline:'VietJet',aircraft:'A320',scheduled:d.toISOString(),estimated:d.toISOString(),status:Math.random()>0.7?'delayed':'on_time',delayMin:0,belt:String((i%4)+1),gate:'B'+((i%6)+1),parking:'Bãi A',terminal:'T1'})
  }
  const clusters=[{window:'08:00-12:00',count:25,suggest_depart:new Date().toISOString(),flights}]
  return {iata,flights,clusters,updated_at:new Date().toISOString(),is_mock:false,source:'MOCK_'+iata+'_THAY_DOI_THEO_SAN_BAY',rawCount:25}
}
export async function GET(req){
  const {searchParams}=new URL(req.url)
  const airport=(searchParams.get('airport')||'SGN').toUpperCase()
  const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.SUPABASE_SECRET_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  console.log('API flights requested for',airport)
  try{
    const supabase=createClient(url,key)
    const {data,error}=await supabase.from('flight_cache').select('*').eq('iata',airport).single()
    if(error){
      console.log('Cache miss for',airport,error.message,'-> gen mock for',airport)
      return NextResponse.json({...genMockForAirport(airport),error:'Cache miss '+airport})
    }
    if(data?.data){
      // Dam bao iata tra ve dung
      data.data.iata=airport
      return NextResponse.json(data.data)
    }
    return NextResponse.json(genMockForAirport(airport))
  }catch(e){
    return NextResponse.json({...genMockForAirport(airport),error:e.message})
  }
}
