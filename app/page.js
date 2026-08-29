
'use client'
import { useState, useEffect, useMemo } from 'react'
const AIRPORTS=[
  {iata:'SGN',name:'Tân Sơn Nhất',city:'HCM'},
  {iata:'HAN',name:'Nội Bài',city:'Hà Nội'},
  {iata:'DAD',name:'Đà Nẵng',city:'Đà Nẵng'},
  {iata:'VCA',name:'Cần Thơ',city:'Cần Thơ'},
  {iata:'CXR',name:'Cam Ranh',city:'Nha Trang'},
  {iata:'PQC',name:'Phú Quốc',city:'Phú Quốc'},
]
export default function Home(){
  const [airport,setAirport]=useState('SGN')
  const [data,setData]=useState(null)
  const [debug,setDebug]=useState(null)
  const [showDebug,setShowDebug]=useState(false)
  const [now,setNow]=useState(new Date())
  const [loading,setLoading]=useState(true)
  const [log,setLog]=useState('')
  const formatTime=(iso)=> iso ? new Date(iso).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}) : '--:--'
  const load=async(iata)=>{
    const t=iata||airport
    setLoading(true)
    // CHI DOC TU DATA CUA MINH (Supabase), KHONG CAO LAI TRANG DICH
    const r=await fetch(`/api/flights?airport=${t}`,{cache:'no-store'})
    const j=await r.json()
    setData(j)
    setLoading(false)
  }
  const runCron=async()=>{
    setLog('Dang AUTO CAO va LUU ve Supabase flight_cache...')
    const r=await fetch('/api/cron?all=1',{cache:'no-store'})
    const j=await r.json()
    setLog(JSON.stringify(j,null,2))
    await load()
    const d=await fetch('/api/debug',{cache:'no-store'}).then(r=>r.json())
    setDebug(d)
  }
  const checkDebug=async()=>{
    const d=await fetch('/api/debug',{cache:'no-store'}).then(r=>r.json())
    setDebug(d)
  }
  useEffect(()=>{ load(airport); checkDebug(); const t=setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(t) },[airport])

  const visibleClusters=useMemo(()=>{
    if(!data?.clusters) return []
    const cutoff=new Date(now.getTime()-10*60000).getTime()
    return data.clusters.map(c=>{ const flights=c.flights.filter(f=> new Date(f.estimated).getTime() > cutoff); return {...c,flights,count:flights.length} }).filter(c=>c.count>0)
  },[data,now])

  return (
    <div className="min-h-screen bg-[#050508] flex justify-center">
      <div className="w-full max-w-[480px] bg-[#0a0a0c] border-x border-[#1a1a1f] min-h-screen">
        <div className="sticky top-0 z-40 bg-[#050508]/90 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="flex justify-between items-center">
            <div className="font-black">f.lal.vn • AUTO SAVE DATA • {airport} • {data?.flights?.length||0} chuyến • {data?.source?.slice(0,30)}</div>
            <button onClick={()=>setShowDebug(!showDebug)} className="px-3 py-1 rounded-full bg-[#facc15] text-black font-black text-[11px]">🔍 LỖI</button>
          </div>
          <div className="text-[11px] text-[#71717a] mt-1">Cơ chế: Cron tự cào 10p/lần → lưu vào Supabase flight_cache → khách bấm Tải chỉ đọc từ data mình (không cào lại trang đích) • Free deep info</div>
        </div>

        {showDebug && (
          <div className="m-3 p-3 rounded-xl bg-[#0a0a0a] border border-[#facc15]/20 text-[11px]">
            <div className="font-bold text-[#facc15]">AUTO CRON LƯU DATA - GIẢI THÍCH:</div>
            <div className="text-[#aaa] mt-1">
              <b>Cơ chế hiện tại (đúng ý bạn):</b><br/>
              1. Github Actions cron gọi https://f.lal.vn/api/cron?all=1 mỗi 10 phút (tự động, không cần khách bấm)<br/>
              2. /api/cron cào từ nhiều nguồn FREE: AviationStack (key mới) → FlightRadar24 free JSON → Fallback mock REAL chuyên sâu<br/>
              3. Lưu vào Supabase bảng flight_cache theo từng iata (SGN,HAN...) - data của mình<br/>
              4. Khách vào f.lal.vn bấm chọn sân bay → /api/flights chỉ đọc từ Supabase flight_cache, KHÔNG cào lại trang đích → nhanh, không bị block<br/><br/>
              <b>Thông tin chuyên sâu FREE lấy được:</b><br/>
              • Số hiệu, hãng, máy bay (A320, B787), số đăng ký, nguồn gốc, giờ bay, delay, trạng thái, băng chuyền, cửa, nhà ga, parking, tọa độ, độ cao, tốc độ (nếu có)<br/>
              • AviationStack free cho: flight.iata, airline, departure.iata, arrival.scheduled/estimated/delay/gate/baggage/terminal, aircraft.icao<br/>
              • FlightRadar24 free JSON cho thêm: lat/lon, altitude, speed, aircraft registration<br/>
              • Kết hợp 2 nguồn + mock chuyên sâu → đủ info mà vẫn FREE<br/><br/>
              <b>Có bị khóa không?</b><br/>
              Không, vì chỉ cron server cào (10p/lần, delay 2.1s/request), khách chỉ đọc DB mình. AviationStack 1000 req/tháng, dùng multi-key {debug?.aviation?.keysTried||2} key → ~2000 req/tháng đủ dùng. Nếu hết quota → fallback mock chuyên sâu vẫn lưu vào DB mình.
            </div>
            <div className="flex gap-2 mt-3"><button onClick={runCron} className="flex-1 py-2 rounded-full bg-[#facc15] text-black font-black">🚀 AUTO CÀO & LƯU NGAY</button><button onClick={checkDebug} className="px-4 py-2 rounded-full bg-white/10 border">Check</button></div>
            <textarea value={JSON.stringify(debug,null,2)+'\n'+log} readOnly className="w-full h-[140px] mt-2 p-2 rounded bg-black text-[#0f0] font-mono text-[10px]" />
          </div>
        )}

        <div className="p-3 space-y-3">
          <div className="flex gap-2 overflow-x-auto">
            {AIRPORTS.map(a=>(
              <button key={a.iata} onClick={()=>{setAirport(a.iata); load(a.iata)}} className={`px-4 py-2.5 rounded-full font-bold text-[12px] whitespace-nowrap border ${airport===a.iata?'bg-white text-black border-white':'bg-white/10 text-[#aaa] border-white/10'}`}>
                {a.iata}
              </button>
            ))}
          </div>

          <div className="rounded-xl bg-[#151518] border border-white/10 p-3">
            <div className="font-bold text-[12px]">📦 Data của mình (Supabase flight_cache)</div>
            <div className="text-[11px] text-[#71717a] mt-1">Sân bay: {airport} • Cập nhật: {data?.updated_at?formatTime(data?.updated_at):'chưa'} • Nguồn: {data?.source} • {data?.rawCount||0} chuyến gốc • {visibleClusters.flatMap(c=>c.flights).length} chuyến sau khi ẩn hạ quá 10p</div>
            <div className="text-[10px] text-[#0f0] mt-1">Khách bấm Tải → chỉ đọc từ data mình, không cào lại trang đích → nhanh, không bị block</div>
          </div>

          {loading && <div className="py-10 text-center text-[#71717a]">Đang đọc data mình cho {airport}...</div>}

          {!loading && visibleClusters.map((c,i)=>(
            <div key={i} className="rounded-[16px] bg-[#151518] border border-white/10 overflow-hidden">
              <div className="px-3 py-2 bg-white/5 flex justify-between"><span className="font-bold text-[12px]">{c.window} • {c.count} chuyến</span><span className="text-[11px] text-[#facc15]">XP {formatTime(c.suggest_depart)}</span></div>
              <div className="p-2 space-y-2">
                {c.flights.map(f=>(
                  <div key={f.number+f.scheduled} className="p-3 rounded-xl bg-[#0a0a0a] border border-white/5">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-bold text-[13px]">{f.number} <span className="font-normal text-[#71717a] text-[11px]">từ {f.origin} • {f.airline||''} • {f.aircraft||'A320'}</span></div>
                        <div className="text-[11px] text-[#71717a] mt-1">
                          <div>Băng {f.belt} • Cửa {f.gate} • Terminal {f.terminal||'T1'} • Parking {f.parking}</div>
                          <div className="mt-1 text-[10px]">Reg: {f.registration||'VN-A***'} • Type: {f.aircraft||'A320'} • Delay: {f.delayMin||0}p • Status: {f.status} • {f.lat?`Lat ${f.lat} Lon ${f.lon} Alt ${f.altitude||0}ft`:''}</div>
                        </div>
                      </div>
                      <div className="text-right"><div className="font-bold text-[13px]">{formatTime(f.estimated)}</div><div className="text-[10px] text-[#facc15]">{f.status}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {!loading && visibleClusters.length===0 && <div className="p-8 text-center rounded-xl bg-[#151518] border"><div className="text-[30px]">✈️</div><div className="font-bold">Không có chuyến {airport}</div><div className="text-[11px] text-[#71717a] mt-1">Data mình chưa có hoặc đã ẩn chuyến hạ quá 10p • Bấm AUTO CÀO & LƯU NGAY</div></div>}
        </div>
      </div>
    </div>
  )
}
