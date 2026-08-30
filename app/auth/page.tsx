'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function AuthPage(){
  const supabase = createClient()
  const [mode, setMode] = useState<'login'|'register'>('register')
  const [method, setMethod] = useState<'email'|'phone'>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'form'|'otp'|'verify-email'>('form')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleEmailAuth(){
    setLoading(true); setMsg('')
    try{
      if(mode==='register'){
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options:{ data:{ full_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback` }
        })
        if(error) throw error
        setStep('verify-email')
        setMsg(`Đã gửi email xác minh tới ${email}. Vui lòng kiểm tra hộp thư (cả spam) và bấm link xác minh.`)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if(error) throw error
        window.location.href='/'
      }
    }catch(e:any){ setMsg(e.message) }
    setLoading(false)
  }

  async function handlePhoneRequest(){
    setLoading(true); setMsg('')
    try{
      // format VN: +84
      let formatted = phone
      if(phone.startsWith('0')) formatted = '+84'+phone.slice(1)
      if(!formatted.startsWith('+')) formatted = '+84'+formatted
      const { error } = await supabase.auth.signInWithOtp({ phone: formatted })
      if(error) throw error
      setStep('otp')
      setMsg(`Đã gửi mã OTP 6 số tới ${formatted}. Nhập mã để xác minh. (Test OTP: 123456 nếu chưa cấu hình SMS)`)
    }catch(e:any){ setMsg(e.message) }
    setLoading(false)
  }

  async function verifyOtp(){
    setLoading(true)
    try{
      let formatted = phone
      if(phone.startsWith('0')) formatted = '+84'+phone.slice(1)
      if(!formatted.startsWith('+')) formatted = '+84'+formatted
      const { data, error } = await supabase.auth.verifyOtp({ phone: formatted, token: otp, type:'sms' })
      if(error) throw error
      window.location.href='/'
    }catch(e:any){ setMsg(e.message) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center font-black text-black text-xl mx-auto mb-3">t</div>
          <h1 className="text-2xl font-black">t.lal.vn PRO</h1>
          <p className="text-white/50 text-sm mt-1">Đăng ký thành viên • Xác minh Email / SĐT</p>
        </div>

        <div className="bg-white/[0.06] border border-white/10 rounded-[24px] p-6 backdrop-blur-xl">
          {/* Mode switch */}
          <div className="flex bg-black/50 rounded-full p-1 mb-5">
            <button onClick={()=>setMode('register')} className={`flex-1 py-2 rounded-full text-sm font-bold transition ${mode==='register'?'bg-white text-black':'text-white/60'}`}>Đăng ký</button>
            <button onClick={()=>setMode('login')} className={`flex-1 py-2 rounded-full text-sm font-bold transition ${mode==='login'?'bg-white text-black':'text-white/60'}`}>Đăng nhập</button>
          </div>

          {/* Method switch */}
          <div className="flex gap-2 mb-5">
            <button onClick={()=>{setMethod('email'); setStep('form')}} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 ${method==='email'?'bg-white text-black border-white':'bg-white/5 border-white/10 text-white/70'}`}>📧 Email</button>
            <button onClick={()=>{setMethod('phone'); setStep('form')}} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 ${method==='phone'?'bg-white text-black border-white':'bg-white/5 border-white/10 text-white/70'}`}>📱 SĐT</button>
          </div>

          {step==='form' && method==='email' && (
            <div className="space-y-3">
              {mode==='register' && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Họ tên (VD: Trần Quỳnh)" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm"/>}
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (vd: muoi@gmail.com)" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm"/>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mật khẩu (≥6 ký tự)" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm"/>
              <button onClick={handleEmailAuth} disabled={loading} className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-black py-3 rounded-xl text-sm mt-2 disabled:opacity-50">
                {loading? 'Đang xử lý...' : mode==='register' ? 'Đăng ký & Gửi email xác minh' : 'Đăng nhập'}
              </button>
              <p className="text-[11px] text-white/30 text-center">Bảo mật bằng Supabase Auth • Email sẽ nhận link xác minh</p>
            </div>
          )}

          {step==='form' && method==='phone' && (
            <div className="space-y-3">
              {mode==='register' && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Họ tên" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm"/>}
              <div className="flex gap-2">
                <div className="bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-sm text-white/50">+84</div>
                <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="912345678" className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm"/>
              </div>
              <button onClick={handlePhoneRequest} disabled={loading} className="w-full bg-gradient-to-r from-[#00AEEF] to-[#0068FF] text-white font-black py-3 rounded-xl text-sm mt-2 disabled:opacity-50">
                {loading? 'Đang gửi OTP...' : 'Gửi mã OTP qua SMS'}
              </button>
              <p className="text-[11px] text-white/30 text-center">Cần cấu hình Twilio trong Supabase • Test dùng OTP 123456</p>
            </div>
          )}

          {step==='otp' && (
            <div className="space-y-3">
              <div className="text-sm font-bold text-center">Nhập mã OTP 6 số</div>
              <input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="123456" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-center text-lg tracking-[0.3em] font-black"/>
              <button onClick={verifyOtp} disabled={loading} className="w-full bg-white text-black font-black py-3 rounded-xl text-sm">Xác minh OTP</button>
              <button onClick={()=>setStep('form')} className="w-full bg-white/10 border border-white/10 py-3 rounded-xl text-sm">← Quay lại</button>
            </div>
          )}

          {step==='verify-email' && (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-2xl">📧</div>
              <div className="font-bold">Đã gửi email xác minh!</div>
              <div className="text-sm text-white/60">Vui lòng mở email {email} và bấm link xác minh để kích hoạt tài khoản PRO.</div>
              <button onClick={()=>window.location.href='/'} className="w-full bg-white/10 border border-white/10 py-3 rounded-xl text-sm mt-3">Đã xác minh xong → Vào app</button>
            </div>
          )}

          {msg && <div className="mt-4 bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 text-xs text-yellow-200">{msg}</div>}
        </div>

        <div className="mt-4 text-center text-[11px] text-white/30">
          Bằng việc đăng ký, bạn đồng ý với điều khoản t.lal.vn PRO • Hỗ trợ: Zalo 0123456789
        </div>
      </div>
    </div>
  )
}
