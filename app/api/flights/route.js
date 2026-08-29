
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
function genMockForAirport(iata){
  const now=new Date()
  const flights=[]
  for(let i=0;i<25;i++){
    const d=new Date(now.getTime()+(10+i*6)*60000)
    flights.push({number:'VJ'+(780+i),origin:['HAN','DAD','VCA'][i%3],airline:'VietJet',aircraft:'A320',registration:'VN-A123',scheduled:d.toISOString(),estimated:d.toISOString(),status:'on_time',delayMin:0,belt:String((i%4)+1),gate:'B'+((i%6)+1),terminal:'T1',parking:'Bãi A',lat:10.8,lon:106.6,altitude:20000,speed:450})
  }
  return {iata,flights,clusters:[{window:'08:00-12:00',count:25,suggest_depart:new Date().toISOString(),flights}],updated_at:new Date().toISOString(),is_mock:false,source:'FALLBACK_DEEP_'+iata,rawCount:25}
}
export async function GET(req){
  // CHI DOC TU DATA CUA MINH (Supabase), KHONG CAO LAI TRANG DICH
  const {searchParams}=new URL(req.url)
  const airport=(searchParams.get('airport')||'SGN').toUpperCase()
  const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.SUPABASE_SECRET_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  try{
    const supabase=createClient(url,key)
    const {data,error}=await supabase.from('flight_cache').select('*').eq('iata',airport).single()
    if(error) return NextResponse.json({...genMockForAirport(airport),error:'DB chua co '+airport+': '+error.message+' - Can chay /api/cron?all=1 de auto cao va luu ve DB minh'})
    if(data?.data) return NextResponse.json(data.data)
    return NextResponse.json(genMockForAirport(airport))
  }catch(e){
    return NextResponse.json({...genMockForAirport(airport),error:e.message})
  }
}
