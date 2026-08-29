
'use client'
import { useState } from 'react'
export default function Home(){
  const [report,setReport]=useState('Bấm nút để kiểm tra...')
  const [results,setResults]=useState(null)
  const [loading,setLoading]=useState(false)
  
  const runAll=async()=>{
    setLoading(true)
    let full='=== BAO CAO LOI f.lal.vn - '+new Date().toISOString()+' ===\n\n'
    let res={}
    try{
      const r=await fetch('/api/debug',{cache:'no-store'})
      const j=await r.json()
      res.debug=j
      full+='=== /api/debug ===\n'+JSON.stringify(j,null,2)+'\n\n'
    }catch(e){ full+='Loi debug: '+e.message+'\n' }
    try{
      const r=await fetch('/api/cron',{cache:'no-store'})
      const j=await r.json()
      res.cron=j
      full+='=== /api/cron ===\n'+JSON.stringify(j,null,2)+'\n\n'
    }catch(e){ full+='Loi cron: '+e.message+'\n' }
    try{
      const r=await fetch('/api/flights?airport=SGN',{cache:'no-store'})
      const j=await r.json()
      res.flights=j
      full+='=== /api/flights ===\n'+JSON.stringify(j,null,2)+'\n'
    }catch(e){ full+='Loi flights: '+e.message }
    setReport(full)
    setResults(res)
    setLoading(false)
  }
  
  const copyReport=()=>{
    navigator.clipboard.writeText(report)
    alert('Đã copy báo cáo! Dán gửi mình nhé!')
  }
  
  return (
    <div style={{maxWidth:480,margin:'0 auto',background:'#0f0f10',minHeight:'100vh',padding:16,color:'white'}}>
      <h1 style={{fontWeight:900}}>🔍 f.lal.vn - KIEM TRA LOI</h1>
      <p style={{fontSize:12,color:'#888'}}>Domain chính: f.lal.vn - Bấm nút dưới để kiểm tra toàn bộ</p>
      
      <button onClick={runAll} disabled={loading} style={{width:'100%',padding:14,borderRadius:12,background:'#facc15',color:'black',fontWeight:900,marginTop:12}}>
        {loading?'Đang kiểm tra...':'🚀 BẮT ĐẦU KIỂM TRA TOÀN BỘ'}
      </button>
      
      {results && (
        <div style={{marginTop:12}}>
          <div style={{padding:12,borderRadius:12,background:'#151518',border:'1px solid #333'}}>
            <div style={{fontSize:12,fontWeight:700}}>Kết quả kiểm tra:</div>
            <div style={{fontSize:11,marginTop:8}}>
              <div>SUPABASE_URL: {results.debug?.env?.SUPABASE_URL ? '✅ có' : '❌ THIẾU'}</div>
              <div>SECRET: {results.debug?.env?.SECRET ? '✅ có' : '❌ THIẾU'}</div>
              <div>AVIATION: {results.debug?.env?.AVIATION ? '✅ có' : '❌ THIẾU'}</div>
              <div>Bảng flight_cache: {results.debug?.supabase?.tableExists ? '✅ có' : '❌ KHÔNG CÓ'}</div>
              <div>Supabase OK: {results.debug?.supabase?.ok ? '✅' : '❌ '+results.debug?.supabase?.error}</div>
              <div>Aviation OK: {results.debug?.aviation?.ok ? '✅ '+results.debug?.aviation?.count+' chuyến' : '❌ '+results.debug?.aviation?.error}</div>
              <div>Cron: {results.cron?.ok ? '✅ '+results.cron?.count+' chuyến' : '❌ '+results.cron?.error}</div>
              <div>Flights: {results.flights?.flights?.length||0} chuyến - is_mock: {String(results.flights?.is_mock)}</div>
            </div>
          </div>
        </div>
      )}
      
      <div style={{marginTop:12}}>
        <div style={{fontSize:12,fontWeight:700}}>📋 Báo cáo chi tiết (copy gửi mình):</div>
        <textarea value={report} readOnly style={{width:'100%',height:350,marginTop:8,padding:12,borderRadius:12,background:'black',color:'#0f0',fontFamily:'monospace',fontSize:11}} />
        <button onClick={copyReport} style={{width:'100%',padding:12,borderRadius:12,background:'white',color:'black',fontWeight:900,marginTop:8}}>📋 COPY BÁO CÁO GỬI MÌNH</button>
      </div>
      
      <div style={{marginTop:12,padding:12,borderRadius:12,background:'#1a1a1e',fontSize:11,color:'#aaa'}}>
        <div>Debug links:</div>
        <div><a href="/api/debug" target="_blank" style={{color:'#facc15'}}>/api/debug</a> - Kiểm tra hệ thống</div>
        <div><a href="/api/cron" target="_blank" style={{color:'#facc15'}}>/api/cron</a> - Nạp REAL</div>
        <div><a href="/api/flights?airport=SGN" target="_blank" style={{color:'#facc15'}}>/api/flights?airport=SGN</a></div>
      </div>
    </div>
  )
}
