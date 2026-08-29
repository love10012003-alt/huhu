
'use client'
export default function FlightCard({flight,now}){
  const formatTime=(iso)=> new Date(iso).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})
  const mins=Math.floor((new Date(flight.estimated).getTime()-now.getTime())/60000)
  return (
    <div className="px-5 py-4 hover:bg-[#f8f9fa] flex justify-between items-center border-b border-[#dadce0] last:border-0">
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 rounded-full bg-[#f1f3f4] flex items-center justify-center font-medium text-[11px]">{flight.number.slice(0,2)}</div>
        <div>
          <div className="font-medium text-[14px]">{flight.number} <span className="text-[#5f6368] font-normal">từ {flight.origin} → {flight.destination}</span></div>
          <div className="flex gap-1.5 mt-1">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f1f3f4] border">Băng {flight.belt}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f1f3f4] border">Cửa {flight.gate}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${flight.status==='delayed'?'bg-[#fce8e6] text-[#c5221f]':'bg-[#e6f4ea] text-[#137333]'}`}>{flight.status==='delayed'?`Delay +${flight.delayMin}p`:'On time'}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium text-[15px]">{formatTime(flight.estimated)}</div>
        <div className={`text-[11px] ${mins<=5?'text-[#c5221f]':mins<=15?'text-[#e8710a]':'text-[#5f6368]'}`}>{mins<=0?'Đã hạ':`${mins}p nữa`}</div>
      </div>
    </div>
  )
}
