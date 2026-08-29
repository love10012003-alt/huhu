
'use client'
export default function MobileMap({flights,selectedId,setSelectedId}){
  return (
    <div className="relative w-full h-[52vh] bg-[#c8e6c9] overflow-hidden">
      {/* Map background mobile */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#a5d6a7] to-[#81c784]">
        <div className="absolute top-[15%] left-[10%] text-[11px] font-bold text-[#2e7d32]/60">Svay Rieng</div>
        <div className="absolute top-[25%] right-[20%] text-[13px] font-black text-[#1b5e20]/80">Hồ Chí Minh</div>
        <div className="absolute top-[45%] left-[15%] text-[11px] text-[#2e7d32]/60">Cao Lãnh</div>
        <div className="absolute bottom-[25%] left-[15%] text-[14px] font-black text-[#1b5e20]">Cần Thơ</div>
        <div className="absolute bottom-[8%] left-[3%] text-[14px] font-black text-white/40">Google</div>
        <div className="absolute top-[50%] left-[30%] right-[20%] h-[2px] bg-[#4caf50]/40 rounded"></div>
        <div className="absolute top-[30%] bottom-[30%] left-[45%] w-[2px] bg-[#4caf50]/30 rounded"></div>
      </div>

      {/* Flight paths */}
      <svg className="absolute inset-0 w-full h-full">
        {flights.slice(0,3).map((f,i)=>(
          <path key={f.id} d={`M ${20+i*20}% ${70-i*10}% Q ${40+i*10}% ${50-i*5}% ${60+i*10}% ${30+i*5}%`} fill="none" stroke="#2e7d32" strokeWidth="2.5" opacity="0.6" />
        ))}
      </svg>

      {/* Planes - touch friendly 44px */}
      {flights.map(f=>{
        const x=15 + (f.lon-105.2)*60
        const y=75 - (f.lat-10.0)*70
        const isSelected=f.id===selectedId
        return (
          <button key={f.id} onClick={()=>setSelectedId(f.id)} className="absolute -translate-x-1/2 -translate-y-1/2 active:scale-95 transition-transform" style={{left:`${x}%`,top:`${y}%`}}>
            <div className={`min-w-[64px] min-h-[32px] px-2.5 py-1.5 rounded-full flex items-center justify-center gap-1 text-[12px] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.3)] border-2 ${isSelected?'bg-[#ffeb3b] text-black border-black scale-110':'bg-white text-black border-black/10'}`}>
              <span className="text-[14px]">✈️</span>{f.number}
            </div>
          </button>
        )
      })}

      {/* Top bar on map */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <div className="flex justify-between items-center">
          <div className="bg-black/70 backdrop-blur-md text-white text-[11px] px-3 py-1.5 rounded-full">🛰️ Live • {flights.length} chuyến • Chạm máy bay để xem</div>
          <div className="bg-white text-black text-[11px] px-2.5 py-1.5 rounded-full font-bold">15:30</div>
        </div>
      </div>
    </div>
  )
}
