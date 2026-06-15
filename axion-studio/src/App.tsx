import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import HeroContent from './components/HeroContent'
import About from './components/About'
import CaseStudies from './components/CaseStudies'

type ShaderMod = {
  Shader: React.ComponentType<{ children: React.ReactNode }>
  Swirl: React.ComponentType<any>
  ChromaFlow: React.ComponentType<any>
  FlutedGlass: React.ComponentType<any>
  FilmGrain: React.ComponentType<any>
}

export default function App() {
  const [shaderMod, setShaderMod] = useState<ShaderMod | null>(null)

  useEffect(() => {
    // @ts-ignore
    import('shaders/react')
      .then((mod: any) => setShaderMod(mod))
      .catch(() => setShaderMod(null))
  }, [])

  return (
    <div className="min-h-screen">
      <section className="relative bg-[#EFEFEF] min-h-screen flex flex-col">
        {/* Shader overlay */}
        {shaderMod && (() => {
          const { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } = shaderMod
          return (
            <div className="absolute inset-0 z-10 pointer-events-none">
              <Shader>
                <Swirl colorA="#ffffff" colorB="#f0f0f0" detail={1.7} />
                <ChromaFlow
                  baseColor="#ffffff"
                  downColor="#ff5f03"
                  leftColor="#ff5f03"
                  rightColor="#ff5f03"
                  upColor="#ff5f03"
                  momentum={13}
                  radius={3.5}
                />
                <FlutedGlass
                  aberration={0.61}
                  angle={31}
                  frequency={8}
                  highlight={0.12}
                  highlightSoftness={0}
                  lightAngle={-90}
                  refraction={4}
                  shape="rounded"
                  softness={1}
                  speed={0.15}
                />
                <FilmGrain strength={0.05} />
              </Shader>
            </div>
          )
        })()}

        <Navbar />
        <div className="flex-1" />
        <HeroContent />
      </section>

      <About />
      <CaseStudies />
    </div>
  )
}
