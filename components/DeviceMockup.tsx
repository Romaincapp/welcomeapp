'use client'

interface DeviceMockupProps {
  videoSrc?: string
  className?: string
}

export default function DeviceMockup({ videoSrc = '/promo/demo.mp4', className = '' }: DeviceMockupProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Container principal avec dimensions fixes */}
      <div className="relative mx-auto w-[300px] h-[620px]">

        {/* Cadre extérieur - derrière la vidéo */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.8rem] shadow-2xl" />
        <div className="absolute inset-[3px] bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-[2.6rem]" />
        <div className="absolute inset-[5px] bg-black rounded-[2.5rem]" />

        {/* Vidéo de démo */}
        <video
          src={videoSrc}
          className="absolute inset-[8px] rounded-[2.3rem] z-10 bg-black object-cover"
          style={{
            width: 'calc(100% - 16px)',
            height: 'calc(100% - 16px)',
          }}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />

        {/* Side buttons */}
        <div className="absolute -left-[2px] top-28 w-[2px] h-6 bg-gray-600 rounded-l-sm z-20 pointer-events-none" />
        <div className="absolute -left-[2px] top-40 w-[2px] h-10 bg-gray-600 rounded-l-sm z-20 pointer-events-none" />
        <div className="absolute -left-[2px] top-56 w-[2px] h-10 bg-gray-600 rounded-l-sm z-20 pointer-events-none" />
        <div className="absolute -right-[2px] top-36 w-[2px] h-14 bg-gray-600 rounded-r-sm z-20 pointer-events-none" />
      </div>

      {/* Subtle glow effect */}
      <div className="absolute -inset-4 bg-white/5 blur-3xl rounded-full pointer-events-none -z-10" />
    </div>
  )
}
