
'use client'
export default function DistanceSlider({km,setKm}){
  return (
    <div className="bg-white border border-[#dadce0] rounded-[16px] p-4">
      <div className="flex justify-between text-[13px]"><span>Khoảng cách đón</span><b>{km}km • {km*3+15}p đi</b></div>
      <input type="range" min="5" max="40" value={km} onChange={e=>setKm(Number(e.target.value))} className="w-full mt-2 accent-[#1a73e8]" />
    </div>
  )
}
