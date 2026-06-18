import { ArrowRight } from 'lucide-react'
import { useLondonTime } from '../hooks/useLondonTime'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

const links = ['Projects', 'Studio', 'Journal', 'Connect']

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const time = useLondonTime()
  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-500 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      {/* Bottom sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 mx-3 mb-3 bg-white rounded-2xl p-6 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Time badge */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1">
            {time} in London
          </span>
        </div>
        {/* Nav links */}
        <nav className="flex flex-col gap-1 mb-8">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              className="text-[28px] font-medium text-gray-900 leading-[1.2] py-1 hover:text-gray-500 transition-colors duration-300"
              onClick={onClose}
            >
              {link}
            </a>
          ))}
        </nav>
        {/* CTA */}
        <button className="group flex items-center gap-2 bg-[#F26522] hover:bg-[#e05a1a] text-white text-sm font-medium rounded-full pl-5 pr-2 py-2 transition-colors duration-300">
          <span className="overflow-hidden h-[20px] flex items-center">
            <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
              <span>Start a project</span>
              <span>Start a project</span>
            </span>
          </span>
          <span className="w-7 h-7 bg-white rounded-full flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45">
            <ArrowRight size={14} className="text-[#F26522]" />
          </span>
        </button>
      </div>
    </div>
  )
}
