import { useState } from 'react'
import { ArrowRight, Clock, Menu, X } from 'lucide-react'
import { useLondonTime } from '../hooks/useLondonTime'
import MobileMenu from './MobileMenu'

const links = ['Projects', 'Studio', 'Journal', 'Connect']

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const time = useLondonTime()

  return (
    <>
      <nav className="relative z-20 px-2 sm:px-3 pt-2 sm:pt-3">
        <div className="max-w-[1440px] mx-auto bg-white rounded-full px-[5px] flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] sm:text-[11px] font-bold tracking-tight">AX</span>
            </div>
            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6">
              {links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-[14px] text-gray-900 hover:text-gray-500 transition-colors duration-300"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center gap-4">
            <span className="hidden lg:block text-[13px] text-gray-600">
              Taking on projects for Q1 2026
            </span>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-gray-600" />
              <span className="text-[13px] text-gray-600">{time} in London</span>
            </div>
            {/* CTA button */}
            <button className="group flex items-center gap-2 bg-gray-900 text-white text-[13px] font-medium rounded-full pl-5 pr-2 py-2">
              <span className="overflow-hidden h-[20px] flex items-center">
                <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
                  <span>Book a strategy call</span>
                  <span>Book a strategy call</span>
                </span>
              </span>
              <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45">
                <ArrowRight size={12} className="text-gray-900" />
              </span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden bg-gray-900 text-white rounded-full p-2.5 flex items-center justify-center"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
