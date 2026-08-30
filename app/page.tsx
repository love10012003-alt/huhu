'use client'
import { useEffect, useState } from 'react'

type Flight = { time:string, origin:string, origin_city:string, flight:string, airline:string, aircraft:string, status:string, actual?:string, customer?:{name:string,phone:string,pax:number,note:string,dest:string,km:number} }

const DESTS = [
  {label:'Ninh Kiều - Vincom', km:9, id:'NK'},
  {label:'Cái Răng', km:7, id:'CR'},
  {label:'Bình Thủy', km:4, id:'BT'},
  {label:'Ô Môn', km:15, id:'OM'},
  {label:'Thốt Nốt', km:35, id:'TN'},
  {label:'Tùy chỉnh', km:0, id:'CUSTOM'},
]

const PRICING = {
  grabBike: { base:9000, per:4200, label:'GrabBike' },
  grab4: { base:27000, per:12500, baseKm:2, label:'GrabCar 4' },
  grab7: { base:32000, per:14500, baseKm:2, label:'GrabCar 7' },
  xanhBike: { base:10000, per:4500, label:'Xanh Bike' },
  xanhTaxi: { base:29000, per:13500, label:'Xanh Taxi' },
  xanhLux: { base:38000, per:17000, label:'Xanh Luxury' },
}

function calcPrice(km:number, p:any){
  if(km<=0) return 0
  const surcharge = 15000
  if(p.baseKm){
    if(km<=p.baseKm) return p.base+surcharge
    return p.base + (km-p.baseKm)*p.per + surcharge
  }
  return p.base + km*p.per + surcharge
}

