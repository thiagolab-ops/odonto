import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark font-display text-text-main dark:text-slate-100 antialiased overflow-x-hidden selection:bg-primary selection:text-white pb-24">
      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .glassmorphism {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
        .dark .glassmorphism { background: rgba(15, 32, 35, 0.7); }
      ` }} />

      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-2">
        <div className="glassmorphism rounded-full px-4 py-3 flex items-center justify-between shadow-sm border border-white/50 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="text-primary flex items-center justify-center p-1 bg-primary/10 rounded-full">
              <span className="material-symbols-outlined text-2xl">dentistry</span>
            </div>
            <h1 className="text-secondary dark:text-white text-lg font-bold tracking-tight">OdontoPrime</h1>
          </div>
          <button className="bg-secondary/10 dark:bg-white/10 hover:bg-secondary/20 dark:hover:bg-white/20 text-secondary dark:text-white text-sm font-semibold py-2 px-4 rounded-full transition-colors duration-200">
            Contato
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden">

        {/* Vídeo Background com Fallback Escuro */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
        >
          {/* Tenta rodar o vídeo local do usuário */}
          <source src="/hero-video.mp4" type="video/mp4" />
          <source src="/hero-video.webm" type="video/webm" />
          {/* Plano B: Se o local falhar, roda este vídeo externo estético para não quebrar o layout */}
          <source src="https://cdn.pixabay.com/video/2020/05/21/40017-424606117_tiny.mp4" type="video/mp4" />
        </video>

        {/* Overlay de Gradiente para garantir a leitura perfeita das letras brancas */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90 pointer-events-none"></div>

        {/* CONTEÚDO ORIGINAL DA ODONTOPRIME (Mantenha o conteúdo existente aqui dentro) */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto pt-20">

          <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-white uppercase bg-white/20 backdrop-blur-md rounded-full border border-white/10">
            Odontologia Premium
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4 drop-shadow-lg">
            O seu sorriso perfeito <br /><span className="text-primary">começa aqui.</span>
          </h2>
          <p className="text-slate-200 text-base md:text-lg font-medium leading-relaxed mb-8 max-w-xs mx-auto drop-shadow-md">
            Experimente tratamentos odontológicos de classe mundial para sua confiança e conforto.
          </p>
          <Link href="/tratamentos" className="relative group w-full max-w-xs overflow-hidden rounded-xl bg-primary py-4 px-8 text-secondary font-bold text-lg shadow-[0_0_20px_rgba(7,182,213,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center">
            <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:animate-[pulse_1.5s_ease-in-out_infinite]"></div>
            <span className="relative flex items-center justify-center gap-2">
              Agendar Avaliação
              <span className="material-symbols-outlined text-xl">calendar_month</span>
            </span>
          </Link>

        </div>
      </section>

      {/* Trust Stats Section */}
      <section className="py-10 px-6 max-w-screen-md mx-auto w-full">
        <div className="flex justify-between items-center divide-x divide-slate-200 dark:divide-slate-700">
          <div className="flex-1 text-center px-2">
            <p className="text-3xl font-black text-secondary dark:text-white">10<span className="text-primary">+</span></p>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mt-1">Anos de Experiência</p>
          </div>
          <div className="flex-1 text-center px-2">
            <p className="text-3xl font-black text-secondary dark:text-white">5k<span className="text-primary">+</span></p>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mt-1">Sorrisos Transformados</p>
          </div>
          <div className="flex-1 text-center px-2">
            <p className="text-3xl font-black text-secondary dark:text-white">4.9</p>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mt-1">Avaliação Média</p>
          </div>
        </div>
      </section>

      {/* Specialties Section (Horizontal Scroll) */}
      <section className="py-4 max-w-screen-md mx-auto w-full">
        <div className="flex items-center justify-between px-6 mb-6">
          <h3 className="text-2xl font-bold text-secondary dark:text-white">Nossas Especialidades</h3>
          <Link href="/tratamentos" className="text-primary text-sm font-bold hover:text-primary/80 transition-colors">Ver Mais</Link>
        </div>

        {/* Snap Container */}
        <div className="flex overflow-x-auto gap-4 px-6 pb-8 snap-x snap-mandatory no-scrollbar">
          {/* Card 1: Invisalign */}
          <Link href="/tratamentos" className="snap-center shrink-0 w-[80vw] max-w-sm flex flex-col rounded-2xl bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden group">
            <div className="h-48 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBqHZcOM5V1Cljs6Np3l2gDUuL8dJRB1Nz7loGNFn0qbztEAET-GE3k0o0LIzhobe1UgTYwu7gLMdKDDV-HUcItHrQYJCkQEklzy8VLHghChGb_PhSZprOd7OFn70kLHBvPVoXuR83kBPSJCaqv8i6nglvcndR8eMWJaw3wiLB-C6q8GoFbOQNdxVTwFy8QoW-84GZYlj6I3-2ElOrCELE_NWoaJ46XVSDRltO4sN1_uyX6YYWFv6LC2Gswr88n0m03KLS31s2iMltj')" }}>
            </div>
            <div className="p-5 flex flex-col flex-1 relative bg-white dark:bg-slate-800 z-10">
              <div className="absolute -top-6 right-5 bg-primary text-secondary p-3 rounded-xl shadow-lg">
                <span className="material-symbols-outlined block">all_inclusive</span>
              </div>
              <h4 className="text-xl font-bold text-secondary dark:text-white mb-2">Invisalign</h4>
              <p className="text-text-muted text-sm leading-relaxed mb-4">Alinhadores transparentes para uma jornada de correção quase invisível.</p>
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center text-primary font-bold text-sm">
                Saiba Mais <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
              </div>
            </div>
          </Link>

          {/* Card 2: Veneers */}
          <Link href="/tratamentos" className="snap-center shrink-0 w-[80vw] max-w-sm flex flex-col rounded-2xl bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden group">
            <div className="h-48 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDhsgELqwJc2ZxtmnhbH9KsPTCQh6B5Bxq_X6rtZoaM1GbVWiQ7S_A98_uWMPKN3SJcAa0H2j8-ClzFxL8_Jl-vTdw1OwFfTXAccuR6m0PSTI7DUEE7fo9Zd6ovjseuwsOV_G4gziKlz5eiXguhcTNQ2gJ07AxI3Z6oU7bFMtePhljpvOLqt74DizuVJKuQNKcI1q83h9v9eMopVLyJtnOPOGC_ycgp3saUsKOJddbAATreReayQkpBD-7n6TkjoA1AXhJWCHdSHVQr')" }}>
            </div>
            <div className="p-5 flex flex-col flex-1 relative bg-white dark:bg-slate-800 z-10">
              <div className="absolute -top-6 right-5 bg-primary text-secondary p-3 rounded-xl shadow-lg">
                <span className="material-symbols-outlined block">auto_awesome</span>
              </div>
              <h4 className="text-xl font-bold text-secondary dark:text-white mb-2">Lentes de Porcelana</h4>
              <p className="text-text-muted text-sm leading-relaxed mb-4">Transforme seu sorriso instantaneamente com lentes de cerâmica ultrafinas.</p>
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center text-primary font-bold text-sm">
                Saiba Mais <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
              </div>
            </div>
          </Link>

          {/* Card 3: Implants */}
          <Link href="/tratamentos" className="snap-center shrink-0 w-[80vw] max-w-sm flex flex-col rounded-2xl bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden group">
            <div className="h-48 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuARRtKX_OfCQUM9If7ZzliEUg3OJmqwAJAMY0YAN9EAV1W0d_fY9X5nzH02hAd8z7dWS3x6hL1AmqB0dHZxW1IYJU3cNiPGsnl_QKKnnAvkp0s4T3lNoY-AbD9AFvcJweducGTI69x7Ti7TYK-JcbWVo1gI5AD29Ktjx15w9YeqHdHTIYjz0xFy78DPM7FJxC9jVhr581ds3t3oaTDGIORpUm8Wp0-9cK-thnoxb2XgEcCNHVwVS1SP4YMwXUwyzN5ijRu0KZ1ZDcLK')" }}>
            </div>
            <div className="p-5 flex flex-col flex-1 relative bg-white dark:bg-slate-800 z-10">
              <div className="absolute -top-6 right-5 bg-primary text-secondary p-3 rounded-xl shadow-lg">
                <span className="material-symbols-outlined block">change_circle</span>
              </div>
              <h4 className="text-xl font-bold text-secondary dark:text-white mb-2">Implantes Dentários</h4>
              <p className="text-text-muted text-sm leading-relaxed mb-4">Solução permanente e natural para substituir dentes perdidos.</p>
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center text-primary font-bold text-sm">
                Saiba Mais <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 max-w-screen-md mx-auto w-full my-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary text-3xl">format_quote</span>
          <h3 className="text-xl font-bold text-secondary dark:text-white">O que nossos pacientes dizem</h3>
        </div>
        <div className="relative">
          <div className="space-y-4">
            <p className="text-lg font-medium text-secondary dark:text-slate-200 italic leading-relaxed">
              &quot;A OdontoPrime mudou completamente a minha confiança. As lentes ficaram tão naturais que não consigo parar de sorrir! A equipe foi incrivelmente profissional.&quot;
            </p>
            <div className="flex items-center gap-4 mt-6">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden relative">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCiJqiG9F3PBnsow8_PNHSVSUIlQP6KUFcnczvuF91n7icn2-GlCD2_cL4Jb9U3z3HtifxqCMABYYw3xQBBzsUnIm7YqRdtiCBWqi0G1hcRIbBJr7cGnsx83gDaxA5ssoV0Jv3cGB_RwBB14x6dOaB4E-dKBKDvnsk4I-izJ6z-haNnfZ4LIwqk4Ba-ns4iCgFiDOB_o2bLA7O67Xns6Cgy-0zT3sisSvtdSta-9I10mVX1QBmZrSvgiJIfEYFI5-yiphlIHp3SzJJq')" }}></div>
              </div>
              <div>
                <p className="font-bold text-secondary dark:text-white">Sarah Jenkins</p>
                <div className="flex text-yellow-400 text-sm">
                  <span className="material-symbols-outlined text-[16px] filled">star</span>
                  <span className="material-symbols-outlined text-[16px] filled">star</span>
                  <span className="material-symbols-outlined text-[16px] filled">star</span>
                  <span className="material-symbols-outlined text-[16px] filled">star</span>
                  <span className="material-symbols-outlined text-[16px] filled">star</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex gap-2 mt-6 justify-start">
            <div className="w-8 h-1.5 rounded-full bg-primary"></div>
            <div className="w-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div className="w-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 px-6 pt-12 pb-24 bg-secondary text-white rounded-t-[2rem]">
        <div className="flex flex-col gap-8 max-w-screen-md mx-auto w-full">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">dentistry</span>
            <span className="text-2xl font-bold tracking-tight">OdontoPrime</span>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-3">
              <h5 className="text-primary font-bold text-sm uppercase tracking-wider">Serviços</h5>
              <Link className="text-slate-400 text-sm hover:text-white transition-colors" href="/tratamentos">Implantes</Link>
              <Link className="text-slate-400 text-sm hover:text-white transition-colors" href="/tratamentos">Lentes</Link>
              <Link className="text-slate-400 text-sm hover:text-white transition-colors" href="/tratamentos">Clareamento</Link>
              <Link className="text-slate-400 text-sm hover:text-white transition-colors" href="/tratamentos">Checkups</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h5 className="text-primary font-bold text-sm uppercase tracking-wider">Clínica</h5>
              <Link className="text-slate-400 text-sm hover:text-white transition-colors" href="#">Sobre nós</Link>
              <Link className="text-slate-400 text-sm hover:text-white transition-colors" href="#">Especialistas</Link>
              <Link className="text-slate-400 text-sm hover:text-white transition-colors" href="#">Localização</Link>
              <Link className="text-slate-400 text-sm hover:text-white transition-colors" href="#">Contato</Link>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-secondary transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-secondary transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center text-sm text-slate-400">
              <p>Av. Paulista, 1000 - São Paulo, SP</p>
              <p>Contato: (11) 99999-9999</p>
            </div>
            <p className="text-xs text-slate-500 mt-4">© 2024 OdontoPrime Clinic. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Floating AI Sparkle Button */}
      <Link href="/chat" className="fixed bottom-6 right-6 z-40 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-[0_4px_20px_rgba(7,182,213,0.3)] border border-primary/20 hover:scale-110 transition-transform duration-300 group">
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
        <span className="material-symbols-outlined text-primary text-3xl group-hover:rotate-12 transition-transform">temp_preferences_custom</span>
      </Link>
    </main>
  );
}
