
'use client'
export default function FlightDetailCard({flight}){
  if(!flight) return null
  return (
    <div className="flightradar-card rounded-b-[0] md:rounded-[16px] overflow-hidden border border-[#333] mt-0">
      {/* Header đen giống ảnh */}
      <div className="bg-[#1e1e1e] px-4 py-3 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-[18px] text-[#facc15]">{flight.callsign}</span>
            <span className="px-2 py-0.5 rounded bg-[#3a3a3a] text-[11px] text-[#ccc]">{flight.number}</span>
            <span className="px-2 py-0.5 rounded bg-[#1a73e8] text-white text-[11px] font-bold">{flight.aircraft}</span>
          </div>
          <div className="text-[13px] text-[#aaa] mt-0.5">{flight.airline}</div>
        </div>
        <div className="w-[140px] h-[70px] rounded overflow-hidden bg-[#333]">
          <img src={flight.photo} alt={flight.registration} className="w-full h-full object-cover" />
          <div className="text-[9px] text-[#888] text-right pr-1">© Photo</div>
        </div>
      </div>

      {/* Route info giống ảnh */}
      <div className="bg-[#e8e8e8] text-[#222] px-4 py-3 grid grid-cols-2 gap-4">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="font-black text-[24px]">{flight.origin}</div>
            <div className="text-[11px] text-[#666] uppercase">{flight.originName}</div>
          </div>
          <div className="text-[#facc15] text-[20px]">✈️</div>
          <div className="text-center">
            <div className="font-black text-[24px]">{flight.destination}</div>
            <div className="text-[11px] text-[#666] uppercase">{flight.destinationName}</div>
          </div>
        </div>
        <div className="border-l border-[#ccc] pl-4 grid grid-cols-1 gap-2">
          <div>
            <div className="text-[11px] text-[#666] uppercase font-bold">Barometric Alt.</div>
            <div className="font-medium text-[16px]">{flight.altitudeText}</div>
          </div>
          <div>
            <div className="text-[11px] text-[#666] uppercase font-bold">Ground Speed</div>
            <div className="font-medium text-[16px]">{flight.speedText}</div>
          </div>
        </div>
        <div className="col-span-2 flex justify-between text-[12px] text-[#666] border-t border-[#facc15] border-t-[3px] pt-2 mt-1">
          <span>Departed {flight.departedAgo}</span>
          <span className="font-bold">Arriving in {flight.arrivingIn}</span>
        </div>
      </div>

      {/* Aircraft info */}
      <div className="bg-[#d0d0d0] px-4 py-2 flex justify-between text-[13px] text-[#222]">
        <span>{flight.aircraftFull}</span>
        <span className="font-bold">REG {flight.registration} • Băng {flight.belt} • Cửa {flight.gate} • {flight.terminal} {flight.delayMin?`• Delay +${flight.delayMin}p`:''}</span>
      </div>

      {/* Action bar giống ảnh */}
      <div className="bg-[#2a2a2a] grid grid-cols-5 divide-x divide-[#444] text-[11px] text-[#aaa]">
        <button className="py-3 flex flex-col items-center gap-1 hover:bg-[#333]"><span className="text-[18px]">📦</span>3D view</button>
        <button className="py-3 flex flex-col items-center gap-1 hover:bg-[#333]"><span className="text-[18px]">🔗</span>Route</button>
        <button className="py-3 flex flex-col items-center gap-1 hover:bg-[#333] bg-[#333] text-white"><span className="text-[18px]">⬆️</span>More info</button>
        <button className="py-3 flex flex-col items-center gap-1 hover:bg-[#333]"><span className="text-[18px]">⤢</span>Follow</button>
        <button className="py-3 flex flex-col items-center gap-1 hover:bg-[#333]"><span className="text-[18px]">🔗</span>Share</button>
      </div>
    </div>
  )
}
