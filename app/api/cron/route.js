
import { NextResponse } from 'next/server'
export const dynamic='force-dynamic'
export async function GET(){
  return NextResponse.json({ok:true,message:'Minimal hiệu quả không cần cron, API tự gen 25 chuyến mỗi lần gọi, luôn chạy'})
}
