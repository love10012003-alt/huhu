
'use client'
export default function MobileDetailSheet({flight,km}){
  if(!flight) return null
  const formatTime=(iso)=> new Date(iso).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})
  return (
    <div className="bottom-sheet bg-[#1c1c1e]/95 border-t border-white/10 rounded-t-[24px] -mt-6 relative z-10 min-h-[48vh] flex flex-col">
      {/* Handle */}
      <div className="flex justify-center py-2.5">
        <div className="w-10 h-1 rounded-full bg-white/30"></div>
      </div>

      {/* Header giống ảnh nhưng tối ưu mobile */}
      <div className="px-4 pb-3 flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-[20px] text-[#ffcc02]">{flight.callsign}</span>
            <span className="px-2 py-0.5 rounded bg-white/15 text-[11px]">{flight.number}</span>
            <span className="px-2 py-0.5 rounded bg-[#0a84ff] text-white text-[11px] font-bold">{flight.aircraft}</span>
          </div>
          <div className="text-[13px] text-white/60 mt-1">{flight.airline} • {flight.aircraftFull} • REG {flight.registration}</div>
        </div>
        <div className="w-[88px] h-[56px] rounded-xl bg-[#2c2c2e] overflow-hidden ml-3 border border-white/10">
          <div className="w-full h-full bg-gradient-to-br from-[#ff3b30] to-[#ff9500] flex items-center justify-center text-[24px]">✈️</div>
        </div>
      </div>

      {/* Route card lớn cho mobile */}
      <div className="mx-3 rounded-[16px] bg-white text-black p-4">
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <div className="font-black text-[28px] leading-none">{flight.origin}</div>
            <div className="text-[10px] text-black/60 uppercase mt-1 font-bold">Đà Nẵng</div>
            <div className="text-[11px] text-black/50 mt-1">Đã bay {flight.departedAgo}</div>
          </div>
          <div className="px-3">
            <div className="w-8 h-8 rounded-full bg-[#ffcc02]/20 flex items-center justify-center text-[16px]">✈️</div>
            <div className="w-[48px] h-[2px] bg-[#ffcc02] mt-1 rounded-full"></div>
          </div>
          <div className="text-center flex-1">
            <div className="font-black text-[28px] leading-none">{flight.destination}</div>
            <div className="text-[10px] text-black/60 uppercase mt-1 font-bold">Cần Thơ</div>
            <div className="text-[11px] font-bold text-[#0a84ff] mt-1">Hạ trong {flight.arrivingIn}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-black/10">
          <div className="bg-[#f2f2f7] rounded-xl p-3">
            <div className="text-[10px] text-black/50 uppercase font-bold tracking-wide">Độ cao</div>
            <div className="font-bold text-[16px] mt-1">{flight.altitude.toLocaleString()} ft</div>
            <div className="text-[11px] text-black/50">Barometric</div>
          </div>
          <div className="bg-[#f2f2f7] rounded-xl p-3">
            <div className="text-[10px] text-black/50 uppercase font-bold tracking-wide">Tốc độ</div>
            <div className="font-bold text-[16px] mt-1">{flight.speed} kts</div>
            <div className="text-[11px] text-black/50">Ground speed</div>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <div className="flex-1 bg-[#f2f2f7] rounded-full px-3 py-2 text-center text-[12px]"><b>Băng {flight.belt}</b> • Cửa {flight.gate}</div>
          <div className="flex-1 bg-[#f2f2f7] rounded-full px-3 py-2 text-center text-[12px]">Nên XP <b>{formatTime(new Date(new Date(flight.estimated).getTime()-km*3*60000-1800000).toISOString())}</b></div>
        </div>
      </div>

      {/* Action bar to lớn cho ngón tay */}
      <div className="grid grid-cols-5 gap-1 px-3 py-3 mt-auto border-t border-white/10">
        {[
          {icon:'🧊',label:'3D'},
          {icon:'🔗',label:'Lộ trình'},
          {icon:'ℹ️',label:'Chi tiết'},
          {icon:'📍',label:'Theo dõi'},
          {icon:'↗️',label:'Chia sẻ'},
        ].map(b=>(
          <button key={b.label} className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-white/10 active:bg-white/20 min-h-[56px]">
            <span className="text-[18px]">{b.icon}</span>
            <span className="text-[10px] font-medium">{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
