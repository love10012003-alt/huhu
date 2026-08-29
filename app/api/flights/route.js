
import { NextResponse } from 'next/server'
export const dynamic='force-dynamic'
// MINIMAL HIỆU QUẢ: Không phụ thuộc Supabase, luôn gen 25 chuyến riêng theo từng sân bay, bấm là đổi thật
function genForAirport(iata){
  const map={
    SGN:['HAN','DAD','VCA','CXR','PQC'],
    HAN:['SGN','DAD','VCA'],
    DAD:['SGN','HAN','CXR'],
    VCA:['SGN','HAN'],
    CXR:['SGN','HAN'],
    PQC:['SGN','HAN']
  }
  const origins=map[iata]||['HAN','DAD']
  const now=new Date()
  const flights=[]
  for(let i=0;i<25;i++){
    const origin=origins[i % origins.length]
    const base=new Date(now.getTime()+(5+i*7)*60000+Math.floor(Math.random()*10)*60000)
    const delay=Math.random()>0.7?Math.floor(Math.random()*25)+5:0
    const est=new Date(base.getTime()+delay*60000)
    flights.push({
      number:`VJ${780+i}`,
      origin,
      scheduled:base.toISOString(),
      estimated:est.toISOString(),
      status:delay>0?'delayed':'on_time',
      delayMin:delay,
      belt:String((i%4)+1),
      gate:`B${(i%6)+1}`,
      parking:'Bãi A'
    })
  }
  const sorted=[...flights].sort((a,b)=> new Date(a.estimated)-new Date(b.estimated))
  // Ẩn chuyến hạ quá 10p ngay từ API
  const cutoff=new Date(now.getTime()-10*60000).getTime()
  const filtered=sorted.filter(f=> new Date(f.estimated).getTime() > cutoff)
  // Gom 60p
  const clusters=[]
  let cur=[]
  let start=null
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
    source:`MINIMAL_${iata}_25CHUYEN_${filtered.length}CON_LAI_SAU_AN_10P`,
    rawCount:25
  }
}
export async function GET(req){
  const {searchParams}=new URL(req.url)
  const airport=(searchParams.get('airport')||'SGN').toUpperCase()
  // LUÔN GEN RIÊNG THEO TỪNG SÂN BAY, BẤM LÀ ĐỔI THẬT, KHÔNG PHỤ THUỘC DB
  const data=genForAirport(airport)
  return NextResponse.json(data)
}
