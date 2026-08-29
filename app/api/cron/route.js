
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
const AIRPORTS=['SGN','VCA','HAN','DAD','CXR','PQC']
async function fetchReal(iata,key){
  try{
    const url=`https://api.aviationstack.com/v1/flights?access_key=${key}&arr_iata=${iata}&limit=25`
    const res=await fetch(url,{cache:'no-store'})
    const json=await res.json()
    if(!json.data) return {flights:[],raw:0}
    const flights=json.data.map(f=>({number:f.flight?.iata||f.flight?.number,origin:f.departure?.iata||'???',scheduled:f.arrival?.scheduled,estimated:f.arrival?.estimated||f.arrival?.scheduled,status:f.arrival?.delay>5?'delayed':'on_time',delayMin:f.arrival?.delay||0,gate:f.arrival?.gate||'B1',belt:f.arrival?.baggage||'1',parking:'Bãi A',airline:(f.airline?.name||'').split(' ')[0]}))
    return {flights,raw:json.data.length}
  }catch(e){return {flights:[],raw:0}}
}
function cluster60(flights){
  const sorted=[...flights].sort((a,b)=> new Date(a.estimated)-new Date(b.estimated))
  const clusters=[];let cur=[];let start=null
  for(const f of sorted){const t=new Date(f.estimated).getTime();if(start===null){start=t;cur=[f];continue}if(t-start<=3600000){cur.push(f)}else{clusters.push(cur);cur=[f];start=t}}
  if(cur.length)clusters.push(cur)
  return clusters.map(c=>{const first=new Date(c[0].estimated);const last=new Date(c[c.length-1].estimated);return {window:`${first.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}-${last.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}`,count:c.length,suggest_depart:new Date(first.getTime()-45*60000).toISOString(),flights:c}})
}
export async function GET(){
  const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL
  const skey=process.env.SUPABASE_SECRET_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const akey=process.env.AVIATIONSTACK_KEY
  const supabase=createClient(url,skey)
  const results=[]
  for(const iata of AIRPORTS){
    const {flights,raw}=await fetchReal(iata,akey)
    let final=flights
    let is_mock=false
    if(final.length===0){
      const now=new Date();const add=(m)=>new Date(now.getTime()+m*60000).toISOString()
      final=[{number:'VJ786',origin:'HAN',scheduled:add(20),estimated:add(25),status:'delayed',delayMin:12,belt:'1',gate:'B1',parking:'Bãi A'},{number:'VN1321',origin:'VCA',scheduled:add(35),estimated:add(35),status:'on_time',belt:'2',gate:'B2',parking:'Bãi B'}]
      is_mock=true
    }
    const clusters=cluster60(final)
    const payload={iata,flights:final,clusters,updated_at:new Date().toISOString(),is_mock,rawCount:raw}
    await supabase.from('flight_cache').upsert({iata,data:payload,updated_at:payload.updated_at},{onConflict:'iata'})
    results.push({iata,count:final.length,is_mock,raw})
  }
  return NextResponse.json({ok:true,results})
}
