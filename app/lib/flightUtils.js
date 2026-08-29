
export function genMobileFlights(iata){
  const now=new Date()
  const flights=[]
  const map={VCA:['DAD','HAN','SGN'],SGN:['HAN','DAD','VCA'],HAN:['SGN','DAD'],DAD:['SGN','HAN']}
  const origins=map[iata]||['HAN','DAD']
  const airlines=[
    {code:'VJ',name:'VietJet',color:'#ff0000'},
    {code:'VN',name:'Vietnam Airlines',color:'#0066cc'},
    {code:'QH',name:'Bamboo',color:'#00aa44'},
  ]
  for(let i=0;i<10;i++){
    const origin=origins[i%origins.length]
    const al=airlines[i%airlines.length]
    const base=new Date(now.getTime()+(2+i*8)*60000)
    const delay=Math.random()>0.7?Math.floor(Math.random()*15)+5:0
    const est=new Date(base.getTime()+delay*60000)
    const alt=Math.floor(2000+Math.random()*5000)
    const speed=Math.floor(180+Math.random()*100)
    flights.push({
      id:`${al.code}${700+i}`,
      number:`${al.code}${700+i}`,
      callsign:`${al.code==='VJ'?'VJC':al.code==='VN'?'HVN':'BAV'}${700+i}`,
      origin,
      destination:iata,
      airline:al.name,
      aircraft:['A321','A320','A21N'][i%3],
      aircraftFull:['Airbus A321-211','Airbus A320-214','Airbus A321neo'][i%3],
      registration:`VN-A${640+i}`,
      altitude:alt,
      speed,
      belt:String((i%3)+1),
      gate:`B${(i%4)+1}`,
      status:delay>0?'delayed':'on_time',
      delayMin:delay,
      estimated:est.toISOString(),
      arrivingIn:`${Math.floor((est.getTime()-now.getTime())/60000)}m`,
      departedAgo:`${30+i*5}m ago`,
      lat:10.0 + Math.random()*0.6,
      lon:105.2 + Math.random()*0.8,
    })
  }
  return flights
}
