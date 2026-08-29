
'use client'
import { useState, useEffect, useMemo } from 'react'

const AIRPORTS=[
  {iata:'SGN',name:'Tân Sơn Nhất',city:'HCM',origin:['HAN','DAD','VCA','CXR','PQC']},
  {iata:'HAN',name:'Nội Bài',city:'Hà Nội',origin:['SGN','DAD','VCA','CXR']},
  {iata:'DAD',name:'Đà Nẵng',city:'Đà Nẵng',origin:['SGN','HAN','CXR','PQC']},
  {iata:'VCA',name:'Cần Thơ',city:'Cần Thơ',origin:['SGN','HAN']},
  {iata:'CXR',name:'Cam Ranh',city:'Nha Trang',origin:['SGN','HAN','DAD']},
  {iata:'PQC',name:'Phú Quốc',city:'Phú Quốc',origin:['SGN','HAN']},
]

export default function Home(){
  const [airport,setAirport]=useState('SGN')
  const [data,setData]=useState(null)
  const [now,setNow]=useState(new Date())
  const [loading,setLoading]=useState(true)
  const [log,setLog]=useState('')
  const [debug,setDebug]=useState(null)

  const formatTime=(iso)=> iso ? new Date(iso).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}) : '--:--'

  const load=async(newIata)=>{
    const target=(newIata||airport).toUpperCase()
    console.log('LOADING AIRPORT:',target)
    setLoading(true)
    setData(null)
    try{
      const r=await fetch(`/api/flights?airport=${target}&t=${Date.now()}`,{cache:'no-store'})
      const j=await r.json()
      console.log('DATA FOR',target,':',j.iata,j.flights?.length,j.source)
      // Kiểm tra xem iata trả về có đúng với airport bấm không
      if(j.iata!==target){
        console.warn('IATA mismatch!',j.iata,target)
      }
      setData(j)
    }catch(e){
      setData({iata:target,flights:[],clusters:[],error:e.message})
    }
    setLoading(false)
  }

  const switchAirport=(newIata)=>{
    console.log('SWITCH TO',newIata)
    setAirport(newIata)
    load(newIata)
  }

  const runCronAll=async()=>{
    setLog('Đang cào và lưu tất cả sân bay...')
    const r=await fetch('/api/cron?all=1',{cache:'no-store'})
    const j=await r.json()
    setLog(JSON.stringify(j,null,2))
    await load(airport)
    const d=await fetch('/api/debug',{cache:'no-store'}).then(r=>r.json())
    setDebug(d)
  }

  const checkDebug=async()=>{
    const d=await fetch('/api/debug',{cache:'no-store'}).then(r=>r.json())
    setDebug(d)
  }

  useEffect(()=>{
    load('SGN')
    checkDebug()
    const t=setInterval(()=>setNow(new Date()),1000)
    return ()=>clearInterval(t)
  },[])

  const visibleClusters=useMemo(()=>{
    if(!data?.clusters) return []
    const cutoff=new Date(now.getTime()-10*60000).getTime()
    return data.clusters.map(c=>{
      const flights=c.flights.filter(f=> new Date(f.estimated).getTime() > cutoff)
      return {...c,flights,count:flights.length}
    }).filter(c=>c.count>0)
  },[data,now])

  return (
    <div className="min-h-screen bg-[#050508] flex justify-center">
      <div className="w-full max-w-[480px] bg-[#0a0a0c] border-x border-white/10 min-h-screen">
        <div className="sticky top-0 z-40 bg-[#050508]/90 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="font-black text-[14px]">f.lal.vn • Đang xem: <span className="text-[#facc15] text-[18px]">{airport}</span> • Data iata: <span className="text-[#0f0]">{data?.iata||'...'}</span> • {data?.flights?.length||0} chuyến • {data?.source?.slice(0,20)}</div>
          <div className="text-[11px] text-[#71717a] mt-1">Kiểm tra cào: /api/flights?airport=SGN → trả về iata SGN, /api/flights?airport=HAN → iata HAN. Bấm sân bay phải đổi iata.</div>
        </div>

        <div className="p-3 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {AIRPORTS.map(a=>(
              <button key={a.iata} onClick={()=>switchAirport(a.iata)} className={`py-3 rounded-xl font-black text-[13px] border-2 ${airport===a.iata?'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105':'bg-white/10 text-white border-white/20'}`}>
                {a.iata}<br/><span className="text-[10px] font-normal">{a.city}</span><br/><span className="text-[9px]">{airport===a.iata?'ĐANG XEM':''}</span>
              </button>
            ))}
          </div>

          <div className="rounded-xl bg-[#151518] border border-white/10 p-3">
            <div className="font-bold text-[12px]">🔍 Kiểm tra việc cào dữ liệu như thế nào:</div>
            <div className="text-[11px] text-[#aaa] mt-2 space-y-1">
              <div>1. Mở <a href="/api/debug" target="_blank" className="text-[#facc15] underline">/api/debug</a> → xem Supabase ok không, Aviation key còn quota không</div>
              <div>2. Mở <a href="/api/flights?airport=SGN" target="_blank" className="text-[#facc15] underline">/api/flights?airport=SGN</a> → phải thấy "iata":"SGN", flights từ {AIRPORTS.find(a=>a.iata==='SGN')?.origin.join(',')}</div>
              <div>3. Mở <a href="/api/flights?airport=HAN" target="_blank" className="text-[#facc15] underline">/api/flights?airport=HAN</a> → phải thấy "iata":"HAN", flights từ SGN,DAD...</div>
              <div>4. Nếu Supabase lỗi fetch failed → vào supabase.com restore project mqdzxmtuyvbyvklijippn → chạy SQL tạo bảng</div>
              <div>5. Bấm nút Cào tất cả sân bay dưới → lưu vào flight_cache theo từng iata riêng</div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={runCronAll} className="flex-1 py-2.5 rounded-full bg-[#facc15] text-black font-black text-[11px]">🚀 Cào & Lưu tất cả 6 sân bay vào DB mình</button>
            </div>
            <div className="mt-2 text-[10px] text-[#0f0]">Log: {log.slice(0,300)}</div>
          </div>

          <div className="rounded-xl bg-[#0a0a0a] border border-[#facc15]/20 p-3">
            <div className="font-bold text-[12px] text-[#facc15]">Đang hiển thị sân bay: {airport} - {AIRPORTS.find(a=>a.iata===airport)?.name}</div>
            <div className="text-[11px] text-[#aaa] mt-1">Data iata trả về: {data?.iata} • Source: {data?.source} • Số chuyến: {data?.flights?.length} • Cập nhật: {data?.updated_at?formatTime(data?.updated_at):'...'}</div>
            <div className="text-[11px] mt-1">Các chuyến bay đến {airport} phải từ: <span className="text-[#0f0] font-bold">{AIRPORTS.find(a=>a.iata===airport)?.origin.join(', ')}</span></div>
            {data?.iata!==airport && <div className="mt-2 p-2 rounded bg-red-500/20 text-red-400 font-bold text-[11px]">❌ LỖI: Bấm {airport} nhưng data trả về iata={data?.iata} → chưa fix! Bản này đã fix phải khớp.</div>}
            {data?.iata===airport && <div className="mt-2 p-2 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">✅ ĐÚNG: Bấm {airport} → data iata={data?.iata} khớp! Mọi thứ thay đổi theo sân bay.</div>}
          </div>

          {loading && <div className="py-10 text-center"><div className="w-6 h-6 border-2 border-[#facc15] border-t-transparent rounded-full animate-spin mx-auto"></div><div className="text-[11px] text-[#71717a] mt-2">Đang tải data cho {airport}...</div></div>}

          {!loading && visibleClusters.map((c,i)=>(
            <div key={i} className="rounded-[16px] bg-[#151518] border border-white/10 overflow-hidden">
              <div className="px-3 py-2 bg-white/5 flex justify-between"><span className="font-bold text-[12px]">{c.window} • {c.count} chuyến đến {airport}</span><span className="text-[11px] text-[#facc15]">XP {formatTime(c.suggest_depart)}</span></div>
              <div className="p-2 space-y-1">
                {c.flights.map(f=>(
                  <div key={f.number+f.scheduled} className="p-2 rounded-xl bg-[#0a0a0a] border border-white/5 flex justify-between">
                    <div><div className="font-bold text-[12px]">{f.number} <span className="text-[#71717a]">từ {f.origin} → {airport}</span></div><div className="text-[10px] text-[#71717a]">Băng {f.belt} • Cửa {f.gate} • {f.aircraft||'A320'}</div></div>
                    <div className="text-right"><div className="font-bold text-[12px]">{formatTime(f.estimated)}</div><div className="text-[10px] text-[#facc15]">{f.status}</div></div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {!loading && visibleClusters.length===0 && <div className="p-8 text-center rounded-xl bg-[#151518] border"><div className="font-bold">Không có chuyến đến {airport}</div><div className="text-[11px] text-[#71717a] mt-1">Bấm Cào & Lưu tất cả sân bay để có data</div></div>}
        </div>
      </div>
    </div>
  )
}
