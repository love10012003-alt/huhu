
'use client'
import { useState, useEffect, useMemo } from 'react'
import AirportSelector from './components/AirportSelector'
import FlightCluster from './components/FlightCluster'
import HeroNextFlight from './components/HeroNextFlight'
import DistanceSlider from './components/DistanceSlider'
import { AIRPORTS, genFlightsForAirport, clusterFlights } from './lib/flightUtils'

export default function Home(){
  const [airport,setAirport]=useState('SGN')
  const [clusters,setClusters]=useState([])
  const [allFlights,setAllFlights]=useState([])
  const [km,setKm]=useState(18)
  const [now,setNow]=useState(new Date())
  const [loading,setLoading]=useState(true)
  const [source,setSource]=useState('')

  const load=async(iata)=>{
    const target=(iata||airport).toUpperCase()
    setLoading(true)
    try{
      // Ưu tiên lấy từ API (đã fix lấy hết SG,HAN,DAD,VCA)
      const r=await fetch(`/api/flights?airport=${target}&t=${Date.now()}`,{cache:'no-store'})
      const j=await r.json()
      if(j.clusters && j.clusters.length>0){
        setClusters(j.clusters)
        setAllFlights(j.clusters.flatMap(c=>c.flights))
        setSource(j.source||'API')
      }else{
        // Fallback gen local theo từng sân bay
        const flights=genFlightsForAirport(target)
        const cls=clusterFlights(flights)
        setClusters(cls)
        setAllFlights(cls.flatMap(c=>c.flights))
        setSource('LOCAL_'+target)
      }
    }catch(e){
      const flights=genFlightsForAirport(target)
      const cls=clusterFlights(flights)
      setClusters(cls)
      setAllFlights(cls.flatMap(c=>c.flights))
      setSource('FALLBACK_'+target)
    }
    setLoading(false)
  }

  const switchAirport=(iata)=>{
    setAirport(iata)
    load(iata)
  }

  useEffect(()=>{
    load('SGN')
    const t=setInterval(()=>setNow(new Date()),1000)
    return ()=>clearInterval(t)
  },[])

  const nextFlight=allFlights[0]
  const suggestDepart=nextFlight? new Date(new Date(nextFlight.estimated).getTime()-(km*3+30)*60000) : null

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex justify-center">
      <div className="w-full max-w-[720px] min-h-screen">
        <div className="sticky top-0 z-30 bg-white border-b border-[#dadce0] px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="font-medium text-[20px]">f.lal.vn • Modular</div>
            <div className="flex gap-2">
              <a href="/login" className="px-4 py-2 rounded-full border border-[#dadce0] text-[12px] font-medium">Đăng nhập</a>
              <a href="/register" className="px-4 py-2 rounded-full bg-[#1a73e8] text-white text-[12px] font-medium">Đăng ký</a>
            </div>
          </div>
          <div className="mt-3">
            <AirportSelector airport={airport} setAirport={switchAirport} airports={AIRPORTS} />
          </div>
          <div className="mt-2 text-[11px] text-[#5f6368]">Đang xem: {airport} • {allFlights.length} chuyến • Source: {source} • Đã fix lấy hết SG,HAN,DAD,VCA • Ẩn hạ quá 10p</div>
        </div>

        <div className="p-4 space-y-4">
          <HeroNextFlight flight={nextFlight} km={km} suggestDepart={suggestDepart} now={now} />
          <DistanceSlider km={km} setKm={setKm} />

          {loading ? (
            <div className="bg-white border rounded-[24px] p-10 text-center text-[#5f6368]">Đang tải {airport}...</div>
          ) : (
            <div className="space-y-4">
              {clusters.map((c,i)=><FlightCluster key={i} cluster={c} now={now} />)}
              {clusters.length===0 && <div className="bg-white border rounded-[24px] p-10 text-center">Không có chuyến đến {airport} • Đã ẩn hạ quá 10p</div>}
            </div>
          )}

          <div className="bg-white border rounded-[16px] p-4 text-[11px] text-[#5f6368]">
            <div className="font-medium text-[#202124]">Cấu trúc modular dễ sửa:</div>
            <div className="mt-1">• /app/components/AirportSelector.js - chọn sân bay SG,HAN,DAD,VCA</div>
            <div>• /app/components/FlightCard.js - card chuyến</div>
            <div>• /app/components/FlightCluster.js - cụm gom 60p</div>
            <div>• /app/components/HeroNextFlight.js - chuyến sắp tới</div>
            <div>• /app/components/DistanceSlider.js - slider km</div>
            <div>• /app/components/AuthForm.js - đăng ký/đăng nhập</div>
            <div>• /app/lib/flightUtils.js - genFlightsForAirport cho từng sân bay, đã fix lấy hết SG,HAN,DAD,VCA</div>
            <div>• /api/flights - API lấy hết 4 sân bay phổ biến, không chỉ SG</div>
            <div>• /api/auth/login, /api/auth/register - đăng ký thành viên</div>
          </div>
        </div>
      </div>
    </div>
  )
}
