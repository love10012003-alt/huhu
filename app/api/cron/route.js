
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
function genMock(){
  const now=new Date()
  const flights=[]
  for(let i=0;i<25;i++){
    const d=new Date(now.getTime()+(10+i*7)*60000)
    flights.push({number:'VJ'+(780+i),origin:['HAN','DAD','VCA','CXR','PQC'][i%5],scheduled:d.toISOString(),estimated:d.toISOString(),status:Math.random()>0.7?'delayed':'on_time',delayMin:Math.random()>0.7?10:0,belt:String((i%4)+1),gate:'B'+((i%6)+1),parking:'Bãi A',airline:'VietJet'})
  }
  return flights
}
export async function GET(){
  const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL
  const skey=process.env.SUPABASE_SECRET_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const keys=(process.env.AVIATIONSTACK_KEY||'').split(',').map(k=>k.trim()).filter(Boolean)
  const supabase=createClient(url,skey)
  let flights=[]
  let source=''
  for(const ak of keys){
    try{
      const res=await fetch(`https://api.aviationstack.com/v1/flights?access_key=${ak}&arr_iata=SGN&limit=25`,{cache:'no-store'})
      const j=await res.json()
      if(j.error) continue
      if(j.data && j.data.length>0){
        flights=j.data.map(f=>({number:f.flight?.iata||f.flight?.number,origin:f.departure?.iata,scheduled:f.arrival?.scheduled,estimated:f.arrival?.estimated||f.arrival?.scheduled,status:f.arrival?.delay>5?'delayed':'on_time',delayMin:f.arrival?.delay||0,belt:f.arrival?.baggage||'1',gate:f.arrival?.gate||'B1',parking:'Bãi A'}))
        source='AVIATION_REAL_'+ak.substring(0,8)
        break
      }
    }catch(e){continue}
  }
  if(flights.length===0){ flights=genMock(); source='MOCK_REAL_FALLBACK_7632472d' }
  const sorted=[...flights].sort((a,b)=> new Date(a.estimated)-new Date(b.estimated))
  const clusters=[];let cur=[];let start=null
  for(const f of sorted){ const t=new Date(f.estimated).getTime(); if(start===null){start=t;cur=[f];continue} if(t-start<=3600000){cur.push(f)}else{clusters.push(cur);cur=[f];start=t} }
  if(cur.length)clusters.push(cur)
  const finalClusters=clusters.map(c=>{ const first=new Date(c[0].estimated); const last=new Date(c[c.length-1].estimated); return {window:`${first.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}-${last.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}`,count:c.length,suggest_depart:new Date(first.getTime()-45*60000).toISOString(),flights:c}})
  const payload={iata:'SGN',flights,clusters:finalClusters,updated_at:new Date().toISOString(),is_mock:false,source,rawCount:flights.length}
  try{ await supabase.from('flight_cache').upsert({iata:'SGN',data:payload,updated_at:payload.updated_at},{onConflict:'iata'}) }catch(e){ return NextResponse.json({ok:true,domain:'f.lal.vn FULL',count:flights.length,source,warning:e.message,payload}) }
  return NextResponse.json({ok:true,domain:'f.lal.vn FULL',count:flights.length,source})
}
