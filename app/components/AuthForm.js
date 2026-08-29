
'use client'
import { useState } from 'react'
export default function AuthForm({mode}){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [msg,setMsg]=useState('')
  const submit=async(e)=>{
    e.preventDefault()
    setMsg('Đang xử lý...')
    const res=await fetch(`/api/auth/${mode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
    const j=await res.json()
    setMsg(j.message||JSON.stringify(j))
    if(j.ok && mode==='login') window.location.href='/'
  }
  return (
    <form onSubmit={submit} className="bg-white border border-[#dadce0] rounded-[24px] p-6 space-y-4">
      <div className="font-medium text-[20px]">{mode==='login'?'Đăng nhập':'Đăng ký'} f.lal.vn</div>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-full border border-[#dadce0]" required />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mật khẩu" className="w-full px-4 py-3 rounded-full border border-[#dadce0]" required />
      <button type="submit" className="w-full py-3 rounded-full bg-[#1a73e8] text-white font-medium">{mode==='login'?'Đăng nhập':'Đăng ký'}</button>
      <div className="text-[12px] text-[#5f6368]">{msg}</div>
      <div className="text-[12px]">{mode==='login'?<a href="/register" className="text-[#1a73e8]">Chưa có tài khoản? Đăng ký</a>:<a href="/login" className="text-[#1a73e8]">Đã có tài khoản? Đăng nhập</a>}</div>
    </form>
  )
}
