'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { HikeWaypoint } from '@/types'

interface HikeElevationProfileProps {
  waypoints: HikeWaypoint[]
}

export default function HikeElevationProfile({ waypoints }: HikeElevationProfileProps) {
  const chartData = useMemo(() => {
    let cumulativeDistance = 0
    const data = waypoints.map((point, index) => {
      if (index > 0) {
        const prevPoint = waypoints[index - 1]
        const R = 6371
        const dLat = ((point.lat - prevPoint.lat) * Math.PI) / 180
        const dLon = ((point.lng - prevPoint.lng) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((prevPoint.lat * Math.PI) / 180) * Math.cos((point.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        cumulativeDistance += R * c
      }

      return {
        distance: Math.round(cumulativeDistance * 100) / 100,
        elevation: point.elevation || 0,
      }
    })

    return data
  }, [waypoints])

  if (waypoints.length === 0 || !waypoints.some(w => w.elevation)) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="text-lg">📊</span>
        Profil d'élévation
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <XAxis
            dataKey="distance"
            stroke="#6b7280"
            fontSize={11}
            label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5, fontSize: 11 }}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={11}
            label={{ value: 'Altitude (m)', angle: -90, position: 'insideLeft', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: any) => [`${value} m`, 'Altitude']}
            labelFormatter={(value: any) => `Distance: ${value} km`}
          />
          <Area
            type="monotone"
            dataKey="elevation"
            stroke="#059669"
            strokeWidth={2}
            fill="url(#elevationGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
