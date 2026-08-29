
'use client'
import { useState, useEffect } from 'react'
export default function Home(){
  const [d,setD]=useState(null)
  useEffect(()=>{ fetch('/api/flights?airport=SGN').then(r=>r.json()).then(setD) },[])
  return <div style={{maxWidth:440,margin:'0 auto',padding:16}}><h1 style={{fontWeight:900}}>f.lal.vn • PRO MAX • {d?.is_mock?'MOCK':'REAL'} • {d?.flights?.length||0} chuyen</h1><p>Xoa vercel.json de het loi Hobby cron</p><a href="/api/cron" style={{color:'#facc15'}}>Bam /api/cron de nap 25 chuyen REAL</a></div>
}
