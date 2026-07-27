import React, { useRef } from 'react';
import { motion } from 'motion/react';

interface HomeProps {
  onNavigate: (tab: 'home' | 'history' | 'text' | 'pdf' | 'image' | 'video' | 'settings') => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const tools = [
    { id: 'history', name: 'History', icon: 'history', imgUrl: '/dash_new.png', vidUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    { id: 'video', name: 'Video Analysis', icon: 'movie', imgUrl: '/vid_new.png', vidUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
    { id: 'image', name: 'Image Analysis', icon: 'image', imgUrl: '/img_new.png', vidUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
    { id: 'pdf', name: 'PDF Analysis', icon: 'picture_as_pdf', imgUrl: '/pdf_new.png', vidUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
    { id: 'text', name: 'Text Analysis', icon: 'article', imgUrl: '/text_new.png', vidUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4' },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center pt-8 pb-16 px-4 relative overflow-hidden bg-transparent">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center opacity-[0.03]">
        <div className="w-[800px] h-[800px] rounded-full border-[2px] border-[#300000] absolute scale-150"></div>
        <div className="w-[600px] h-[600px] rounded-full border-[2px] border-[#800000] absolute scale-125"></div>
        <div className="w-[400px] h-[400px] rounded-full border-[2px] border-[#300000] absolute scale-100"></div>
      </div>

      {/* Hero Text */}
      <div className="relative z-10 flex flex-col items-center mb-16 mt-8">
        <h1 className="flex flex-col items-center text-center text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[100px] font-black leading-[0.85] tracking-tighter uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
          <span className="block text-[#300000] pb-2 drop-shadow-xl">FORENSIQ</span>
          <span className="block text-[#800000] mt-1 tracking-[0.2em] relative drop-shadow-lg">AI</span>
        </h1>
        <p className="mt-8 text-[#300000]/60 text-sm md:text-base font-bold tracking-widest uppercase">
          Select an Analysis Module to Begin
        </p>
      </div>

      {/* Tools Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 w-full max-w-[1400px] px-4 md:px-12 mt-8 perspective-[1000px]">
        {tools.map((tool, index) => {
          const videoRef = useRef<HTMLVideoElement>(null);

          const handleMouseEnter = () => {
            if (videoRef.current) {
              videoRef.current.play().catch(() => {});
            }
          };

          const handleMouseLeave = () => {
            if (videoRef.current) {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
            }
          };

          return (
            <div 
              key={tool.id}
              onClick={() => onNavigate(tool.id as any)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="group cursor-pointer rounded-3xl p-6 h-64 md:h-80 flex flex-col justify-between border-2 border-[#800000] hover:border-[#800000] transition-all duration-500 hover:-translate-y-4 shadow-lg hover:shadow-2xl hover:shadow-[#800000]/30 relative overflow-hidden transform-gpu hover:scale-[1.02] bg-white"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* 3D Animated Original Background Image */}
              <div className="absolute inset-0 overflow-hidden" style={{ perspective: 1000 }}>
                <motion.div 
                  className="absolute inset-0 bg-cover bg-center opacity-80" 
                  style={{ backgroundImage: `url(${tool.imgUrl})`, scale: 1.25, transformStyle: 'preserve-3d' }}
                  animate={{ 
                    x: [0, -25, 25, 0],
                    y: [0, 25, -25, 0],
                    rotateZ: [0, 5, -5, 0],
                    rotateX: [0, 15, -15, 0],
                    rotateY: [0, -15, 15, 0],
                  }}
                  transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              {/* Hover Video */}
              <video
                ref={videoRef}
                src={tool.vidUrl}
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              />
              
              {/* Overlay Gradient to make text readable */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/70 to-white/20 group-hover:from-white/95 group-hover:via-white/70 transition-all duration-500 pointer-events-none"></div>

              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/90 shadow-md backdrop-blur-sm flex items-center justify-center border border-[#800000]/20 group-hover:bg-[#800000] transition-colors duration-300 z-10">
                <span className="material-symbols-outlined text-[#800000] group-hover:text-white text-2xl md:text-3xl transition-colors duration-300">{tool.icon}</span>
              </div>
              
              <div className="z-10">
                <h3 className="text-[#300000] font-black text-lg md:text-xl tracking-tight leading-tight group-hover:text-[#800000] transition-colors">{tool.name}</h3>
                <div className="w-0 h-1 bg-[#800000] mt-3 group-hover:w-full transition-all duration-500 rounded-full"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
