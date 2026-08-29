
import { NextResponse } from 'next/server'
export const dynamic='force-dynamic'
export async function GET(){
  return NextResponse.json({ok:true,message:'Modular: components tách riêng, auth login/register, data lấy hết SG,HAN,DAD,VCA - không chỉ SG'})
}
