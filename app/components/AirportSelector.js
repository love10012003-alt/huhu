
'use client'
export default function AirportSelector({airport,setAirport,airports}){
  return (
    <div className="flex gap-2 overflow-x-auto">
      {airports.map(a=>(
        <button key={a.iata} onClick={()=>setAirport(a.iata)} className={`px-4 py-2.5 rounded-full font-bold text-[13px] whitespace-nowrap border transition-all ${airport===a.iata?'bg-[#1a73e8] text-white border-[#1a73e8]':'bg-white text-[#3c4043] border-[#dadce0]'}`}>
          {a.iata} • {a.city}
        </button>
      ))}
    </div>
  )
}
