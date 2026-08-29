
'use client'
export default function HeroNextFlight({flight,km,suggestDepart,now}){
  if(!flight) return null
  const formatTime=(iso)=> new Date(iso).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})
  const mins=Math.max(0,Math.floor((new Date(flight.estimated).getTime()-now.getTime())/60000))
  return (
    <div className="bg-white border border-[#dadce0] rounded-[24px] p-5 shadow-[0_1px_2px_rgba(60,64,67,0.3)]">
      <div className="text-[11px] font-medium text-[#5f6368] uppercase">Chuyến sắp tới • {flight.destination}</div>
      <div className="mt-2 flex justify-between">
        <div>
          <div className="font-medium text-[22px]">{flight.number} từ {flight.origin}</div>
          <div className="text-[13px] text-[#5f6368]">Băng {flight.belt} • Cửa {flight.gate} • {flight.aircraft} {flight.status==='delayed'?`• Delay ${flight.delayMin}p`:''}</div>
        </div>
        <div className="text-right">
          <div className="font-medium text-[26px]">{formatTime(flight.estimated)}</div>
          <div className="text-[12px] text-[#1a73e8]">{mins}p nữa</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-[16px] bg-[#f8f9fa] border p-3"><div className="text-[11px] text-[#5f6368]">Khoảng cách</div><div className="font-medium">{km} km</div></div>
        <div className="rounded-[16px] bg-[#f8f9fa] border p-3"><div className="text-[11px] text-[#5f6368]">Di chuyển</div><div className="font-medium">{km*3+15}p</div></div>
        <div className="rounded-[16px] bg-[#e8f0fe] border border-[#aecbfa] p-3"><div className="text-[11px] text-[#1a73e8]">Nên XP</div><div className="font-medium text-[#1a73e8]">{suggestDepart?formatTime(suggestDepart.toISOString()):'--:--'}</div></div>
      </div>
    </div>
  )
}
