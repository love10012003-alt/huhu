
'use client'
export default function FlightMap({flights,selectedId,setSelectedId,targetIata}){
  return (
    <div className="relative w-full h-[420px] map-bg overflow-hidden rounded-[16px] border border-white/10">
      {/* Fake map background giống Flightradar24 */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-[20%] left-[10%] w-[80%] h-[1px] bg-[#5a5a5a]/30"></div>
        <div className="absolute top-[40%] left-[5%] w-[90%] h-[1px] bg-[#5a5a5a]/20"></div>
        <div className="absolute top-[60%] left-[10%] w-[80%] h-[1px] bg-[#5a5a5a]/20"></div>
        <div className="absolute left-[30%] top-[10%] w-[1px] h-[80%] bg-[#5a5a5a]/20"></div>
        <div className="absolute left-[60%] top-[5%] w-[1px] h-[90%] bg-[#5a5a5a]/20"></div>
      </div>
      
      {/* Labels giống ảnh */}
      <div className="absolute top-[18%] left-[8%] text-[12px] font-medium text-[#333]">Svay Rieng</div>
      <div className="absolute top-[22%] left-[38%] text-[12px] font-medium text-[#333]">Bavet</div>
      <div className="absolute top-[35%] right-[15%] text-[14px] font-bold text-[#222]">Thành phố<br/>Hồ Chí Minh</div>
      <div className="absolute top-[38%] right-[22%] text-[12px] text-[#555]">Bến Lức</div>
      <div className="absolute top-[48%] left-[12%] text-[12px] text-[#555]">Cao Lãnh</div>
      <div className="absolute top-[52%] left-[38%] text-[12px] text-[#555]">Cai Lậy • Mỹ Tho</div>
      <div className="absolute top-[58%] left-[42%] text-[12px] text-[#555]">Bến Tre</div>
      <div className="absolute bottom-[18%] left-[12%] text-[16px] font-bold text-[#222] flex items-center gap-1"><span className="w-5 h-5 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-[10px]">📍</span>Cần Thơ</div>
      <div className="absolute bottom-[12%] left-[18%] text-[12px] text-[#555]">Trà Vinh</div>
      <div className="absolute bottom-[5%] left-[2%] text-[18px] font-bold text-[#666] opacity-60">Google</div>

      {/* Flight paths - green line như ảnh */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {flights.filter(f=>f.hasPath).map(f=>(
          <polyline key={f.id} points={f.path.map(p=>`${((p.lon-104.5)/3)*100}%,${((11.5-p.lat)/2.5)*100}%`).join(' ')} fill="none" stroke={f.id===selectedId?'#facc15':'#22c55e'} strokeWidth={f.id===selectedId?'3':'2'} strokeDasharray={f.status==='landing'?'0':'5,5'} opacity="0.8" />
        ))}
      </svg>

      {/* Planes */}
      {flights.map(f=>{
        const x=((f.lon-104.5)/3)*100
        const y=((11.5-f.lat)/2.5)*100
        const isSelected=f.id===selectedId
        return (
          <button key={f.id} onClick={()=>setSelectedId(f.id)} className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${isSelected?'z-20 scale-125':''}`} style={{left:`${x}%`,top:`${y}%`}}>
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold shadow-lg border ${isSelected?'bg-[#facc15] text-black border-black':'bg-[#fef08a] text-black border-black/20'}`}>
              <span className="text-[16px]">{f.airlineCode==='VJ'?'✈️':f.airlineCode==='VN'?'✈️':'🛩️'}</span>
              <span>{f.number}</span>
            </div>
            {isSelected && <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-[#facc15] rotate-45 -translate-x-1/2"></div>}
          </button>
        )
      })}

      <div className="absolute top-2 left-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded-full">Hiển thị nhiều thông tin hơn như Flightradar24 • {flights.length} chuyến đến {targetIata} • Bấm máy bay để xem chi tiết</div>
    </div>
  )
}