function formatVND(n:number){ return Math.round(n/1000)*1000 }

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
export default function Page(){
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  useEffect(()=>{
    const supabase = createClient()
    supabase.auth.getUser().then(({data})=>{
      if(!data.user){ /* cho xem demo nhung lock PRO */ }
      setUser(data.user)
    })
  },[])

  const [airport, setAirport] = useState('VCA')
  const [flights, setFlights] = useState<Flight[]>([])
  const [groups, setGroups] = useState<Flight[][]>([])
  const [selected, setSelected] = useState<Flight|null>(null)
  const [dest, setDest] = useState(DESTS[0])
  const [customKm, setCustomKm] = useState(9)
  const [favorites, setFavorites] = useState<string[]>([])
  const [filterFav, setFilterFav] = useState(false)
  const [customerForm, setCustomerForm] = useState({name:'', phone:'', pax:1, note:'', thu:400000, chi:50000})
  const [stats, setStats] = useState({count:0, thu:0, lai:0})
  const airports = ['SGN','VCA','HAN','DAD','CXR','PQC']

  const km = dest.id==='CUSTOM'? customKm : dest.km

  useEffect(()=>{
    const fav = JSON.parse(localStorage.getItem('fav_vca')||'[]')
    setFavorites(fav)
    load()
  },[airport])

  async function load(){
    try{
      const res = await fetch(`/api/flights?airport=${airport}`, {cache:'no-store'})
      const data = await res.json()
      // merge customers from localStorage
      const customers = JSON.parse(localStorage.getItem('customers_'+airport)||'{}')
      let fl = (data.flights||[]).map((f:any)=> ({...f, customer: customers[f.flight]}))
      setFlights(fl)
      setGroups(data.groups||groupFlights(fl))
      calcStats(fl)
    }catch(e){
      console.log(e)
    }
  }

  function groupFlights(fl:Flight[]){
    fl.sort((a,b)=>a.time.localeCompare(b.time))
    let gs:Flight[][]=[]; let cur:Flight[]=[]
    for(let f of fl){
      if(cur.length===0) cur.push(f)
      else {
        const toMin=(t:string)=>{const [h,m]=t.split(':').map(Number);return h*60+m}
        const diff=toMin(f.time)-toMin(cur[cur.length-1].time)
        if(diff<=60) cur.push(f)
        else {gs.push(cur); cur=[f]}
      }
    }
    if(cur.length) gs.push(cur)
    return gs
  }

  function calcStats(fl:Flight[]){
    let thu=0, lai=0, count=0
    fl.forEach(f=>{
      if(f.customer){
        count++
        const priceGrab = calcPrice(f.customer.km||km, PRICING.grab4)
        const th = f.customer as any
        const thuKhach = th.thu || 400000
        thu+=thuKhach
        lai+= thuKhach - (th.chi||50000) - priceGrab
      }
    })
    setStats({count, thu, lai})
  }

  function toggleFav(flightCode:string){
    let nf=[...favorites]
    if(nf.includes(flightCode)) nf=nf.filter(f=>f!==flightCode)
    else nf.push(flightCode)
    setFavorites(nf)
    localStorage.setItem('fav_vca', JSON.stringify(nf))
  }

  function saveCustomer(){
    if(!selected) return
    const customers = JSON.parse(localStorage.getItem('customers_'+airport)||'{}')
    customers[selected.flight] = { name: customerForm.name, phone: customerForm.phone, pax: customerForm.pax, note: customerForm.note, dest: dest.label, km, thu: customerForm.thu, chi: customerForm.chi }
    localStorage.setItem('customers_'+airport, JSON.stringify(customers))
    setFlights(flights.map(f=> f.flight===selected.flight ? {...f, customer: customers[selected.flight]} : f))
    calcStats(flights.map(f=> f.flight===selected.flight ? {...f, customer: customers[selected.flight]} as any : f))
    alert('Đã lưu khách '+customerForm.name)
  }

  const displayGroups = filterFav ? groups.map(g=> g.filter(f=> favorites.includes(f.flight))).filter(g=>g.length>0) : groups

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-24 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center font-black text-black">t</div>
            <div>
              <div className="font-black leading-none">t.lal.vn <span className="text-yellow-400">PRO</span></div>
              <div className="text-[10px] text-white/50">CanhDon • 6 airports LIVE</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold">NEW STYLE</div>
            <div className="text-[10px] text-white/40 mt-1">{stats.count} chuyến • Lãi {Math.round(stats.lai/1000)}k</div>
          </div>
        </div>
        {/* Airport tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {airports.map(ap=>(
            <button key={ap} onClick={()=>setAirport(ap)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition ${airport===ap? 'bg-white text-black border-white' : 'bg-white/10 border-white/10 text-white/70'}`}>
              {ap} {ap==='VCA' && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">14</span>}
            </button>
          ))}
        </div>
        {/* Stats */}
        <div className="mx-4 mb-3 grid grid-cols-3 gap-2">
          <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-2.5">
            <div className="text-[10px] text-white/40">HÔM NAY</div>
            <div className="font-bold text-sm">{flights.length} chuyến</div>
          </div>
          <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-2.5">
            <div className="text-[10px] text-white/40">THU</div>
            <div className="font-bold text-sm">{Math.round(stats.thu/1000)}k</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-400 to-orange-400 text-black rounded-2xl p-2.5">
            <div className="text-[10px] text-black/60">LÃI</div>
            <div className="font-black text-sm">{Math.round(stats.lai/1000)}k</div>
          </div>
        </div>
        <div className="px-4 pb-3 flex gap-2">
          <button onClick={()=>setFilterFav(!filterFav)} className={`text-xs px-3 py-1.5 rounded-full border ${filterFav? 'bg-yellow-400 text-black border-yellow-400':'bg-white/10 border-white/10'}`}>❤️ Yêu thích ({favorites.length})</button>
          <button onClick={load} className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/10">↻ Refresh</button>
          <button onClick={()=>{
            const rows = flights.filter(f=>f.customer).map(f=> `${f.time},${f.flight},${f.origin_city},${f.customer?.name},${f.customer?.phone},${f.customer?.dest},${(f.customer as any)?.thu||0}`).join('\n')
            const blob = new Blob(['Gio,Chuyen,Noi di,Ten,SDT,Diem den,Thu\n'+rows], {type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`canhdon-${airport}.csv`; a.click()
          }} className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/10">⬇ Xuất Excel</button>
        </div>
      </div>

      {/* Groups */}
      <div className="px-4 pt-4 space-y-5">
        {displayGroups.map((g, gi)=>{
          const isPeak = g.length>=4
          const start = g[0].time, end = g[g.length-1].time
          return (
            <div key={gi} className={`rounded-[20px] border ${isPeak? 'border-yellow-400/50 bg-gradient-to-b from-yellow-400/[0.08] to-transparent' : 'border-white/10 bg-white/[0.03]'} overflow-hidden`}>
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isPeak? 'bg-yellow-400 animate-pulse' : 'bg-white/30'}`}></div>
                  <div className="font-bold text-sm">Nhóm {gi+1} • {start} - {end} • {g.length} chuyến</div>
                  {isPeak && <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded-full font-black">CAO ĐIỂM</span>}
                </div>
                <div className="text-[11px] text-white/40">{gi===0? 'Sớm - dày 5p' : gi===3? 'Chiều bận nhất' : '≤60p'}</div>
              </div>
              <div className="divide-y divide-white/5">
                {g.map((f, idx)=>{
                  const prev = idx>0? g[idx-1] : null
                  const diff = prev? (()=>{ const toMin=(t:string)=>{const [h,m]=t.split(':').map(Number);return h*60+m}; return toMin(f.time)-toMin(prev.time)})() : 0
                  return (
                    <div key={f.flight+idx}>
                      {idx>0 && <div className="flex justify-center py-1"><span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/50">Cách nhau {diff} phút</span></div>}
                      <div onClick={()=>{setSelected(f); setCustomerForm({name:f.customer?.name||'', phone:f.customer?.phone||'', pax:f.customer?.pax||1, note:f.customer?.note||'', thu:(f.customer as any)?.thu||400000, chi:(f.customer as any)?.chi||50000})}} className="px-4 py-3 flex items-center gap-3 active:bg-white/5 cursor-pointer">
                        <div className="text-center min-w-[56px]">
                          <div className="font-black text-[17px] leading-none">{f.time}</div>
                          <div className="text-[10px] text-white/40 mt-1">{f.status==='LIVE'? `● ${f.actual||f.time}`: 'Scheduled'}</div>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black ${f.airline.includes('Vietjet')? 'bg-red-500' : 'bg-yellow-500 text-black'}`}>{f.airline.includes('Vietjet')? 'VJ':'VN'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm truncate">{f.origin_city}</span>
                            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full border border-white/10">{f.origin}</span>
                            {f.customer && <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">👤 {f.customer.name.split(' ').pop()}</span>}
                          </div>
                          <div className="text-[12px] text-white/50 flex gap-2"><span>{f.flight}</span><span className="bg-white/10 px-1 rounded">{f.aircraft}</span><span>{f.status==='LIVE'? '✈️ LIVE':''}</span></div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button onClick={(e)=>{e.stopPropagation(); toggleFav(f.flight)}} className={`w-7 h-7 rounded-full flex items-center justify-center ${favorites.includes(f.flight)? 'bg-red-500':'bg-white/10'}`}>{favorites.includes(f.flight)? '❤️':'🤍'}</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setSelected(null)}></div>
          <div className="relative w-full max-h-[88vh] overflow-y-auto bg-[#141416] border-t border-white/10 rounded-t-[28px] p-5">
            <div className="w-10 h-1.5 bg-white/20 rounded-full mx-auto mb-4"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-black text-xl">{selected.flight} • {selected.time}</div>
                <div className="text-sm text-white/60">{selected.origin_city} → {airport} • {selected.aircraft} • {selected.status}</div>
              </div>
              <button onClick={()=>setSelected(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">✕</button>
            </div>

            {/* CRM */}
            <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-4 mb-4">
              <div className="font-bold text-sm mb-3">👤 Thông tin khách</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input value={customerForm.name} onChange={e=>setCustomerForm({...customerForm, name:e.target.value})} placeholder="Tên khách" className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm"/>
                <input value={customerForm.phone} onChange={e=>setCustomerForm({...customerForm, phone:e.target.value})} placeholder="SĐT" className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm"/>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <input type="number" value={customerForm.pax} onChange={e=>setCustomerForm({...customerForm, pax:Number(e.target.value)})} placeholder="Số khách" className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm"/>
                <input type="number" value={customerForm.thu} onChange={e=>setCustomerForm({...customerForm, thu:Number(e.target.value)})} placeholder="Thu khách" className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm"/>
                <input type="number" value={customerForm.chi} onChange={e=>setCustomerForm({...customerForm, chi:Number(e.target.value)})} placeholder="Chi phí" className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm"/>
              </div>
              <input value={customerForm.note} onChange={e=>setCustomerForm({...customerForm, note:e.target.value})} placeholder="Ghi chú: đón cửa A1, 2 vali..." className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm mb-3"/>
              <div className="flex gap-2">
                <button onClick={saveCustomer} className="flex-1 bg-white text-black font-bold py-2.5 rounded-xl text-sm">💾 Lưu khách</button>
                <a href={`tel:${customerForm.phone}`} className="px-4 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-sm">📞 Gọi</a>
                <button onClick={()=>{
                  const msg = `A/C ${customerForm.name} ơi, chuyến ${selected.flight} từ ${selected.origin_city} đáp ${selected.time} tại ${airport}, xe em đón ở cửa A1, ${dest.label} ${km}km ạ. t.lal.vn`
                  window.open(`https://zalo.me/share?text=${encodeURIComponent(msg)}`)
                }} className="px-4 bg-[#0068FF] rounded-xl text-sm font-bold">Zalo</button>
              </div>
            </div>

            {/* Dest + pricing */}
            <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-4 mb-4">
              <div className="font-bold text-sm mb-3">📍 Quãng đường & Giá Grab vs Xanh SM</div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3">
                {DESTS.map(d=>(
                  <button key={d.id} onClick={()=>setDest(d)} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs border ${dest.id===d.id? 'bg-white text-black border-white':'bg-white/10 border-white/10'}`}>{d.label} {d.km? `${d.km}km`:''}</button>
                ))}
              </div>
              {dest.id==='CUSTOM' && <input type="number" value={customKm} onChange={e=>setCustomKm(Number(e.target.value))} className="w-full mb-3 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm" placeholder="Nhập km"/>}
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#00B14F]/10 border border-[#00B14F]/20 rounded-xl p-3">
                  <div className="text-[11px] font-black text-[#00B14F] mb-2">GRAB</div>
                  {Object.entries(PRICING).filter(([k])=>k.startsWith('grab')).map(([k,v]:any)=>{
                    const price = formatVND(calcPrice(km, v))
                    return <div key={k} className="flex justify-between text-xs py-1"><span className="text-white/60">{v.label}</span><span className="font-bold">{price/1000}k</span></div>
                  })}
                </div>
                <div className="bg-[#00AEEF]/10 border border-[#00AEEF]/20 rounded-xl p-3">
                  <div className="text-[11px] font-black text-[#00AEEF] mb-2">XANH SM</div>
                  {Object.entries(PRICING).filter(([k])=>k.startsWith('xanh')).map(([k,v]:any)=>{
                    const price = formatVND(calcPrice(km, v))
                    return <div key={k} className="flex justify-between text-xs py-1"><span className="text-white/60">{v.label}</span><span className="font-bold">{price/1000}k</span></div>
                  })}
                </div>
              </div>
              <div className="mt-3 bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-2.5 flex justify-between items-center">
                <div className="text-xs"><span className="text-white/50">Lãi dự kiến:</span> <span className="font-black">{Math.round((customerForm.thu - customerForm.chi - calcPrice(km, PRICING.grab4))/1000)}k</span></div>
                <div className="text-[10px] text-white/40">Phí SB 15k đã gồm</div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={()=>window.open('https://m.grab.com')} className="flex-1 bg-[#00B14F] text-white font-bold py-2.5 rounded-xl text-xs">Đặt Grab</button>
                <button onClick={()=>window.open('https://www.xanhsm.com')} className="flex-1 bg-[#00AEEF] text-white font-bold py-2.5 rounded-xl text-xs">Đặt Xanh SM</button>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button onClick={()=>alert('Bãi đỗ: A còn 3, B còn 1, C còn 5 - Đã lưu vị trí của bạn tại Bãi A')} className="bg-white/10 border border-white/10 rounded-xl py-3 text-xs">🅿️ Bãi đỗ</button>
              <button onClick={()=>window.open(`https://www.google.com/maps/dir/?api=1&destination=${airport}+Airport`)} className="bg-white/10 border border-white/10 rounded-xl py-3 text-xs">🗺️ Dẫn đường</button>
              <button onClick={()=>{ const u=new SpeechSynthesisUtterance(`Đón khách ${customerForm.name} chuyến ${selected.flight} lúc ${selected.time}`); speechSynthesis.speak(u)}} className="bg-white/10 border border-white/10 rounded-xl py-3 text-xs">🔊 Đọc tên</button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-[#141416]/90 backdrop-blur-xl border-t border-white/10 px-4 py-3 flex justify-around text-[11px]">
        <div className="text-center"><div>✈️</div><div className="font-bold text-yellow-400">Arrivals</div></div>
        <div className="text-center text-white/40"><div>🅿️</div><div>Bãi đỗ</div></div>
        <div className="text-center text-white/40"><div>📊</div><div>Thống kê</div></div>
        <div className="text-center text-white/40"><div>⚙️</div><div>Cài đặt</div></div>
      </div>
    </div>
  )
}
