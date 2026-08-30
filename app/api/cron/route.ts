import { createClient } from '@supabase/supabase-js'

const AIRPORTS = ['SGN','VCA','HAN','DAD','CXR','PQC']

function mockFlights(iata:string){
  // data that cho VCA lay tu anh that 14 chuyen
  if(iata==='VCA') return [
    {time:'08:55', origin:'HAN', origin_city:'Hanoi', flight:'VJ461', airline:'Vietjet Air', aircraft:'A321', status:'LIVE', actual:'08:44'},
    {time:'09:00', origin:'HAN', origin_city:'Hanoi', flight:'VN1201', airline:'Vietnam Airlines', aircraft:'A21N', status:'LIVE', actual:'08:44'},
    {time:'11:10', origin:'DAD', origin_city:'Da Nang', flight:'VJ701', airline:'Vietjet Air', aircraft:'321', status:'Scheduled'},
    {time:'11:10', origin:'DLI', origin_city:'Da Lat', flight:'VN8021', airline:'Vietnam Airlines', aircraft:'ATR', status:'Scheduled'},
    {time:'12:30', origin:'HAN', origin_city:'Hanoi', flight:'VJ463', airline:'Vietjet Air', aircraft:'320', status:'Scheduled'},
    {time:'14:50', origin:'DAD', origin_city:'Da Nang', flight:'VJ703', airline:'Vietjet Air', aircraft:'321', status:'Scheduled'},
    {time:'14:50', origin:'HAN', origin_city:'Hanoi', flight:'VN6345', airline:'Vietnam Airlines', aircraft:'321', status:'Scheduled'},
    {time:'15:20', origin:'DAD', origin_city:'Da Nang', flight:'VN1441', airline:'Vietnam Airlines', aircraft:'321', status:'Scheduled'},
    {time:'15:40', origin:'VCS', origin_city:'Con Dao', flight:'VN8071', airline:'Vietnam Airlines', aircraft:'ATR', status:'Scheduled'},
    {time:'16:40', origin:'HAN', origin_city:'Hanoi', flight:'VJ467', airline:'Vietjet Air', aircraft:'320', status:'Scheduled'},
    {time:'18:35', origin:'PQC', origin_city:'Phu Quoc', flight:'VN8074', airline:'Vietnam Airlines', aircraft:'ATR', status:'Scheduled'},
    {time:'18:50', origin:'HAN', origin_city:'Hanoi', flight:'VN1207', airline:'Vietnam Airlines', aircraft:'787', status:'Scheduled'},
    {time:'19:10', origin:'HAN', origin_city:'Hanoi', flight:'VJ465', airline:'Vietjet Air', aircraft:'321', status:'Scheduled'},
    {time:'19:30', origin:'VII', origin_city:'Vinh', flight:'VJ481', airline:'Vietjet Air', aircraft:'321', status:'Scheduled'},
  ]
  const base = [
    {time:'06:45', origin:'HAN', origin_city:'Hanoi', flight:`VJ461`, airline:'Vietjet Air', aircraft:'A321', status:'Scheduled'},
    {time:'07:10', origin:'DAD', origin_city:'Da Nang', flight:`VJ701`, airline:'Vietjet Air', aircraft:'321', status:'Scheduled'},
    {time:'08:00', origin:'PQC', origin_city:'Phu Quoc', flight:`VN8021`, airline:'Vietnam Airlines', aircraft:'ATR', status:'Scheduled'},
    {time:'09:20', origin:'VCS', origin_city:'Con Dao', flight:`VN8071`, airline:'Vietnam Airlines', aircraft:'ATR', status:'LIVE'},
    {time:'11:30', origin:'HAN', origin_city:'Hanoi', flight:`VN1201`, airline:'Vietnam Airlines', aircraft:'A21N', status:'Scheduled'},
  ]
  return base
}

export async function GET(){
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
  const aviationKey = process.env.AVIATIONSTACK_KEY
  let supabase:any = null
  if(supabaseUrl && supabaseKey){
    supabase = createClient(supabaseUrl, supabaseKey)
  }

  let results:any = {}
  for(const iata of AIRPORTS){
    let flights:any[] = []
    let is_mock = true
    try{
      if(aviationKey){
        const url = `http://api.aviationstack.com/v1/flights?access_key=${aviationKey}&arr_iata=${iata}&limit=25`
        const r = await fetch(url, { next:{ revalidate:0 }})
        const j = await r.json()
        if(j.data && j.data.length>0){
          flights = j.data.map((f:any)=>({
            time: f.arrival?.scheduled?.slice(11,16) || '00:00',
            origin: f.departure?.iata || 'HAN',
            origin_city: f.departure?.iata || 'Hanoi',
            flight: f.flight?.iata || 'VJ000',
            airline: (f.airline?.name||'').toLowerCase().includes('vietjet') ? 'Vietjet Air' : 'Vietnam Airlines',
            aircraft: f.aircraft?.iata || '321',
            status: f.flight_status==='landed' || f.flight_status==='active' ? 'LIVE' : 'Scheduled',
            actual: f.arrival?.actual?.slice(11,16) || null
          }))
          is_mock = false
        }
      }
    }catch(e){ console.log('aviation error', e) }

    if(flights.length===0){
      flights = mockFlights(iata)
    }

    // sort and group <=60p
    flights.sort((a,b)=> a.time.localeCompare(b.time))
    let groups:any[]=[]; let cur:any[]=[]
    for(let i=0;i<flights.length;i++){
      if(cur.length===0) cur.push(flights[i])
      else {
        const toMin = (t:string)=>{ const [h,m]=t.split(':').map(Number); return h*60+m }
        const diff = toMin(flights[i].time) - toMin(cur[cur.length-1].time)
        if(diff<=60) cur.push(flights[i])
        else { groups.push(cur); cur=[flights[i]] }
      }
    }
    if(cur.length) groups.push(cur)

    const payload = { flights, groups, updated_at: new Date().toISOString(), is_mock, iata }
    results[iata]=payload
    if(supabase){
      await supabase.from('flight_cache').upsert({ iata, data: payload, updated_at: new Date().toISOString() })
    }
  }

  return Response.json({ ok:true, results, time: new Date().toISOString() })
}
