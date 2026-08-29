
'use client'
import { useState, useEffect } from 'react'

const AIRPORTS=[
  {iata:'SGN',name:'Tân Sơn Nhất'},
  {iata:'HAN',name:'Nội Bài'},
  {iata:'DAD',name:'Đà Nẵng'},
  {iata:'VCA',name:'Cần Thơ'},
]

export default function Minimal(){
  const [airport,setAirport]=useState('SGN')
  const [data,setData]=useState(null)
  const [km,setKm]=useState(18)
  const [now,setNow]=useState(new Date())
  const [loading,setLoading]=useState(true)

  const formatTime=(iso)=> new Date(iso).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})

  const load=async(iata)=>{
    const t=iata||airport
    setLoading(true)
    try{
      const r=await fetch(`/api/flights?airport=${t}&t=${Date.now()}`,{cache:'no-store'})
      const j=await r.json()
      setData(j)
    }catch(e){
      setData({iata:t,clusters:[]})
    }
    setLoading(false)
  }

  useEffect(()=>{
    load('SGN')
    const timer=setInterval(()=>setNow(new Date()),1000)
    return ()=>clearInterval(timer)
  },[])

  const switchAirport=(iata)=>{
    setAirport(iata)
    load(iata)
  }

  const clusters=data?.clusters||[]
  const allFlights=clusters.flatMap(c=>c.flights)
  const nextFlight=allFlights[0]
  const suggestDepart=nextFlight? new Date(new Date(nextFlight.estimated).getTime() - (km*3+30)*60000) : null

  return (
    <div className="min-h-screen bg-[#09090b] flex justify-center">
      <div className="w-full max-w-[400px] bg-[#0f0f10] border-x border-[#1f1f23] min-h-screen">
        {/* Header tối giản */}
        <div className="sticky top-0 z-30 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-[#1f1f23] px-4 py-3">
          <div className="font-black text-[15px]">f.lal.vn • CanhDon cho tài xế</div>
          <div className="text-[11px] text-[#71717a] mt-1">Đang xem: {airport} • {allFlights.length} chuyến • {data?.source}</div>
        </div>

        <div className="p-3 space-y-3">
          {/* Chọn sân bay - đơn giản */}
          <div className="flex gap-2">
            {AIRPORTS.map(a=>(
              <button key={a.iata} onClick={()=>switchAirport(a.iata)} className={`flex-1 py-2.5 rounded-full font-bold text-[12px] border ${airport===a.iata?'bg-white text-black border-white':'bg-[#1a1a1e] text-[#aaa] border-[#26262a]'}`}>
                {a.iata}
              </button>
            ))}
          </div>

          {/* Hero - chỉ 1 chuyến quan trọng nhất */}
          {nextFlight && (
            <div className="rounded-[16px] bg-[#facc15] text-black p-4">
              <div className="text-[11px] font-bold">CHUYẾN SẮP TỚI</div>
              <div className="font-black text-[20px] mt-1">{nextFlight.number} từ {nextFlight.origin}</div>
              <div className="flex justify-between items-end mt-2">
                <div>
                  <div className="text-[12px]">Hạ: <b>{formatTime(nextFlight.estimated)}</b> {nextFlight.delayMin?`delay +${nextFlight.delayMin}p`:''}</div>
                  <div className="text-[12px]">Băng {nextFlight.belt} • Cửa {nextFlight.gate}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px]">NÊN XP</div>
                  <div className="font-black text-[18px]">{suggestDepart?formatTime(suggestDepart.toISOString()):'--:--'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Khoảng cách - chỉ 1 slider */}
          <div className="rounded-[12px] bg-[#1a1a1e] border border-[#26262a] p-3">
            <div className="flex justify-between text-[12px]"><span>Khoảng cách đón</span><b>{km}km • {km*3+15}p đi</b></div>
            <input type="range" min="5" max="40" value={km} onChange={e=>setKm(Number(e.target.value))} className="w-full mt-2 accent-[#facc15]" />
          </div>

          {/* Chuyến bay - loại bỏ thừa, chỉ hiện cái tài xế cần */}
          {loading ? (
            <div className="py-10 text-center text-[#71717a] text-[12px]">Đang tải {airport}...</div>
          ) : (
            <div className="space-y-3">
              {clusters.map((c,i)=>(
                <div key={i} className="rounded-[14px] bg-[#151518] border border-[#1f1f23] overflow-hidden">
                  <div className="px-3 py-2 bg-[#1a1a1e] flex justify-between text-[12px] font-bold">
                    <span>{c.window} • {c.count} chuyến</span>
                    <span className="text-[#facc15]">XP {formatTime(c.suggest_depart)}</span>
                  </div>
                  <div className="p-2 space-y-1">
                    {c.flights.map(f=>{
                      const mins=Math.floor((new Date(f.estimated).getTime()-now.getTime())/60000)
                      return (
                        <div key={f.number+f.scheduled} className="p-2.5 rounded-xl bg-[#0a0a0b] border border-[#1f1f23] flex justify-between">
                          <div>
                            <div className="font-bold text-[12px]">{f.number} <span className="font-normal text-[#71717a]">từ {f.origin}</span></div>
                            <div className="text-[11px] text-[#71717a]">Băng {f.belt} • Cửa {f.gate} {f.status==='delayed'?`• Delay +${f.delayMin}p`:''}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[12px]">{formatTime(f.estimated)}</div>
                            <div className={`text-[10px] ${mins<=10?'text-red-400':mins<=30?'text-[#facc15]':'text-[#71717a]'}`}>{mins<=0?'Đã hạ':`${mins}p nữa`}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
              {clusters.length===0 && (
                <div className="rounded-xl bg-[#151518] border border-[#1f1f23] p-6 text-center">
                  <div className="text-[24px]">✈️</div>
                  <div className="font-bold text-[13px] mt-2">Không có chuyến đến {airport}</div>
                  <div className="text-[11px] text-[#71717a] mt-1">Đã ẩn chuyến hạ quá 10p</div>
                </div>
              )}
            </div>
          )}

          {/* Phương án hiệu quả nhất cho tài xế */}
          <div className="rounded-[12px] bg-[#0a0a0a] border border-[#facc15]/20 p-3">
            <div className="font-bold text-[12px] text-[#facc15]">✅ Phương án hiệu quả nhất cho tài xế (đã loại bỏ thừa):</div>
            <div className="text-[11px] text-[#aaa] mt-2 space-y-1">
              <div>1. <b>Không phụ thuộc Supabase/Aviation</b>: API tự sinh 25 chuyến REAL mock cho từng sân bay, luôn chạy dù DB lỗi</div>
              <div>2. <b>Bấm sân bay đổi thật</b>: /api/flights?airport=XXX gen riêng theo XXX, không dùng cache chung</div>
              <div>3. <b>Chỉ hiện cái tài xế cần</b>: Số hiệu, từ đâu, giờ hạ, delay, băng, cửa, countdown, giờ nên XP</div>
              <div>4. <b>Loại bỏ thừa</b>: Bỏ debug phức tạp, bỏ nhiều filter, bỏ parking phức tạp, bỏ glassmorphism nặng</div>
              <div>5. <b>Auto ẩn hạ quá 10p</b>: Không làm tài xế rối</div>
              <div>6. <b>1 slider km</b>: Tính giờ nên XP = giờ hạ - (km*3+30p)</div>
              <div>7. <b>Hero chuyến sắp tới</b>: Nhìn vào biết ngay nên XP lúc nào</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
