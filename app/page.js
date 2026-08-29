
'use client'
import { useState, useEffect } from 'react'
import MobileMap from './components/MobileMap'
import MobileDetailSheet from './components/MobileDetailSheet'
import { genMobileFlights } from './lib/flightUtils'

export default function MobileVisual(){
  const [airport,setAirport]=useState('VCA')
  const [flights,setFlights]=useState([])
  const [selectedId,setSelectedId]=useState(null)
  const [km,setKm]=useState(18)

  const load=(iata)=>{
    const data=genMobileFlights(iata||airport)
    setFlights(data)
    if(data.length>0) setSelectedId(data[0].id)
  }

  useEffect(()=>{ load('VCA') },[])

  const switchAirport=(iata)=>{
    setAirport(iata)
    load(iata)
  }

  const selected=flights.find(f=>f.id===selectedId)||flights[0]

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-[430px] bg-black min-h-screen relative flex flex-col overflow-hidden border-x border-[#222]">
        {/* Header mobile */}
        <div className="bg-black text-white px-4 py-3 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#ffcc02] flex items-center justify-center font-black text-black">f</div>
            <div>
              <div className="font-bold text-[14px]">f.lal.vn • Mobile</div>
              <div className="text-[10px] text-white/50">Trực quan cho điện thoại</div>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[
              {iata:'VCA',label:'VCA'},
              {iata:'SGN',label:'SGN'},
              {iata:'HAN',label:'HAN'},
              {iata:'DAD',label:'DAD'},
            ].map(a=>(
              <button key={a.iata} onClick={()=>switchAirport(a.iata)} className={`min-w-[44px] min-h-[36px] px-3 rounded-full text-[12px] font-bold border ${airport===a.iata?'bg-white text-black border-white':'bg-white/10 text-white/70 border-white/10'}`}>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Map chiếm 52% màn hình - tối ưu 1 tay */}
        <MobileMap flights={flights} selectedId={selectedId} setSelectedId={setSelectedId} />

        {/* Bottom sheet chi tiết - kéo lên được, trực quan mobile */}
        <MobileDetailSheet flight={selected} km={km} />

        {/* List chuyến ngang - swipe được */}
        <div className="bg-[#0a0a0a] border-t border-white/10 px-3 py-2.5">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {flights.map(f=>(
              <button key={f.id} onClick={()=>setSelectedId(f.id)} className={`flex-shrink-0 min-h-[44px] px-3.5 py-2 rounded-full text-[12px] font-medium border whitespace-nowrap ${selectedId===f.id?'bg-[#ffcc02] text-black border-[#ffcc02]':'bg-[#1c1c1e] text-white/70 border-white/10'}`}>
                {f.number} • {f.origin}→{f.destination} • {f.arrivingIn}
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center mt-2.5">
            <div className="text-[10px] text-white/40">Khoảng cách đón: {km}km • {km*3+15}p • Kéo lên để xem nhiều hơn • Tối ưu 1 tay</div>
            <input type="range" min="5" max="35" value={km} onChange={e=>setKm(Number(e.target.value))} className="w-24 accent-[#ffcc02]" />
          </div>
        </div>

        <div className="h-[env(safe-area-inset-bottom)] bg-black"></div>
      </div>
    </div>
  )
}
