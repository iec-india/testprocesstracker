import React from 'react';

export function LoginScreen({ handleGoogleLogin }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-3 sm:p-4 relative overflow-hidden">
      <div className="absolute top-3 left-3 z-50 pointer-events-auto sm:top-4 sm:left-4 md:top-8 md:left-10">
        <img className="h-14 sm:h-[75px] md:h-[110px] drop-shadow-2xl hover:scale-105 transition-transform duration-300" src="/logo_clear.png" alt="IEC Logo" loading="lazy" decoding="async" />
      </div>
      <div className="hero-banner-container" style={{ height: '100vh', maskImage: 'none', WebkitMaskImage: 'none' }}>
        <div className="absolute inset-0 bg-slate-900/40 z-10 backdrop-blur-[2px]"></div>
        <div className="hero-slider-track" aria-hidden="true">
          {['bg1.jpg', 'bg2.jpg', 'bg3.jpg', 'bg4.jpg', 'bg1.jpg'].map((src, i) => (
            <img key={i} src={`/${src}`} alt="Decorative background" loading="lazy" decoding="async" />
          ))}
        </div>
      </div>
      <div className="premium-glass rounded-2xl p-5 md:p-8 w-full max-w-md text-center relative z-20 animate-step">
        <h2 className="text-2xl font-extrabold text-slate-800 mb-2 animate-title sm:text-3xl">Login</h2>
        <p className="text-sm text-slate-500 mb-6 font-medium sm:mb-8 sm:text-base">Please sign in with your authorized email to access the IEC Tracker.</p>
        <button onClick={handleGoogleLogin} className="premium-btn w-full py-3.5 text-[#0072CE] font-bold bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-center gap-3 shadow-sm hover:bg-blue-100 sm:py-4">
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-[#f8fafc] px-6">
      <div className="flex w-full max-w-xs -translate-y-[5vh] flex-col items-center sm:max-w-sm">
        <img src="/logo_clear.png" className="mb-7 h-28 animate-pulse sm:h-40" alt="Logo" />
        <h4 className="mb-5 text-center text-lg font-semibold text-[#0072CE] sm:text-xl">Initializing Secure Portal...</h4>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-300">
          <div className="h-full w-1/2 bg-[#0072CE] animate-slide-custom"></div>
        </div>
      </div>
    </div>
  );
}
