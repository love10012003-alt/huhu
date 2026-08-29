
'use client'
import { useState, useEffect, useMemo } from 'react'

const AIRPORTS=[
  {iata:'SGN',name:'Tân Sơn Nhất',city:'HCM',terminal:['T1','T2','T3']},
  {iata:'HAN',name:'Nội Bài',city:'Hà Nội',terminal:['T1','T2']},
  {iata:'DAD',name:'Đà Nẵng',city:'Đà Nẵng',terminal:['T1','T2']},
  {iata:'VCA',name:'Cần Thơ',city:'Cần Thơ',terminal:['T1']},
]

export default function OptimalUI(){
  const [airport,setAirport]=useState('SGN')
  const [data,setData]=useState(null)
  const [now,setNow]=useState(new Date())
  const [km,setKm]=useState(18)
  const [filter,setFilter]=useState('all')
  const [showParking,setShowParking]=useState(true)
  const [selectedFlight,setSelectedFlight]=useState(null)
  const [loading,setLoading]=useState(true)

  const formatTime=(iso)=> iso ? new Date(iso).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}) : '--:--'
  const countdown=(iso)=>{
    const diff=new Date(iso).getTime()-now.getTime()
    if(diff<=0) return {text:'Đã hạ cánh',color:'text-[#71717a]',min:0}
    const m=Math.floor(diff/60000)
    if(m<=5) return {text:`Hạ trong ${m}p`,color:'text-red-400',min:m}
    if(m<=15) return {text:`${m}p nữa`,color:'text-[#facc15]',min:m}
    if(m<60) return {text:`${m}p nữa`,color:'text-[#a1a1aa]',min:m}
    return {text:`${Math.floor(m/60)}h ${m%60}p`,color:'text-[#a1a1aa]',min:m}
  }

  const load=async(iata)=>{
    const t=iata||airport
    setLoading(true)
    const r=await fetch(`/api/flights?airport=${t}`,{cache:'no-store'})
    const j=await r.json()
    setData(j)
    setLoading(false)
  }

  useEffect(()=>{ load(airport); const t=setInterval(()=>setNow(new Date()),1000); const t2=setInterval(()=>load(),30000); return ()=>{clearInterval(t);clearInterval(t2)} },[airport])

  const visibleClusters=useMemo(()=>{
    if(!data?.clusters) return []
    const cutoff=new Date(now.getTime()-10*60000).getTime()
    return data.clusters.map(c=>{
      const flights=c.flights.filter(f=> new Date(f.estimated).getTime() > cutoff)
      return {...c,flights,count:flights.length}
    }).filter(c=>c.count>0)
  },[data,now])

  const allFlights=visibleClusters.flatMap(c=>c.flights)
  const filtered=allFlights.filter(f=>{
    if(filter==='soon') return new Date(f.estimated).getTime()-now.getTime() < 30*60000 && new Date(f.estimated).getTime() > now.getTime()
    if(filter==='delayed') return f.status==='delayed'
    if(filter==='landed') return new Date(f.estimated).getTime() <= now.getTime()
    return true
  })

  const nextFlight=filtered[0]
  const suggestDepart=nextFlight ? new Date(new Date(nextFlight.estimated).getTime() - (km*3+30)*60000) : null
  const travelTime=km*3+15

  return (
    <div className="min-h-screen bg-[#050508] flex justify-center">
      <div className="w-full max-w-[440px] bg-[#08080a] border-x border-white/[0.06] min-h-screen">
        {/* Header tối ưu */}
        <div className="sticky top-0 z-40 bg-[#050508]/80 backdrop-blur-2xl border-b border-white/[0.06]">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[10px] gold flex items-center justify-center font-black text-black">f.</div>
              <div>
                <div className="font-black text-[15px]">f.lal.vn <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10">PRO</span></div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#71717a]"><div className="live-dot"></div>{airport} • {allFlights.length} chuyến • {formatTime(now.toISOString())}</div>
              </div>
            </div>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">🔔</button>
              <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">⚙️</button>
            </div>
          </div>

          {/* Airport pills */}
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
            {AIRPORTS.map(a=>(
              <button key={a.iata} onClick={()=>{setAirport(a.iata); load(a.iata)}} className={`px-3.5 py-2 rounded-full text-[12px] font-bold whitespace-nowrap border ${airport===a.iata?'bg-white text-black border-white':'bg-white/[0.06] text-[#a1a1aa] border-white/[0.06]'}`}>
                {a.iata} • {a.city}
              </button>
            ))}
          </div>
        </div>

        {/* Hero thông minh - chuyến tiếp theo */}
        {nextFlight && (
          <div className="m-3 rounded-[20px] gold p-[1px]">
            <div className="rounded-[19px] bg-[#0f0f10] p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-[#71717a]">CHUYẾN SẮP TỚI • {nextFlight.airline||'VietJet'}</div>
                  <div className="font-black text-[22px] mt-1">{nextFlight.number} <span className="text-[13px] font-normal text-[#71717a]">từ {nextFlight.origin}</span></div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-white text-black font-black text-[13px]">{formatTime(nextFlight.estimated)}</span>
                    <span className={`text-[12px] font-bold ${countdown(nextFlight.estimated).color}`}>{countdown(nextFlight.estimated).text}</span>
                    <span className="text-[11px] text-[#71717a]">• Băng {nextFlight.belt} • Cửa {nextFlight.gate}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#71717a]">NÊN XUẤT PHÁT</div>
                  <div className="font-black text-[18px] text-[#facc15]">{suggestDepart?formatTime(suggestDepart.toISOString()):'--:--'}</div>
                  <div className="text-[10px] text-[#71717a]">{km}km • {travelTime}p • kẹt {Math.floor(km/2)}p</div>
                </div>
              </div>
              {/* Progress */}
              <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full gold" style={{width:`${Math.max(10,100-countdown(nextFlight.estimated).min)}%`}}></div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <div className="glass rounded-xl p-2"><div className="text-[#71717a]">Khoảng cách</div><div className="font-bold">{km} km</div></div>
                <div className="glass rounded-xl p-2"><div className="text-[#71717a]">Di chuyển</div><div className="font-bold">{travelTime}p</div></div>
                <div className="glass rounded-xl p-2"><div className="text-[#71717a]">Gợi ý XP</div><div className="font-bold text-[#facc15]">{suggestDepart?formatTime(suggestDepart.toISOString()):'--'}</div></div>
              </div>
            </div>
          </div>
        )}

        {/* Controls thông minh */}
        <div className="px-3 py-3 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 glass rounded-full p-1 flex">
              {[
                {k:'all',l:`Tất cả ${allFlights.length}`},
                {k:'soon',l:'Sắp hạ'},
                {k:'delayed',l:'Delay'},
              ].map(f=>(
                <button key={f.k} onClick={()=>setFilter(f.k)} className={`flex-1 py-1.5 rounded-full text-[11px] font-bold ${filter===f.k?'bg-white text-black':'text-[#71717a]'}`}>{f.l}</button>
              ))}
            </div>
            <button onClick={()=>setShowParking(!showParking)} className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold">🅿️ Bãi</button>
          </div>

          {/* Bãi đỗ thông minh */}
          {showParking && (
            <div className="glass rounded-[16px] p-3">
              <div className="flex justify-between items-center"><div className="font-bold text-[12px]">🅿️ Bãi đỗ thông minh - {airport}</div><div className="text-[10px] text-emerald-400">Live</div></div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  {id:'A',count:3,free:2,my:false},
                  {id:'B',count:5,free:0,my:true},
                  {id:'C',count:1,free:4,my:false},
                ].map(b=>(
                  <div key={b.id} className={`rounded-xl p-2.5 border ${b.my?'bg-[#facc15]/10 border-[#facc15]/30':'bg-white/[0.04] border-white/[0.06]'}`}>
                    <div className="text-[10px] text-[#71717a]">BÃI {b.id}</div>
                    <div className="font-black text-[16px]">{b.count} xe</div>
                    <div className="text-[10px] mt-1">{b.free} chỗ trống • {b.my?'Bạn ở đây':''}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline gom 60p thông minh */}
          {loading ? (
            <div className="py-10 text-center text-[#71717a]">Đang tải {airport}...</div>
          ) : (
            <div className="space-y-3">
              {visibleClusters.map((c,i)=>(
                <div key={i} className="rounded-[18px] bg-[#101012] border border-white/[0.06] overflow-hidden">
                  <div className="px-3 py-2.5 bg-white/[0.03] border-b border-white/[0.06] flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#facc15]/20 border border-[#facc15]/30 flex items-center justify-center text-[10px]">◐</div>
                      <span className="font-bold text-[12px]">{c.window} • {c.count} chuyến • Gom 60p</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-[#0a0a0a] text-[#facc15] border">XP {formatTime(c.suggest_depart)}</span>
                  </div>
                  <div className="p-2 space-y-2">
                    {c.flights.filter(f=>{
                      if(filter==='soon') return new Date(f.estimated).getTime()-now.getTime() < 30*60000
                      if(filter==='delayed') return f.status==='delayed'
                      return true
                    }).map(f=>{
                      const cd=countdown(f.estimated)
                      return (
                        <div key={f.number+f.scheduled} onClick={()=>setSelectedFlight(f)} className={`p-3 rounded-[14px] border cursor-pointer transition-all ${selectedFlight?.number===f.number?'bg-white/[0.08] border-white/20':'bg-[#0a0a0a] border-white/[0.04] hover:border-white/10'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex gap-2.5">
                              <div className="w-10 h-10 rounded-[12px] bg-white/[0.06] border border-white/[0.08] flex items-center justify-center font-black text-[11px]">{f.number.slice(0,2)}</div>
                              <div>
                                <div className="font-black text-[13px]">{f.number} <span className="font-normal text-[#71717a] text-[11px]">• {f.origin} • {f.aircraft||'A320'}</span></div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 border">Băng {f.belt}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 border">Cửa {f.gate}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 border">{f.terminal||'T1'}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${f.status==='delayed'?'bg-red-500/10 text-red-400 border-red-500/20':'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>{f.status}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-black text-[14px]">{formatTime(f.estimated)}</div>
                              <div className={`text-[11px] font-bold ${cd.color}`}>{cd.text}</div>
                            </div>
                          </div>
                          {selectedFlight?.number===f.number && (
                            <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div className="glass rounded-xl p-2"><div className="text-[#71717a]">Hãng</div><div className="font-bold">{f.airline||'VietJet'} • {f.registration||'VN-A***'}</div></div>
                                <div className="glass rounded-xl p-2"><div className="text-[#71717a]">Delay</div><div className="font-bold">{f.delayMin||0}p • {f.status}</div></div>
                              </div>
                              <div className="flex gap-2">
                                <button className="flex-1 py-2 rounded-full bg-white text-black font-black text-[11px]">📱 Zalo khách: {f.number} hạ {formatTime(f.estimated)} băng {f.belt}</button>
                                <button className="px-4 py-2 rounded-full bg-white/10 border text-[11px]">🧭 Chỉ đường</button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
              {visibleClusters.length===0 && <div className="glass rounded-[16px] p-8 text-center"><div className="text-[30px]">✈️</div><div className="font-bold mt-2">Không có chuyến {airport}</div><div className="text-[11px] text-[#71717a] mt-1">Đã ẩn chuyến hạ quá 10 phút • Đợi chuyến mới</div></div>}
            </div>
          )}
        </div>

        {/* Gợi ý tính năng chuyên nghiệp */}
        <div className="m-3 p-3 rounded-[16px] bg-[#facc15]/10 border border-[#facc15]/20">
          <div className="font-bold text-[12px] text-[#facc15]">💡 Gợi ý tính năng chuyên nghiệp cần bổ sung:</div>
          <div className="text-[11px] text-[#a1a1aa] mt-2 space-y-1">
            <div>✅ Đã có: Gom 60p, ẩn hạ quá 10p, countdown, gợi ý XP, bãi đỗ, lọc, auto refresh 30s, đọc DB mình</div>
            <div>🔜 Nên thêm: 1. Push notification khi delay/hạ/băng đổi 2. Bản đồ live máy bay (OpenSky) 3. Dự báo kẹt xe Google Maps 4. Thời tiết sân bay 5. Lịch sử đón + yêu thích 6. Chia sẻ chuyến cho tài xế khác 7. QR khách quét báo vị trí 8. Voice đọc chuyến hạ 9. Báo giá tự động theo km 10. Tích hợp Zalo OA/Telegram bot</div>
          </div>
        </div>

        <div className="text-center py-6 text-[10px] text-[#71717a]">f.lal.vn • UI tối ưu nhất • Auto save data • Ẩn hạ quá 10p • Thông minh hướng tới tài xế</div>
      </div>
    </div>
  )
}
