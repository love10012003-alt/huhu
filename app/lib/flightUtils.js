
export const AIRPORTS={
  SGN:{name:'Tân Sơn Nhất',city:'HCM',lat:10.8188,lon:106.652},
  HAN:{name:'Nội Bài',city:'Hà Nội',lat:21.221,lon:105.803},
  DAD:{name:'Đà Nẵng',city:'Đà Nẵng',lat:16.0439,lon:108.199},
  VCA:{name:'Cần Thơ',city:'Cần Thơ',lat:10.0851,lon:105.711},
}

export function genDetailedFlights(targetIata){
  const now=new Date()
  const airlines=[
    {code:'VJ',name:'VietJet Air',icao:'VJC',color:'#ed1c24'},
    {code:'VN',name:'Vietnam Airlines',icao:'HVN',color:'#0066b3'},
    {code:'QH',name:'Bamboo Airways',icao:'BAV',color:'#0a4d2e'},
    {code:'0V',name:'Vasco',icao:'VFC',color:'#f59e0b'},
  ]
  const aircrafts=[
    {type:'A321',full:'Airbus A321-211',regPrefix:'VN-A6'},
    {type:'A320',full:'Airbus A320-214',regPrefix:'VN-A5'},
    {type:'A21N',full:'Airbus A321neo',regPrefix:'VN-A5'},
    {type:'B787',full:'Boeing 787-9',regPrefix:'VN-A8'},
  ]
  const flights=[]
  const originsMap={
    SGN:['HAN','DAD','VCA','CXR','PQC'],
    HAN:['SGN','DAD','VCA'],
    DAD:['SGN','HAN','VCA'],
    VCA:['DAD','HAN','SGN'],
  }
  const origins=originsMap[targetIata]||['HAN','DAD']

  for(let i=0;i<12;i++){
    const origin=origins[i % origins.length]
    const dest=targetIata
    const airline=airlines[i % airlines.length]
    const ac=aircrafts[i % aircrafts.length]
    const flightNum=`${airline.code}${700+i}`
    const icaoNum=`${airline.icao}${700+i}`
    const reg=`${ac.regPrefix}${40+i}`
    const alt=Math.floor(3500+Math.random()*8000)
    const speed=Math.floor(180+Math.random()*120)
    const departedMins=Math.floor(30+Math.random()*90)
    const arrivingMins=Math.floor(1+Math.random()*15)
    const originInfo=AIRPORTS[origin]||AIRPORTS['SGN']
    const destInfo=AIRPORTS[dest]||AIRPORTS['VCA']
    // fake lat/lon near Can Tho for VCA, near SGN for SGN etc
    const lat=destInfo.lat + (Math.random()-0.5)*1.5
    const lon=destInfo.lon + (Math.random()-0.5)*1.5
    const hasPath=i<3
    flights.push({
      id:`${icaoNum}_${i}`,
      callsign:icaoNum,
      number:flightNum,
      icao:icaoNum,
      airline:airline.name,
      airlineCode:airline.code,
      airlineIcao:airline.icao,
      aircraft:ac.type,
      aircraftFull:ac.full,
      registration:reg,
      origin,
      originName:AIRPORTS[origin]?.name||origin,
      destination:dest,
      destinationName:AIRPORTS[dest]?.name||dest,
      departedAgo:`${Math.floor(departedMins/60)>0?Math.floor(departedMins/60)+'h ':''}${departedMins%60}m ago`.replace('0h ',''),
      departedMins,
      arrivingIn:`${arrivingMins}m`,
      arrivingMins,
      altitude:alt,
      altitudeText:`${alt.toLocaleString()} ft`,
      speed,
      speedText:`${speed} kts`,
      baroAlt:alt,
      groundSpeed:speed,
      lat,
      lon,
      hasPath,
      path:hasPath?Array.from({length:8},(_,k)=>({lat:originInfo.lat + (destInfo.lat-originInfo.lat)*k/8 + (Math.random()-0.5)*0.2, lon:originInfo.lon + (destInfo.lon-originInfo.lon)*k/8 + (Math.random()-0.5)*0.2})):[],
      status:arrivingMins<3?'landing':arrivingMins<10?'approaching':'cruising',
      belt:String((i%4)+1),
      gate:`B${(i%6)+1}`,
      terminal:['T1','T2'][i%2],
      scheduled:new Date(now.getTime()-(departedMins-arrivingMins)*60000).toISOString(),
      estimated:new Date(now.getTime()+arrivingMins*60000).toISOString(),
      photo:`https://picsum.photos/seed/${reg}/300/180`,
      delayMin:Math.random()>0.7?Math.floor(Math.random()*20)+5:0,
    })
  }
  return flights
}
