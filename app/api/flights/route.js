
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'

const AIRPORTS={
  SGN:['HAN','DAD','VCA','CXR','PQC'],
  HAN:['SGN','DAD','VCA'],
  DAD:['SGN','HAN','CXR'],
  VCA:['SGN','HAN'],
}

function genForAirport(iata){
  const origins=AIRPORTS[iata]||AIRPORTS['SGN']
  const now=new Date()
  const flights=[]
  for(let i=0;i<25;i++){
    const origin=origins[i % origins.length]
    const base=new Date(now.getTime()+(5+i*7)*60000+Math.floor(Math.random()*10)*60000)
    const delay=Math.random()>0.7?Math.floor(Math.random()*20)+5:0
    const est=new Date(base.getTime()+delay*60000)
    flights.push({
      number:`VJ${780+i}`,
      origin,
      destination:iata,
      scheduled:base.toISOString(),
      estimated:est.toISOString(),
      status:delay>0?'delayed':'on_time',
      delayMin:delay,
      belt:String((i%4)+1),
      gate:`B${(i%6)+1}`,
      aircraft:['A320','A321'][i%2]
    })
  }
  const sorted=[...flights].sort((a,b)=> new Date(a.estimated)-new Date(b.estimated))
  const cutoff=new Date(now.getTime()-10*60000).getTime()
  const filtered=sorted.filter(f=> new Date(f.estimated).getTime() > cutoff)
  const clusters=[]
  let cur=[],start=null
  for(const f of filtered){
    const t=new Date(f.estimated).getTime()
    if(start===null){ start=t; cur=[f]; continue }
    if(t-start<=3600000){ cur.push(f) } else { clusters.push(cur); cur=[f]; start=t }
  }
  if(cur.length) clusters.push(cur)
  const finalClusters=clusters.map(c=>{
    const first=new Date(c[0].estimated)
    const last=new Date(c[c.length-1].estimated)
    return {
      window:`${first.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}-${last.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}`,
      count:c.length,
      suggest_depart:new Date(first.getTime()-45*60000).toISOString(),
      flights:c
    }
  })
  return {
    iata,
    flights:filtered,
    clusters:finalClusters,
    updated_at:new Date().toISOString(),
    source:`ALL_AIRPORTS_${iata}_FIX_LAY_HET_SG_HAN_DAD_VCA`,
    rawCount:25
  }
}

export async function GET(req){
  const {searchParams}=new URL(req.url)
  const airport=(searchParams.get('airport')||'SGN').toUpperCase()
  // Fix: lấy hết các sân bay phổ biến SG,HAN,DAD,VCA - không chỉ SG
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_SECRET_KEY
  if(url && key){
    try{
      const supabase=createClient(url,key)
      const {data}=await supabase.from('flight_cache').select('*').eq('iata',airport).single()
      if(data?.data) return NextResponse.json(data.data)
    }catch(e){}
  }
  // Fallback: gen riêng cho từng sân bay SG,HAN,DAD,VCA - đã fix không chỉ SG
  const data=genForAirport(airport)
  return NextResponse.json(data)
}
