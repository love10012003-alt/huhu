
'use client'
import { useState, useEffect, useMemo } from 'react'

const AIRPORTS=[
  {iata:'SGN',name:'Tân Sơn Nhất',city:'Hồ Chí Minh',code:'SGN'},
  {iata:'HAN',name:'Nội Bài',city:'Hà Nội',code:'HAN'},
  {iata:'DAD',name:'Đà Nẵng',city:'Đà Nẵng',code:'DAD'},
  {iata:'VCA',name:'Cần Thơ',city:'Cần Thơ',code:'VCA'},
]

export default function GoogleStyle(){
  const [airport,setAirport]=useState('SGN')
  const [data,setData]=useState(null)
  const [now,setNow]=useState(new Date())
  const [km,setKm]=useState(18)
  const [loading,setLoading]=useState(true)

  const formatTime=(iso)=> new Date(iso).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})
  const formatDate=(iso)=> new Date(iso).toLocaleDateString('vi-VN',{weekday:'short',day:'2-digit',month:'2-digit'})

  const load=async(iata)=>{
    const t=(iata||airport).toUpperCase()
    setLoading(true)
    try{
      const r=await fetch(`/api/flights?airport=${t}&t=${Date.now()}`,{cache:'no-store'})
      const j=await r.json()
      setData(j)
    }catch(e){ setData({iata:t,clusters:[]}) }
    setLoading(false)
  }

  const switchAirport=(iata)=>{
    setAirport(iata)
    load(iata)
  }

  useEffect(()=>{
    load('SGN')
    const timer=setInterval(()=>setNow(new Date()),1000)
    return ()=>clearInterval(timer)
  },[])

  const visibleClusters=useMemo(()=>{
    if(!data?.clusters) return []
    const cutoff=new Date(now.getTime()-10*60000).getTime()
    return data.clusters.map(c=>{
      const flights=c.flights.filter(f=> new Date(f.estimated).getTime() > cutoff)
      return {...c,flights,count:flights.length}
    }).filter(c=>c.count>0)
  },[data,now])

  const allFlights=visibleClusters.flatMap(c=>c.flights)
  const nextFlight=allFlights[0]
  const suggestDepart=nextFlight? new Date(new Date(nextFlight.estimated).getTime() - (km*3+30)*60000) : null

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex justify-center">
      <div className="w-full max-w-[720px] bg-[#f8f9fa] min-h-screen">
        {/* Google Header - giống Google Flights */}
        <div className="sticky top-0 z-30 bg-white border-b border-[#dadce0]">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1a73e8] flex items-center justify-center text-white font-bold text-[16px]">f</div>
              <div>
                <div className="font-medium text-[22px] text-[#202124] tracking-tight">f.lal.vn</div>
                <div className="text-[12px] text-[#5f6368]">Chuyến bay đến • Theo dõi hạ cánh cho tài xế • Google Style</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[13px] text-[#5f6368]">
              <span className="w-2 h-2 rounded-full bg-[#34a853]"></span> Live • {formatTime(now.toISOString())}
            </div>
          </div>

          {/* Search bar kiểu Google */}
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {AIRPORTS.map(a=>(
                <button key={a.iata} onClick={()=>switchAirport(a.iata)} className={`${airport===a.iata?'google-pill-active':'google-pill'} transition-all`}>
                  {a.iata} • {a.city} {airport===a.iata?'• Đang xem':''}
                </button>
              ))}
            </div>
            <div className="mt-3 text-[12px] text-[#5f6368]">Đang xem: <b className="text-[#202124]">{airport} - {AIRPORTS.find(x=>x.iata===airport)?.name}</b> • Data iata: <b className="text-[#1a73e8]">{data?.iata||'...'}</b> • {allFlights.length} chuyến • Ẩn chuyến hạ quá 10p • Source: {data?.source?.slice(0,30)}</div>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-4">
          {/* Hero kiểu Google Flights - chuyến sắp tới */}
          {nextFlight && (
            <div className="google-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[12px] font-medium text-[#5f6368] tracking-wide uppercase">Chuyến bay sắp hạ cánh</div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#e8f0fe] flex items-center justify-center font-bold text-[#1a73e8] text-[14px]">{nextFlight.number.slice(0,2)}</div>
                    <div>
                      <div className="font-medium text-[22px] text-[#202124]">{nextFlight.number} <span className="text-[14px] text-[#5f6368] font-normal">từ {nextFlight.origin}</span></div>
                      <div className="text-[13px] text-[#5f6368] mt-0.5">Băng chuyền {nextFlight.belt} • Cửa {nextFlight.gate} • {nextFlight.aircraft||'A320'} {nextFlight.status==='delayed'?`• Trễ ${nextFlight.delayMin}p`:''}</div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] text-[#5f6368]">Hạ cánh dự kiến</div>
                  <div className="font-medium text-[28px] text-[#202124]">{formatTime(nextFlight.estimated)}</div>
                  <div className="text-[12px] text-[#1a73e8]">{Math.max(0,Math.floor((new Date(nextFlight.estimated).getTime()-now.getTime())/60000))} phút nữa • {nextFlight.status}</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-[16px] bg-[#f8f9fa] border border-[#dadce0] p-3">
                  <div className="text-[11px] text-[#5f6368] uppercase font-medium">Khoảng cách đón</div>
                  <div className="font-medium text-[16px] mt-1">{km} km</div>
                  <input type="range" min="5" max="40" value={km} onChange={e=>setKm(Number(e.target.value))} className="w-full mt-2 accent-[#1a73e8]" />
                </div>
                <div className="rounded-[16px] bg-[#f8f9fa] border border-[#dadce0] p-3">
                  <div className="text-[11px] text-[#5f6368] uppercase font-medium">Thời gian di chuyển</div>
                  <div className="font-medium text-[16px] mt-1">{km*3+15} phút</div>
                  <div className="text-[12px] text-[#5f6368] mt-1">Kẹt xe ~{Math.floor(km/2)}p</div>
                </div>
                <div className="rounded-[16px] bg-[#e8f0fe] border border-[#aecbfa] p-3">
                  <div className="text-[11px] text-[#1a73e8] uppercase font-medium">Nên xuất phát lúc</div>
                  <div className="font-medium text-[20px] mt-1 text-[#1a73e8]">{suggestDepart?formatTime(suggestDepart.toISOString()):'--:--'}</div>
                  <div className="text-[12px] text-[#5f6368] mt-1">{formatDate(suggestDepart?.toISOString())}</div>
                </div>
              </div>
            </div>
          )}

          {/* List chuyến bay kiểu Google */}
          {loading ? (
            <div className="google-card p-10 text-center">
              <div className="w-6 h-6 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-[14px] text-[#5f6368] mt-3">Đang tải chuyến bay đến {airport}...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleClusters.map((c,i)=>(
                <div key={i} className="google-card overflow-hidden">
                  <div className="px-5 py-3 bg-[#f8f9fa] border-b border-[#dadce0] flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#1a73e8]/10 flex items-center justify-center text-[12px]">✈️</div>
                      <span className="font-medium text-[14px] text-[#202124]">{c.window} • {c.count} chuyến đến {airport} • Gom 60 phút</span>
                    </div>
                    <span className="text-[12px] font-medium px-3 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8]">Nên XP {formatTime(c.suggest_depart)}</span>
                  </div>
                  <div className="divide-y divide-[#dadce0]">
                    {c.flights.map(f=>{
                      const mins=Math.floor((new Date(f.estimated).getTime()-now.getTime())/60000)
                      return (
                        <div key={f.number+f.scheduled} className="px-5 py-4 hover:bg-[#f8f9fa] transition-colors flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#f1f3f4] flex items-center justify-center font-medium text-[11px] text-[#3c4043]">{f.number.slice(0,2)}</div>
                            <div>
                              <div className="font-medium text-[14px] text-[#202124]">{f.number} <span className="text-[#5f6368] font-normal">• từ {f.origin} → {airport}</span></div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#f1f3f4] text-[#5f6368] border border-[#dadce0]">Băng {f.belt}</span>
                                <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#f1f3f4] text-[#5f6368] border border-[#dadce0]">Cửa {f.gate}</span>
                                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${f.status==='delayed'?'bg-[#fce8e6] text-[#c5221f] border-[#f6aea9]':'bg-[#e6f4ea] text-[#137333] border-[#b7e1cd]'}`}>{f.status==='delayed'?`Trễ +${f.delayMin}p`:'Đúng giờ'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-[16px] text-[#202124]">{formatTime(f.estimated)}</div>
                            <div className={`text-[12px] font-medium ${mins<=5?'text-[#c5221f]':mins<=15?'text-[#e8710a]':'text-[#5f6368]'}`}>{mins<=0?'Đã hạ cánh':`${mins} phút nữa`}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              {visibleClusters.length===0 && (
                <div className="google-card p-10 text-center">
                  <div className="text-[32px]">✈️</div>
                  <div className="font-medium text-[16px] mt-2">Không có chuyến bay đến {airport}</div>
                  <div className="text-[13px] text-[#5f6368] mt-1">Đã ẩn các chuyến hạ cánh quá 10 phút • Dữ liệu tự động cập nhật</div>
                </div>
              )}
            </div>
          )}

          {/* Footer Google Style */}
          <div className="google-card p-4">
            <div className="font-medium text-[13px] text-[#202124]">f.lal.vn • Google Style • Full code hiệu quả cho tài xế</div>
            <div className="text-[12px] text-[#5f6368] mt-1">• Bấm sân bay đổi thật 100% • Ẩn chuyến hạ quá 10p • Gom 60p thông minh • Hero gợi ý XP • Luôn chạy không phụ thuộc Supabase/Aviation • Style Material Design 3 của Google</div>
          </div>
        </div>
      </div>
    </div>
  )
}
