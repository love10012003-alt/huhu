import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request){
  const { searchParams } = new URL(req.url)
  const iata = (searchParams.get('airport') || 'VCA').toUpperCase()

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY

  if(supabaseUrl && supabaseKey){
    try{
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data } = await supabase.from('flight_cache').select('data').eq('iata', iata).single()
      if(data?.data) return Response.json(data.data)
    }catch(e){}
  }

  // fallback mock VCA
  const mockVCA = {
    flights: [
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
    ],
    groups: [],
    is_mock: true,
    iata: 'VCA',
    updated_at: new Date().toISOString()
  }
  // group
  const flights = mockVCA.flights.sort((a,b)=>a.time.localeCompare(b.time))
  let groups:any[]=[]; let cur:any[]=[]
  for(let f of flights){
    if(cur.length===0) cur.push(f)
    else {
      const toMin = (t:string)=>{ const [h,m]=t.split(':').map(Number); return h*60+m }
      const diff = toMin(f.time)-toMin(cur[cur.length-1].time)
      if(diff<=60) cur.push(f)
      else { groups.push(cur); cur=[f] }
    }
  }
  if(cur.length) groups.push(cur)
  mockVCA.groups = groups
  return Response.json(iata==='VCA'? mockVCA : { flights: flights.slice(0,6), groups, is_mock:true, iata, updated_at: new Date().toISOString() })
}
