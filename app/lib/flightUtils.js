
export const AIRPORTS=[
  {iata:'SGN',name:'Tân Sơn Nhất',city:'HCM',origins:['HAN','DAD','VCA','CXR','PQC']},
  {iata:'HAN',name:'Nội Bài',city:'Hà Nội',origins:['SGN','DAD','VCA']},
  {iata:'DAD',name:'Đà Nẵng',city:'Đà Nẵng',origins:['SGN','HAN','CXR']},
  {iata:'VCA',name:'Cần Thơ',city:'Cần Thơ',origins:['SGN','HAN']},
]
export function genFlightsForAirport(iata){
  const airport=AIRPORTS.find(a=>a.iata===iata)||AIRPORTS[0]
  const now=new Date()
  const flights=[]
  for(let i=0;i<25;i++){
    const origin=airport.origins[i % airport.origins.length]
    const base=new Date(now.getTime()+(5+i*6)*60000+Math.floor(Math.random()*10)*60000)
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
      aircraft:['A320','A321','B787'][i%3],
      airline:'VietJet'
    })
  }
  return flights
}
export function clusterFlights(flights){
  const sorted=[...flights].sort((a,b)=> new Date(a.estimated)-new Date(b.estimated))
  const cutoff=new Date(Date.now()-10*60000).getTime()
  const filtered=sorted.filter(f=> new Date(f.estimated).getTime() > cutoff)
  const clusters=[]
  let cur=[],start=null
  for(const f of filtered){
    const t=new Date(f.estimated).getTime()
    if(start===null){ start=t; cur=[f]; continue }
    if(t-start<=3600000){ cur.push(f) } else { clusters.push(cur); cur=[f]; start=t }
  }
  if(cur.length) clusters.push(cur)
  return clusters.map(c=>{
    const first=new Date(c[0].estimated)
    const last=new Date(c[c.length-1].estimated)
    return {
      window:`${first.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}-${last.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}`,
      count:c.length,
      suggest_depart:new Date(first.getTime()-45*60000).toISOString(),
      flights:c
    }
  })
}
