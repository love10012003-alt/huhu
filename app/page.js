
'use client'
import { useState, useEffect } from 'react'
const AIRPORTS=[
  {iata:'SGN',name:'Tân Sơn Nhất'},{iata:'HAN',name:'Nội Bài'},{iata:'DAD',name:'Đà Nẵng'},
  {iata:'VCA',name:'Cần Thơ'},{iata:'CXR',name:'Cam Ranh'},{iata:'PQC',name:'Phú Quốc'}
]
export default function Home(){
  const [airport,setAirport]=useState('SGN')
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(true)
  const [parking,setParking]=useState({A:3,B:5,C:1})
  const [km,setKm]=useState(25)
  const [showZalo,setShowZalo]=useState(null)
  const formatTime=(iso)=>iso?new Date(iso).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}):'--:--'
  const load=async()=>{
    setLoading(true)
    try{
      const r=await fetch(`/api/flights?airport=${airport}`,{cache:'no-store'})
      const j=await r.json()
      setData(j)
    }catch(e){}
    setLoading(false)
  }
  const runCron=async()=>{
    setLoading(true)
    try{
      await fetch('/api/cron',{cache:'no-store'})
      await load()
    }catch(e){}
    setLoading(false)
  }
  useEffect(()=>{ load() },[airport])
  const zaloMsg=(f)=>`A/C ơi, chuyến ${f.number} từ ${f.origin} dự kiến ${formatTime(f.estimated)} ${f.status==='delayed'?`(delay +${f.delayMin}p)`:''} băng ${f.belt} cửa ${f.gate}. Xe em đang ở ${f.parking||'Bãi A'}, ra là lên xe luôn ạ. f.lal.vn - CanhDon PRO`

  return (
    <div className="min-h-screen bg-[#09090b] flex justify-center">
      <div className="w-full max-w-[440px] bg-[#0f0f10] border-x border-[#1f1f23] pb-[90px] min-h-screen">
        <header className="sticky top-0 z-30 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-[#1f1f23]">
          <div className="px-5 py-4 flex justify-between items-center">
            <div>
              <div className="font-black text-[15px] flex items-center gap-2">f.lal.vn • CanhDon<span className="text-[9px] px-2 py-0.5 rounded-full bg-[#facc15] text-black">PRO MAX FINAL</span><span className={`text-[9px] px-2 py-0.5 rounded-full border ${data?.is_mock?'bg-[#26262a] text-[#71717a]':'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>{data?.is_mock?'MOCK':'REAL'} • {data?.flights?.length||0}</span></div>
              <div className="text-[11px] text-[#71717a] mt-1">{airport} • Live {data?.updated_at&&formatTime(data.updated_at)} • {data?.rawCount||0} raw</div>
            </div>
            <div className="text-[10px] font-black px-3 py-1.5 rounded-full bg-gradient-to-r from-[#facc15] to-[#eab308] text-black">HOBBY FIX</div>
          </div>
        </header>

        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <select value={airport} onChange={e=>setAirport(e.target.value)} className="flex-1 px-4 py-3.5 rounded-[14px] bg-[#1a1a1e] border border-[#26262a] font-bold text-[14px]">
              {AIRPORTS.map(a=><option key={a.iata} value={a.iata}>{a.iata} - {a.name}</option>)}
            </select>
            <button onClick={load} className="px-5 rounded-[14px] bg-white text-black font-black text-[13px]">Gom 60p</button>
          </div>

          {data?.is_mock && (
            <div className="rounded-[14px] bg-amber-500/10 border border-amber-500/20 p-3">
              <div className="text-[12px] font-bold text-amber-400">⚠️ Đang MOCK vì Supabase trống</div>
              <div className="text-[11px] text-[#a1a1aa] mt-1">Bấm nút dưới để nạp 25 chuyến REAL từ AviationStack</div>
              <button onClick={runCron} className="mt-2 w-full py-2.5 rounded-full bg-[#facc15] text-black font-black text-[12px]">🚀 Bấm để nạp 25 chuyến REAL ngay</button>
            </div>
          )}

          <div className="rounded-[14px] bg-[#151518] border border-[#1f1f23] p-3">
            <div className="text-[12px] font-bold">🅿️ Bãi đỗ realtime</div>
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

          {loading && <div className="py-10 text-center"><div className="w-6 h-6 border-2 border-[#facc15] border-t-transparent rounded-full animate-spin mx-auto"></div><div className="text-[12px] text-[#71717a] mt-2">Đang tải...</div></div>}

          {!loading && data?.clusters?.map((c,i)=>(
            <div key={i} className="rounded-[20px] bg-[#151518] border border-[#facc15]/20 overflow-hidden">
              <div className="px-4 py-3 flex justify-between items-center bg-[#1a1a1e] border-b border-[#1f1f23]">
                <span className="font-black text-[13px]">{c.window} • {c.count} chuyến</span>
                <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-black text-[#facc15] border border-[#facc15]/20">Nên XP {formatTime(c.suggest_depart)}</span>
              </div>
              <div className="p-2">
                {c.flights.map(f=>(
                  <div key={f.number+f.scheduled} className="p-3 rounded-[14px] hover:bg-[#1e1e22]">
                    <div className="flex justify-between">
                      <div><div className="font-bold text-[13px]">{f.number} <span className="font-normal text-[#71717a] text-[12px]">từ {f.origin}</span></div><div className="text-[11px] text-[#71717a]">Băng {f.belt} • Cửa {f.gate} • {f.parking}</div></div>
                      <div className="text-right"><div className={`font-bold text-[13px] ${f.status==='delayed'?'text-[#fb7185]':'text-white'}`}>{formatTime(f.estimated)} {f.delayMin?`+${f.delayMin}p`:''}</div><div className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block ${f.status==='delayed'?'bg-[#fb7185]/10 text-[#fb7185]':'bg-emerald-500/10 text-emerald-400'}`}>{f.status}</div></div>
                    </div>
                    <button onClick={()=>setShowZalo(showZalo===f.number?null:f.number)} className="mt-2 w-full py-2 rounded-full bg-[#1a1a1e] border border-[#26262a] text-[11px] font-bold">📱 Báo khách Zalo</button>
                    {showZalo===f.number && <div className="mt-2 p-2 rounded bg-[#0a0a0b] border border-[#26262a] text-[11px] text-[#a1a1aa]">{zaloMsg(f)}<button onClick={()=>navigator.clipboard.writeText(zaloMsg(f))} className="mt-2 w-full py-2 rounded-full bg-white text-black font-bold">Copy</button></div>}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-[12px] bg-[#1a1a1e] border border-[#26262a] p-3 text-[11px] text-[#71717a]">Debug: Airport {airport} • is_mock {String(data?.is_mock)} • flights {data?.flights?.length} • <a href="/api/cron" className="text-[#facc15] underline">/api/cron</a> • <a href={`/api/flights?airport=${airport}`} className="text-[#facc15] underline">JSON</a></div>
        </div>
      </div>
    </div>
  )
}
