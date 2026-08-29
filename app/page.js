
'use client'
import { useState, useEffect } from 'react'
import FlightMap from './components/FlightMap'
import FlightDetailCard from './components/FlightDetailCard'
import AirportSelector from './components/AirportSelector'
import { genDetailedFlights } from './lib/flightUtils'

export default function DetailedPage(){
  const [airport,setAirport]=useState('VCA')
  const [flights,setFlights]=useState([])
  const [selectedId,setSelectedId]=useState(null)
  const [now,setNow]=useState(new Date())

  const load=(iata)=>{
    const target=iata||airport
    const data=genDetailedFlights(target)
    setFlights(data)
    if(data.length>0) setSelectedId(data[0].id)
  }

  useEffect(()=>{
    load('VCA')
    const t=setInterval(()=>setNow(new Date()),1000)
    return ()=>clearInterval(t)
  },[])

  const switchAirport=(iata)=>{
    setAirport(iata)
    load(iata)
  }

  const selectedFlight=flights.find(f=>f.id===selectedId)||flights[0]

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex justify-center">
      <div className="w-full max-w-[480px] bg-black min-h-screen border-x border-[#222]">
        {/* Header giống Flightradar24 */}
        <div className="sticky top-0 z-30 bg-[#1a1a1a] border-b border-[#333] px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#facc15] flex items-center justify-center font-black text-black">f</div>
              <div>
                <div className="font-bold text-[14px]">f.lal.vn • Flightradar24 Style • Hiển thị nhiều thông tin hơn</div>
                <div className="text-[11px] text-[#888]">Bấm máy bay trên bản đồ để xem chi tiết như ảnh bạn gửi • {flights.length} chuyến đến {airport}</div>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <AirportSelector airport={airport} setAirport={switchAirport} />
          </div>
        </div>

        {/* Map giống ảnh bạn gửi */}
        <FlightMap flights={flights} selectedId={selectedId} setSelectedId={setSelectedId} targetIata={airport} />

        {/* Detail card giống ảnh */}
        <FlightDetailCard flight={selectedFlight} />

        {/* List thêm */}
        <div className="p-3 space-y-2">
          <div className="text-[12px] font-bold text-[#aaa] uppercase tracking-wide">Tất cả {flights.length} chuyến đến {airport} • Bấm để xem trên bản đồ</div>
          {flights.map(f=>(
            <button key={f.id} onClick={()=>setSelectedId(f.id)} className={`w-full text-left px-3 py-2.5 rounded-xl border flex justify-between items-center ${selectedId===f.id?'bg-[#facc15]/10 border-[#facc15]/30':'bg-[#1a1a1a] border-[#333]'}`}>
              <div>
                <div className="font-bold text-[13px]">{f.number} <span className="font-normal text-[#888]">từ {f.origin} → {f.destination}</span> <span className="text-[#facc15]">{f.aircraft}</span></div>
                <div className="text-[11px] text-[#888]">{f.airline} • REG {f.registration} • {f.altitudeText} • {f.speedText} • Băng {f.belt}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-[12px]">{f.arrivingIn}</div>
                <div className="text-[10px] text-[#888]">{f.status}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 text-[11px] text-[#666] text-center border-t border-[#222] mt-4">
          Hiển thị nhiều thông tin hơn như Flightradar24: Map live, đường bay xanh, callsign VJC703/VJ703, loại máy bay A321, hãng VietJet, DAD→VCA, Departed 01:53 ago, Arriving in 00:03, Barometric Alt 4,225ft, Ground Speed 238kts, Airbus A321-211, REG VN-A641, 3D view, Route, More info, Follow, Share • Full code modular
        </div>
      </div>
    </div>
  )
}
