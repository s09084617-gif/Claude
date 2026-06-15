import { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import HeroContent from './components/HeroContent';
import About from './components/About';
import CaseStudies from './components/CaseStudies';
import './index.css';

type ShaderModule = {
  Shader: React.ComponentType<{ className?: string; children?: React.ReactNode }>;
  Swirl: React.ComponentType<Record<string, unknown>>;
  ChromaFlow: React.ComponentType<Record<string, unknown>>;
  FlutedGlass: React.ComponentType<Record<string, unknown>>;
  FilmGrain: React.ComponentType<Record<string, unknown>>;
};

export default function App() {
  const [shaders, setShaders] = useState<ShaderModule | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import('shaders/react')
      .then((mod) => setShaders(mod as ShaderModule))
      .catch(() => {
        // shaders unavailable — hero renders as plain gradient
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative h-screen overflow-hidden bg-[#0a0a0a]"
      >
        {shaders ? (
          <shaders.Shader className="absolute inset-0 w-full h-full">
            <shaders.Swirl />
            <shaders.ChromaFlow />
            <shaders.FlutedGlass />
            <shaders.FilmGrain />
          </shaders.Shader>
        ) : (
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 60%, #1a0a2e 0%, #0a0a1a 50%, #0a0a0a 100%)' }} />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/40 pointer-events-none" />

        <HeroContent />
      </section>

      <CaseStudies />
      <About />

      {/* Contact footer */}
      <footer id="contact" className="py-24 px-6 md:px-12 bg-[#050505] border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="text-white/30 text-xs tracking-widest uppercase mb-4">Start a project</p>
            <a
              href="mailto:hello@axionstudio.co"
              className="text-3xl md:text-5xl font-light text-white hover:text-orange-400 transition-colors"
            >
              hello@axionstudio.co
            </a>
          </div>
          <div className="text-white/20 text-sm">
            <p>© 2024 Axion Studio</p>
            <p className="mt-1">London, UK</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
