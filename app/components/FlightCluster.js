
'use client'
import FlightCard from './FlightCard'
export default function FlightCluster({cluster,now}){
  const formatTime=(iso)=> new Date(iso).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})
  return (
    <div className="bg-white border border-[#dadce0] rounded-[24px] overflow-hidden shadow-[0_1px_2px_rgba(60,64,67,0.3)]">
      <div className="px-5 py-3 bg-[#f8f9fa] border-b border-[#dadce0] flex justify-between">
        <span className="font-medium text-[13px]">{cluster.window} • {cluster.count} chuyến • Gom 60p</span>
        <span className="text-[12px] px-2.5 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8]">XP {formatTime(cluster.suggest_depart)}</span>
      </div>
      <div>
        {cluster.flights.map(f=> <FlightCard key={f.number+f.scheduled} flight={f} now={now} />)}
      </div>
    </div>
  )
}
