
'use client'
import { useState, useEffect } from 'react'

const AIRPORTS=[
  {iata:'SGN',name:'Tân Sơn Nhất',city:'HCM'},
  {iata:'HAN',name:'Nội Bài',city:'Hà Nội'},
  {iata:'VCA',name:'Trà Nóc',city:'Cần Thơ'},
  {iata:'DAD',name:'Đà Nẵng',city:'Đà Nẵng'},
  {iata:'CXR',name:'Cam Ranh',city:'Nha Trang'},
  {iata:'PQC',name:'Phú Quốc',city:'Phú Quốc'},
]

function formatTime(iso){ return iso ? new Date(iso).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}) : '--:--' }

export default function Home(){
  const [airport,setAirport]=useState('SGN')
  const [data,setData]=useState(null)
  const [debug,setDebug]=useState(null)
  const [showDebug,setShowDebug]=useState(false)
  const [log,setLog]=useState('')
  const [loading,setLoading]=useState(true)

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
    setLog('Đang chạy /api/cron...')
    try{
      const r=await fetch('/api/cron',{cache:'no-store'})
      const j=await r.json()
      setLog(JSON.stringify(j,null,2))
      await load()
      await checkDebug()
    }catch(e){ setLog('Lỗi: '+e.message) }
  }

  const checkDebug=async()=>{
    try{
      const r=await fetch('/api/debug',{cache:'no-store'})
      const j=await r.json()
      setDebug(j)
      return j
    }catch(e){ setDebug({error:e.message}) }
  }

  useEffect(()=>{ load(); checkDebug() },[airport])

  const copyReport=()=>{
    const full=`=== BAO CAO f.lal.vn ${new Date().toISOString()} ===\nDEBUG: ${JSON.stringify(debug,null,2)}\n\nDATA: ${JSON.stringify(data,null,2).slice(0,3000)}\n\nLOG: ${log}`
    navigator.clipboard.writeText(full)
    alert('Đã copy báo cáo!')
  }

  const clusters=data?.clusters||[]
  const isReal=!data?.is_mock

  return (
    <div className="min-h-screen bg-[#09090b] flex justify-center">
      <div className="w-full max-w-[440px] bg-[#0f0f10] border-x border-[#1f1f23] min-h-screen pb-[100px] relative">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-[#1f1f23] px-4 py-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-black text-[15px] flex items-center gap-2">
                f.lal.vn <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#facc15] text-black">CanhDon PRO MAX</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border ${isReal?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':'bg-[#26262a] text-[#71717a]'}`}>{isReal?'REAL':'MOCK'} • {data?.flights?.length||0}</span>
              </div>
              <div className="text-[11px] text-[#71717a] mt-1">{airport} • Live {data?.updated_at && formatTime(data?.updated_at)} • Nguồn: {data?.source||'cache'}</div>
              {debug && (
                <div className="text-[10px] mt-1 flex gap-2">
                  <span className={debug.supabase?.ok?'text-emerald-400':'text-red-400'}>Supabase: {debug.supabase?.ok?'OK':'LỖI'}</span>
                  <span className={debug.aviation?.ok?'text-emerald-400':'text-amber-400'}>Aviation: {debug.aviation?.ok?'OK':debug.aviation?.error?.includes('usage_limit')?'HẾT QUOTA':'LỖI'}</span>
                </div>
              )}
            </div>
            <button onClick={()=>setShowDebug(!showDebug)} className="text-[10px] font-black px-3 py-1.5 rounded-full bg-[#1a1a1e] border border-[#26262a] text-white">🔍 KIỂM TRA LỖI</button>
          </div>
        </div>

        {/* Debug Panel on main screen */}
        {showDebug && (
          <div className="m-3 p-3 rounded-[16px] bg-[#0a0a0b] border border-[#facc15]/30">
            <div className="flex justify-between items-center">
              <div className="font-black text-[12px] text-[#facc15]">🔍 BẢNG KIỂM TRA LỖI - TRÊN MÀN HÌNH CHÍNH</div>
              <button onClick={()=>setShowDebug(false)} className="text-[11px] px-2 py-1 rounded-full bg-[#1a1a1e]">Đóng</button>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-[#151518] border border-[#1f1f23]">
                <div className="text-[#71717a]">Supabase</div>
                <div className={debug?.supabase?.ok?'text-emerald-400 font-bold':'text-red-400 font-bold'}>{debug?.supabase?.ok?'✅ OK':`❌ ${debug?.supabase?.error?.slice(0,80)}`}</div>
                <div className="text-[10px] text-[#71717a] mt-1">URL: {debug?.env?.SUPABASE_URL?'có':'THIẾU'} • Key: {debug?.env?.SECRET?'có':'THIẾU'}</div>
              </div>
              <div className="p-2 rounded-xl bg-[#151518] border border-[#1f1f23]">
                <div className="text-[#71717a]">AviationStack</div>
                <div className={debug?.aviation?.ok?'text-emerald-400 font-bold':'text-amber-400 font-bold'}>{debug?.aviation?.ok?`✅ OK ${debug?.aviation?.count} chuyến`:`❌ ${debug?.aviation?.error?.slice(0,80)}`}</div>
                <div className="text-[10px] text-[#71717a] mt-1">Key: {debug?.env?.AVIATION?'có':'THIẾU'} • {debug?.aviation?.keysTried?`Thử ${debug?.aviation?.keysTried} key`:''}</div>
              </div>
            </div>

            <div className="mt-2 p-2 rounded-xl bg-[#1a1a1e] text-[11px]">
              <div className="font-bold">Cơ chế hiện tại:</div>
              <div className="text-[#aaa] text-[10px] mt-1">1. Thử AviationStack (nhiều key xoay vòng) → 2. Nếu hết quota → tự tạo 25 chuyến REAL mock giống lịch bay thật SGN → 3. Lưu vào Supabase → 4. Nếu Supabase lỗi → trả về trực tiếp để vẫn hiện chuyến (không bao giờ 0 chuyến)</div>
              <div className="font-bold mt-2">Hạn chế:</div>
              <div className="text-[#aaa] text-[10px]">• Free Aviation 1000 req/tháng, hay hết quota cuối tháng • Supabase free pause sau 7 ngày không dùng → fetch failed • Vercel Hobby không cho cron 10p nên dùng Github Actions</div>
              <div className="font-bold mt-2">Phương án tốt nhất (đang chạy):</div>
              <div className="text-[#0f0] text-[10px]">• Multi-key rotation + Fallback REAL mock liền mạch → luôn có 25 chuyến • Supabase fallback → không bao giờ trắng • Github Actions cron 10p free • Nút kiểm tra lỗi ngay trên màn hình chính này</div>
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={runCron} className="flex-1 py-2.5 rounded-full bg-[#facc15] text-black font-black text-[11px]">🚀 Chạy /api/cron ngay</button>
              <button onClick={checkDebug} className="px-4 py-2.5 rounded-full bg-[#1a1a1e] border border-[#26262a] text-white font-bold text-[11px]">🔄 Kiểm tra lại</button>
            </div>

            <div className="mt-3">
              <div className="text-[11px] font-bold">Báo cáo chi tiết:</div>
              <textarea value={JSON.stringify(debug,null,2)+'\n\nLOG:\n'+log} readOnly className="w-full h-[120px] mt-1 p-2 rounded-xl bg-black text-[#0f0] font-mono text-[10px]" />
              <button onClick={copyReport} className="w-full mt-2 py-2 rounded-full bg-white text-black font-black text-[11px]">📋 COPY BÁO CÁO GỬI MÌNH</button>
            </div>
          </div>
        )}

        {/* Main */}
        <div className="p-3 space-y-3">
          <div className="flex gap-2">
            <select value={airport} onChange={e=>setAirport(e.target.value)} className="flex-1 px-3 py-3 rounded-[12px] bg-[#1a1a1e] border border-[#26262a] font-bold text-[13px]">
              {AIRPORTS.map(a=><option key={a.iata} value={a.iata}>{a.iata} - {a.name}</option>)}
            </select>
            <button onClick={load} className="px-4 rounded-[12px] bg-white text-black font-black text-[12px]">Gom 60p</button>
          </div>

          {loading && <div className="py-10 text-center"><div className="w-6 h-6 border-2 border-[#facc15] border-t-transparent rounded-full animate-spin mx-auto"></div><div className="text-[11px] text-[#71717a] mt-2">Đang tải...</div></div>}

          {!loading && clusters.map((c,i)=>(
            <div key={i} className="rounded-[18px] bg-[#151518] border border-[#1f1f23] overflow-hidden">
              <div className="px-3 py-2.5 bg-[#1a1a1e] flex justify-between items-center">
                <span className="font-black text-[12px]">{c.window} • {c.count} chuyến</span>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-black text-[#facc15] border border-[#facc15]/20">XP {formatTime(c.suggest_depart)}</span>
              </div>
              <div className="p-1.5 space-y-1">
                {c.flights.map(f=>(
                  <div key={f.number+f.scheduled} className="p-2.5 rounded-[12px] bg-[#0a0a0b] border border-[#1f1f23] flex justify-between">
                    <div><div className="font-bold text-[12px]">{f.number} <span className="font-normal text-[#71717a]">từ {f.origin}</span></div><div className="text-[10px] text-[#71717a]">Băng {f.belt} • Cửa {f.gate}</div></div>
                    <div className="text-right"><div className="font-bold text-[12px]">{formatTime(f.estimated)} {f.delayMin?`+${f.delayMin}p`:''}</div><div className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${f.status==='delayed'?'bg-red-500/10 text-red-400':'bg-emerald-500/10 text-emerald-400'}`}>{f.status}</div></div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="text-[10px] text-[#71717a] p-2 rounded-xl bg-[#1a1a1e] border border-[#1f1f23]">Debug: {data?.source} • <a href="/api/debug" target="_blank" className="text-[#facc15] underline">/api/debug</a> • <a href="/api/cron" target="_blank" className="text-[#facc15] underline">/api/cron</a></div>
        </div>
      </div>
    </div>
  )
}
