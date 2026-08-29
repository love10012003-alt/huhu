
'use client'
import { useState, useEffect } from 'react'
const AIRPORTS=[
  {iata:'SGN',name:'Tân Sơn Nhất'},{iata:'HAN',name:'Nội Bài'},{iata:'VCA',name:'Cần Thơ'},{iata:'DAD',name:'Đà Nẵng'},{iata:'CXR',name:'Cam Ranh'},{iata:'PQC',name:'Phú Quốc'},
]
export default function Home(){
  const [airport,setAirport]=useState('SGN')
  const [data,setData]=useState(null)
  const [debug,setDebug]=useState(null)
  const [showDebug,setShowDebug]=useState(false)
  const [parking,setParking]=useState({A:3,B:5,C:1})
  const [km,setKm]=useState(25)
  const [showZalo,setShowZalo]=useState(null)
  const [loading,setLoading]=useState(true)
  const [log,setLog]=useState('')
  const formatTime=(iso)=> iso ? new Date(iso).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}) : '--:--'
  const load=async()=>{
    setLoading(true)
    try{
      const r=await fetch(`/api/flights?airport=${airport}`,{cache:'no-store'})
      const j=await r.json()
      setData(j)
    }catch(e){ setData({flights:[],clusters:[],is_mock:true,error:e.message}) }
    setLoading(false)
  }
  const runCron=async()=>{
    setLog('Dang nap 25 chuyen REAL tu key moi 7632472d...')
    const r=await fetch('/api/cron',{cache:'no-store'})
    const j=await r.json()
    setLog(JSON.stringify(j,null,2))
    await load()
    await checkDebug()
  }
  const checkDebug=async()=>{
    const r=await fetch('/api/debug',{cache:'no-store'})
    const j=await r.json()
    setDebug(j)
    return j
  }
  useEffect(()=>{ load(); checkDebug() },[airport])
  const isReal=data && !data.is_mock
  const clusters=data?.clusters||[]
  return (
    <div className="min-h-screen bg-[#09090b] flex justify-center">
      <div className="w-full max-w-[440px] bg-[#0f0f10] border-x border-[#1f1f23] min-h-screen pb-[90px]">
        <header className="sticky top-0 z-30 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-[#1f1f23]">
          <div className="px-4 py-3 flex justify-between items-center">
            <div>
              <div className="font-black text-[14px] flex items-center gap-2">f.lal.vn • CanhDon
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#facc15] text-black">PRO MAX FULL</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border ${isReal?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':'bg-[#26262a] text-[#71717a]'}`}>{isReal?'REAL':'MOCK'} • {data?.flights?.length||0}</span>
              </div>
              <div className="text-[11px] text-[#71717a] mt-1">{airport} • {data?.updated_at?`Live ${formatTime(data?.updated_at)}`:''} • {data?.source||'cache'} • Key 7632472d</div>
            </div>
            <button onClick={()=>setShowDebug(!showDebug)} className="text-[10px] font-black px-3 py-1.5 rounded-full bg-[#facc15] text-black">🔍 LỖI</button>
          </div>
        </header>
        {showDebug && (
          <div className="m-3 p-3 rounded-[16px] bg-[#0a0a0b] border border-[#facc15]/30">
            <div className="flex justify-between"><div className="font-black text-[12px] text-[#facc15]">🔍 KIỂM TRA LỖI</div><button onClick={()=>setShowDebug(false)} className="text-[10px] px-2 py-1 rounded-full bg-[#1a1a1e] border">Đóng</button></div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-[#151518] border border-[#1f1f23]"><div className="text-[#71717a]">Supabase</div><div className={debug?.supabase?.ok?'text-emerald-400 font-bold':'text-red-400 font-bold'}>{debug?.supabase?.ok?'✅ OK':`❌ ${debug?.supabase?.error?.slice(0,60)}`}</div></div>
              <div className="p-2 rounded-xl bg-[#151518] border border-[#1f1f23]"><div className="text-[#71717a]">Aviation key mới</div><div className={debug?.aviation?.ok?'text-emerald-400 font-bold':'text-amber-400 font-bold'}>{debug?.aviation?.ok?`✅ OK ${debug?.aviation?.count}`:`❌ ${debug?.aviation?.error?.slice(0,60)}`}</div><div className="text-[10px] text-[#71717a]">Keys: {debug?.aviation?.keysTried}</div></div>
            </div>
            <div className="mt-2 flex gap-2"><button onClick={runCron} className="flex-1 py-2.5 rounded-full bg-[#facc15] text-black font-black text-[11px]">🚀 Nạp REAL key mới</button><button onClick={checkDebug} className="px-4 py-2.5 rounded-full bg-[#1a1a1e] border text-[11px]">🔄 Check</button></div>
            <textarea value={JSON.stringify(debug,null,2)+'\n\n'+log} readOnly className="w-full h-[100px] mt-2 p-2 rounded-xl bg-black text-[#0f0] font-mono text-[10px]" />
            <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify(debug,null,2)+'\n'+log); alert('Đã copy!')}} className="w-full mt-2 py-2 rounded-full bg-white text-black font-black text-[11px]">📋 COPY BÁO CÁO</button>
          </div>
        )}
        <div className="p-3 space-y-3">
          <div className="flex gap-2">
            <select value={airport} onChange={e=>setAirport(e.target.value)} className="flex-1 px-3 py-3 rounded-[14px] bg-[#1a1a1e] border border-[#26262a] font-bold text-[13px]">
              {AIRPORTS.map(a=><option key={a.iata} value={a.iata}>{a.iata} - {a.name}</option>)}
            </select>
            <button onClick={load} className="px-4 rounded-[14px] bg-white text-black font-black text-[12px]">Gom 60p</button>
          </div>
          <div className="rounded-[14px] bg-[#151518] border border-[#1f1f23] p-3">
            <div className="flex justify-between items-center"><span className="text-[12px] font-bold">📏 Khoảng cách đón: {km}km</span><span className="text-[10px] text-[#71717a]">Nên XP trước 45p</span></div>
            <input type="range" min="5" max="50" value={km} onChange={e=>setKm(e.target.value)} className="w-full mt-2 accent-[#facc15]" />
          </div>
          <div className="rounded-[14px] bg-[#151518] border border-[#1f1f23] p-3">
            <div className="text-[12px] font-bold">🅿️ Bãi đỗ realtime - {airport}</div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {Object.entries(parking).map(([k,v])=>(
                <div key={k} className="rounded-[12px] bg-[#1a1a1e] border border-[#26262a] p-2 text-center">
                  <div className="text-[11px] text-[#71717a]">Bãi {k}</div>
                  <div className="font-black text-[18px] text-[#facc15]">{v}</div>
                  <button onClick={()=>setParking(p=>({...p,[k]:p[k]+1}))} className="mt-1 w-full py-1 rounded-full bg-white text-black text-[10px] font-bold">Tôi ở đây</button>
                </div>
              ))}
            </div>
          </div>
          {loading && <div className="py-10 text-center"><div className="w-6 h-6 border-2 border-[#facc15] border-t-transparent rounded-full animate-spin mx-auto"></div><div className="text-[12px] text-[#71717a] mt-2">Đang tải 25 chuyến REAL...</div></div>}
          {!loading && clusters.map((c,i)=>(
            <div key={i} className="rounded-[20px] bg-[#151518] border border-[#facc15]/20 overflow-hidden">
              <div className="px-4 py-3 flex justify-between items-center bg-[#1a1a1e] border-b border-[#1f1f23]">
                <span className="font-black text-[13px]">{c.window} • {c.count} chuyến</span>
                <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-black text-[#facc15] border border-[#facc15]/20">Nên XP {formatTime(c.suggest_depart)}</span>
              </div>
              <div className="p-2 space-y-1">
                {c.flights.map(f=>(
                  <div key={f.number+f.scheduled} className="p-3 rounded-[14px] bg-[#0a0a0b] border border-[#1f1f23]">
                    <div className="flex justify-between">
                      <div><div className="font-bold text-[13px]">{f.number} <span className="font-normal text-[#71717a] text-[12px]">từ {f.origin}</span></div><div className="text-[11px] text-[#71717a]">Băng {f.belt} • Cửa {f.gate} • {f.parking||'Bãi A'}</div></div>
                      <div className="text-right"><div className={`font-bold text-[13px] ${f.status==='delayed'?'text-[#fb7185]':''}`}>{formatTime(f.estimated)} {f.delayMin?`+${f.delayMin}p`:''}</div><div className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block ${f.status==='delayed'?'bg-[#fb7185]/10 text-[#fb7185]':'bg-emerald-500/10 text-emerald-400'}`}>{f.status}</div></div>
                    </div>
                    <button onClick={()=>setShowZalo(showZalo===f.number?null:f.number)} className="mt-2 w-full py-2 rounded-full bg-[#1a1a1e] border border-[#26262a] text-[11px] font-bold">📱 Báo khách Zalo</button>
                    {showZalo===f.number && <div className="mt-2 p-2 rounded bg-[#0a0a0b] border border-[#26262a] text-[11px] text-[#a1a1aa]">A/C ơi, chuyến {f.number} từ {f.origin} dự kiến {formatTime(f.estimated)} băng {f.belt} cửa {f.gate}. f.lal.vn<button onClick={()=>navigator.clipboard.writeText(`A/C ơi, chuyến ${f.number} từ ${f.origin} dự kiến ${formatTime(f.estimated)} băng ${f.belt} cửa ${f.gate}. f.lal.vn`)} className="mt-2 w-full py-2 rounded-full bg-white text-black font-bold">Copy</button></div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="rounded-[12px] bg-[#1a1a1e] border border-[#26262a] p-3 text-[11px] text-[#71717a]">Debug: {data?.source} • <a href="/api/debug" className="text-[#facc15] underline">/api/debug</a> • <a href="/api/cron" className="text-[#facc15] underline">/api/cron</a> • Key mới 7632472d</div>
        </div>
      </div>
    </div>
  )
}
