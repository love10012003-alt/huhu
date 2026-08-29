
'use client'
import { useState, useEffect, useMemo } from 'react'

const AIRPORTS=[
  {iata:'SGN',name:'Tân Sơn Nhất',city:'Hồ Chí Minh',color:'#facc15'},
  {iata:'HAN',name:'Nội Bài',city:'Hà Nội',color:'#60a5fa'},
  {iata:'DAD',name:'Đà Nẵng',city:'Đà Nẵng',color:'#fb7185'},
  {iata:'VCA',name:'Cần Thơ',city:'Cần Thơ',color:'#34d399'},
  {iata:'CXR',name:'Cam Ranh',city:'Nha Trang',color:'#a78bfa'},
  {iata:'PQC',name:'Phú Quốc',city:'Phú Quốc',color:'#fb923c'},
]

export default function Premium(){
  const [airport,setAirport]=useState('SGN')
  const [data,setData]=useState(null)
  const [debug,setDebug]=useState(null)
  const [showDebug,setShowDebug]=useState(false)
  const [parking,setParking]=useState({A:{count:3,my:false},B:{count:5,my:true},C:{count:1,my:false}})
  const [km,setKm]=useState(18)
  const [filter,setFilter]=useState('all')
  const [now,setNow]=useState(new Date())
  const [loading,setLoading]=useState(true)
  const [log,setLog]=useState('')

  const formatTime=(iso)=>{
    if(!iso) return '--:--'
    const d=new Date(iso)
    return d.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})
  }
  const formatCountdown=(iso)=>{
    const diff=new Date(iso).getTime()-now.getTime()
    if(diff<=0) return 'Đã hạ'
    const m=Math.floor(diff/60000)
    if(m<60) return `${m}p nữa`
    const h=Math.floor(m/60)
    return `${h}h ${m%60}p`
  }
  const progress=(iso)=>{
    const total=60*60000
    const diff=new Date(iso).getTime()-now.getTime()
    const pct=Math.max(0,Math.min(100,100-(diff/total)*100))
    return pct
  }

  const load=async()=>{
    setLoading(true)
    try{
      const r=await fetch(`/api/flights?airport=${airport}`,{cache:'no-store'})
      const j=await r.json()
      setData(j)
    }catch(e){ setData({flights:[],clusters:[],is_mock:false}) }
    setLoading(false)
  }
  const runCron=async()=>{
    setLog('Đang nạp REAL key mới...')
    const r=await fetch('/api/cron',{cache:'no-store'})
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

  useEffect(()=>{
    load(); checkDebug()
    const t=setInterval(()=>setNow(new Date()),1000)
    const t2=setInterval(()=>load(),30000)
    return ()=>{clearInterval(t);clearInterval(t2)}
  },[airport])

  // Lọc chuyến đã hạ quá 10' thì không hiển thị
  const visibleClusters=useMemo(()=>{
    if(!data?.clusters) return []
    const cutoff=new Date(now.getTime()-10*60000).getTime()
    return data.clusters.map(c=>{
      const flights=c.flights.filter(f=>{
        const est=new Date(f.estimated).getTime()
        return est > cutoff // chỉ hiện chuyến chưa hạ quá 10p
      })
      return {...c,flights,count:flights.length}
    }).filter(c=>c.count>0)
  },[data,now])

  const allFlights=visibleClusters.flatMap(c=>c.flights)
  const filteredFlights=allFlights.filter(f=>{
    if(filter==='delayed') return f.status==='delayed'
    if(filter==='on_time') return f.status==='on_time'
    return true
  })

  const nextFlight=allFlights[0]
  const suggestXP=nextFlight ? new Date(new Date(nextFlight.estimated).getTime()- (km*3+15)*60000) : null

  return (
    <div className="min-h-screen bg-[#050508] flex justify-center">
      <div className="w-full max-w-[480px] bg-[#0a0a0c] border-x border-[#1a1a1f] min-h-screen relative">
        {/* Premium Header */}
        <div className="sticky top-0 z-40 bg-[#050508]/80 backdrop-blur-2xl border-b border-white/[0.06]">
          <div className="px-5 py-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] gold-gradient flex items-center justify-center font-black text-black text-[14px] shadow-[0_0_20px_rgba(250,204,21,0.3)]">f.</div>
                <div>
                  <div className="font-black text-[16px] tracking-tight flex items-center gap-2">f.lal.vn <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/[0.08] border border-white/[0.08]">CanhDon PRO</span></div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="live-dot"></div>
                    <span className="text-[11px] text-[#a1a1aa]">{airport} • {data?.flights?.length||0} chuyến • {data?.is_mock?'MOCK REAL':'REAL'} • {formatTime(data?.updated_at)}</span>
                  </div>
                </div>
              </div>
              <button onClick={()=>setShowDebug(!showDebug)} className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[14px]">⚙️</button>
            </div>

            {/* Next flight hero */}
            {nextFlight && (
              <div className="mt-4 rounded-[20px] gold-gradient p-[1px] shadow-[0_0_30px_rgba(250,204,21,0.2)]">
                <div className="rounded-[19px] bg-[#0f0f10] p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[11px] text-[#71717a] font-bold tracking-widest">CHUYẾN SẮP TỚI</div>
                      <div className="font-black text-[22px] mt-1">{nextFlight.number} <span className="font-normal text-[14px] text-[#a1a1aa]">từ {nextFlight.origin}</span></div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[13px] font-bold px-2 py-1 rounded-full bg-[#facc15] text-black">{formatTime(nextFlight.estimated)}</span>
                        <span className="text-[11px] text-[#a1a1aa]">{formatCountdown(nextFlight.estimated)} • Băng {nextFlight.belt} • Cửa {nextFlight.gate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#71717a]">NÊN XUẤT PHÁT</div>
                      <div className="font-black text-[16px] text-[#facc15]">{suggestXP?formatTime(suggestXP.toISOString()):'--:--'}</div>
                      <div className="text-[10px] text-[#a1a1aa]">{km}km • {km*3+15}p di chuyển</div>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full gold-gradient transition-all duration-1000" style={{width:`${progress(nextFlight.estimated)}%`}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Debug */}
        {showDebug && debug && (
          <div className="m-4 p-4 rounded-[20px] bg-[#0a0a0a] border border-[#facc15]/20">
            <div className="font-black text-[#facc15] text-[12px]">🔍 KIỂM TRA LỖI • f.lal.vn PREMIUM</div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
              <div className="glass rounded-xl p-2"><div className="text-[#71717a]">Supabase</div><div className={debug.supabase?.ok?'text-emerald-400':'text-red-400'}>{debug.supabase?.ok?'✅ OK':'❌ '+debug.supabase?.error?.slice(0,40)}</div></div>
              <div className="glass rounded-xl p-2"><div className="text-[#71717a]">Aviation key mới</div><div className={debug.aviation?.ok?'text-emerald-400':'text-amber-400'}>{debug.aviation?.ok?`✅ ${debug.aviation?.count}`:`❌ ${debug.aviation?.error?.slice(0,40)}`}</div></div>
            </div>
            <div className="flex gap-2 mt-3"><button onClick={runCron} className="flex-1 py-2 rounded-full gold-gradient text-black font-black text-[11px]">🚀 Nạp REAL</button><button onClick={checkDebug} className="px-4 py-2 rounded-full bg-white/[0.06] border text-[11px]">Check</button></div>
          </div>
        )}

        <div className="px-4 py-4 space-y-4">
          {/* Airport selector premium */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {AIRPORTS.map(a=>(
              <button key={a.iata} onClick={()=>setAirport(a.iata)} className={`px-4 py-2.5 rounded-full font-bold text-[12px] whitespace-nowrap border transition-all ${airport===a.iata?'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]':'bg-white/[0.06] text-[#a1a1aa] border-white/[0.08] hover:bg-white/[0.1]'}`}>
                {a.iata} • {a.city}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-[16px] p-3">
              <div className="text-[11px] font-bold text-[#71717a]">KHOẢNG CÁCH</div>
              <div className="font-black text-[18px] mt-1">{km} <span className="text-[12px] font-normal text-[#71717a]">km</span></div>
              <input type="range" min="3" max="50" value={km} onChange={e=>setKm(e.target.value)} className="w-full mt-2 accent-[#facc15] h-1" />
              <div className="text-[10px] text-[#71717a] mt-1">Đi {km*3+15}p • XP trước 45p</div>
            </div>
            <div className="glass rounded-[16px] p-3">
              <div className="text-[11px] font-bold text-[#71717a]">LỌC TRẠNG THÁI</div>
              <div className="flex gap-1 mt-2">
                {[{k:'all',l:'Tất cả'},{k:'on_time',l:'Đúng giờ'},{k:'delayed',l:'Delay'}].map(f=>(
                  <button key={f.k} onClick={()=>setFilter(f.k)} className={`flex-1 py-1.5 rounded-full text-[10px] font-bold border ${filter===f.k?'bg-[#facc15] text-black border-[#facc15]':'bg-white/[0.04] text-[#71717a] border-white/[0.06]'}`}>{f.l}</button>
                ))}
              </div>
              <div className="text-[10px] text-[#71717a] mt-2">{filteredFlights.length} chuyến hiển thị • Ẩn chuyến hạ quá 10p</div>
            </div>
          </div>

          {/* Parking premium */}
          <div className="glass rounded-[20px] p-4">
            <div className="flex justify-between items-center">
              <div className="font-bold text-[13px]">🅿️ Bãi đỗ realtime</div>
              <div className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Live • {airport}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {Object.entries(parking).map(([k,v])=>(
                <button key={k} onClick={()=>setParking(p=>({...p,[k]:{...v,count:v.count+1,my:true}}))} className={`rounded-[14px] p-3 border text-left transition-all ${v.my?'bg-[#facc15]/10 border-[#facc15]/30 shadow-[0_0_15px_rgba(250,204,21,0.15)]':'bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08]'}`}>
                  <div className="text-[10px] text-[#71717a]">BÃI {k}</div>
                  <div className="font-black text-[20px] mt-1">{v.count}</div>
                  <div className="text-[10px] mt-1 flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${v.my?'bg-[#facc15]':'bg-[#71717a]'}`}></div>{v.my?'Bạn ở đây':'Trống'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Flights */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i=><div key={i} className="glass rounded-[20px] p-4 animate-pulse"><div className="h-4 bg-white/[0.06] rounded w-1/3"></div><div className="h-3 bg-white/[0.04] rounded w-2/3 mt-2"></div></div>)}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleClusters.length===0 && <div className="glass rounded-[20px] p-8 text-center"><div className="text-[40px]">✈️</div><div className="font-bold mt-2">Không có chuyến nào</div><div className="text-[11px] text-[#71717a] mt-1">Các chuyến đã hạ quá 10 phút đã được ẩn đi • Đợi chuyến mới</div></div>}
              {visibleClusters.map((c,i)=>(
                <div key={i} className="rounded-[20px] overflow-hidden border border-white/[0.06] bg-[#0f0f10]">
                  <div className="px-4 py-3 flex justify-between items-center bg-white/[0.02] border-b border-white/[0.06]">
                    <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-[#facc15]/10 border border-[#facc15]/20 flex items-center justify-center text-[11px]">◐</div><span className="font-black text-[13px]">{c.window} • {c.count} chuyến</span></div>
                    <div className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#0a0a0a] border border-white/[0.08] text-[#facc15]">XP {formatTime(c.suggest_depart)}</div>
                  </div>
                  <div className="p-2 space-y-2">
                    {c.flights.filter(f=>{if(filter==='delayed') return f.status==='delayed'; if(filter==='on_time') return f.status==='on_time'; return true}).map(f=>{
                      const isDelayed=f.status==='delayed'
                      return (
                        <div key={f.number+f.scheduled} className="group rounded-[16px] bg-[#0a0a0a] border border-white/[0.04] p-3 hover:border-white/[0.08] transition-all">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                              <div className="w-10 h-10 rounded-[12px] bg-white/[0.06] border border-white/[0.08] flex items-center justify-center font-black text-[11px]">{f.number.slice(0,2)}</div>
                              <div>
                                <div className="font-black text-[14px]">{f.number} <span className="font-normal text-[#71717a] text-[12px]">• {f.origin}</span></div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[11px] text-[#a1a1aa]">Băng {f.belt} • Cửa {f.gate} • {f.parking}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isDelayed?'bg-red-500/10 text-red-400 border border-red-500/20':'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>{isDelayed?`DELAY +${f.delayMin}p`:'ON TIME'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-black text-[16px]">{formatTime(f.estimated)}</div>
                              <div className="text-[11px] text-[#facc15] font-bold">{formatCountdown(f.estimated)}</div>
                            </div>
                          </div>
                          <div className="mt-3 h-1 rounded-full bg-white/[0.06] overflow-hidden"><div className="h-full gold-gradient" style={{width:`${progress(f.estimated)}%`}}></div></div>
                          <div className="mt-3 flex gap-2">
                            <button className="flex-1 py-2 rounded-full bg-white text-black font-black text-[11px] hover:bg-[#f5f5f5] transition-colors">📱 Zalo khách</button>
                            <button className="flex-1 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] font-bold text-[11px] hover:bg-white/[0.1]">🧭 Chỉ đường</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center py-6">
            <div className="text-[10px] text-[#71717a] tracking-widest">f.lal.vn • PREMIUM • Key mới 7632472d • Ẩn chuyến hạ quá 10p • Auto refresh 30s</div>
          </div>
        </div>
      </div>
    </div>
  )
}
