
import { NextResponse } from 'next/server'
export const dynamic='force-dynamic'
export async function GET(req){
  const {searchParams}=new URL(req.url)
  const airport=(searchParams.get('airport')||'VCA').toUpperCase()
  return NextResponse.json({iata:airport,message:'Detailed flights gen in frontend - see FlightMap + FlightDetailCard, hien thi nhieu thong tin nhu Flightradar24'})
}
