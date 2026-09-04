import React from 'react';

export default function SteamEffect() {
  return (
    <div
      className="absolute pointer-events-none z-20 select-none overflow-visible"
      style={{
        right: '10%',
        top: '18%',
        width: '450px',
        height: '520px',
        // Mask edges smoothly with radial/linear fade so NO square box edge can EVER appear
        WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 65%, black 45%, transparent 80%)',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 65%, black 45%, transparent 80%)',
      }}
      aria-hidden="true"
    >
      {/* --- DENSE VAPOR CORE (Nhiều khói, bốc lên từ lòng bát) --- */}

      {/* Cloud 1: Core Center Dense Steam */}
      <div
        className="vapor-cloud-1 absolute bottom-6 left-[36%] w-40 h-48 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.35) 35%, rgba(245,240,230,0.12) 60%, transparent 75%)',
          filter: 'blur(12px)',
          animationDelay: '-0.5s',
        }}
      ></div>

      {/* Cloud 2: Core Left Billowing Puff */}
      <div
        className="vapor-cloud-2 absolute bottom-8 left-[24%] w-36 h-44 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.3) 35%, rgba(245,240,230,0.1) 58%, transparent 72%)',
          filter: 'blur(13px)',
          animationDelay: '-2.1s',
        }}
      ></div>

      {/* Cloud 3: Core Right Billowing Puff */}
      <div
        className="vapor-cloud-3 absolute bottom-6 left-[48%] w-44 h-52 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.32) 36%, rgba(245,240,230,0.1) 60%, transparent 75%)',
          filter: 'blur(14px)',
          animationDelay: '-3.8s',
        }}
      ></div>

      {/* Cloud 4: Deep Hot Broth Swirl */}
      <div
        className="vapor-cloud-1 absolute bottom-4 left-[32%] w-36 h-40 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.4) 30%, transparent 68%)',
          filter: 'blur(10px)',
          animationDelay: '-1.4s',
        }}
      ></div>

      {/* Cloud 5: Wide Atmospheric Plume */}
      <div
        className="vapor-cloud-2 absolute bottom-12 left-[40%] w-48 h-56 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.25) 38%, rgba(245,240,230,0.08) 65%, transparent 80%)',
          filter: 'blur(16px)',
          animationDelay: '-3.2s',
        }}
      ></div>

      {/* Cloud 6: Secondary Left Wisp */}
      <div
        className="vapor-cloud-3 absolute bottom-14 left-[20%] w-32 h-40 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.28) 32%, transparent 70%)',
          filter: 'blur(11px)',
          animationDelay: '-4.9s',
        }}
      ></div>

      {/* Cloud 7: Secondary Right Soft Diffusion */}
      <div
        className="vapor-cloud-1 absolute bottom-10 left-[54%] w-38 h-48 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.25) 35%, transparent 72%)',
          filter: 'blur(14px)',
          animationDelay: '-2.8s',
        }}
      ></div>

      {/* Cloud 8: High Ambient Rising Steam */}
      <div
        className="vapor-cloud-2 absolute bottom-16 left-[34%] w-44 h-52 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 35%, transparent 68%)',
          filter: 'blur(15px)',
          animationDelay: '-5.7s',
        }}
      ></div>

      {/* Cloud 9: Delicate Floating Vapor Veil */}
      <div
        className="vapor-cloud-3 absolute bottom-8 left-[44%] w-36 h-44 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.28) 30%, transparent 65%)',
          filter: 'blur(12px)',
          animationDelay: '-1.1s',
        }}
      ></div>

      {/* Cloud 10: Extra Broth Rim Vapor */}
      <div
        className="vapor-cloud-1 absolute bottom-2 left-[30%] w-32 h-36 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.35) 32%, transparent 70%)',
          filter: 'blur(9px)',
          animationDelay: '-4.4s',
        }}
      ></div>
    </div>
  );
}
