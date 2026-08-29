
'use client'
export default function AirportSelector({airport,setAirport}){
  const airports=[
    {iata:'VCA',name:'Cần Thơ'},
    {iata:'SGN',name:'Tân Sơn Nhất'},
    {iata:'HAN',name:'Nội Bài'},
    {iata:'DAD',name:'Đà Nẵng'},
  ]
  return (
    <div className="flex gap-2">
      {airports.map(a=>(
        <button key={a.iata} onClick={()=>setAirport(a.iata)} className={`px-4 py-2 rounded-full text-[13px] font-bold border ${airport===a.iata?'bg-[#facc15] text-black border-[#facc15]':'bg-[#1a1a1a] text-[#aaa] border-[#333]'}`}>
          {a.iata}
        </button>
      ))}
    </div>
  )
}
