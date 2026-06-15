import { ArrowRight } from 'lucide-react'

const SMALL_IMG = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090123_74be96d4-9c1b-40cf-932a-96f4f4babed3.png&w=1280&q=85'
const LARGE_IMG = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090133_c157d30b-a99a-4477-bec1-a446149ec3f2.png&w=1280&q=85'

function OrangeButton({ label = 'About our studio' }) {
  return (
    <button className="group flex items-center gap-2 bg-[#F26522] hover:bg-[#e05a1a] text-white text-[13px] sm:text-[14px] font-medium rounded-full pl-5 sm:pl-6 pr-2 py-2 transition-colors duration-300">
      <span className="overflow-hidden h-[20px] flex items-center">
        <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
          <span>{label}</span>
          <span>{label}</span>
        </span>
      </span>
      <span className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45">
        <ArrowRight size={14} className="text-[#F26522]" />
      </span>
    </button>
  )
}

export default function About() {
  return (
    <section className="bg-white pt-16 sm:pt-20 lg:pt-32 pb-12 sm:pb-16 lg:pb-24 overflow-hidden">
      <div className="max-w-[1440px] mx-auto">
        {/* Badge row */}
        <div className="px-5 sm:px-8 lg:px-12 flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-[11px] sm:text-[12px] font-semibold flex-shrink-0">
            1
          </div>
          <span className="text-[12px] sm:text-[13px] font-medium border border-gray-200 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-gray-700">
            Introducing Axion
          </span>
        </div>

        {/* Heading */}
        <h2
          className="px-5 sm:px-8 lg:px-12 font-medium leading-[1.12] tracking-[-0.02em] text-gray-900 mb-12 sm:mb-16 lg:mb-28"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 3.2rem)' }}
        >
          Strategy-led creatives, delivering
          <br />
          results in digital and beyond.
        </h2>

        {/* Mobile/Tablet layout */}
        <div className="lg:hidden px-5 sm:px-8">
          <p className="text-[15px] sm:text-[17px] font-medium text-gray-900 leading-[1.6] mb-6">
            Through research, creative thinking and iteration we help growing brands realize their digital full potential.
          </p>
          <div className="mb-8">
            <OrangeButton />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
            <div className="sm:w-[45%]">
              <img
                src={SMALL_IMG}
                alt="Studio work"
                className="w-full aspect-[438/346] rounded-xl sm:rounded-2xl object-cover"
              />
            </div>
            <div className="sm:w-[55%]">
              <img
                src={LARGE_IMG}
                alt="Studio project"
                className="w-full aspect-[900/600] rounded-xl sm:rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:grid grid-cols-[26%_1fr_48%] items-end gap-6 xl:gap-8 px-12">
          {/* Left: small image */}
          <div className="self-end">
            <img
              src={SMALL_IMG}
              alt="Studio work"
              className="w-full aspect-[438/346] rounded-2xl object-cover"
            />
          </div>
          {/* Center: text + button */}
          <div className="self-start flex flex-col items-end">
            <p className="text-[16px] sm:text-[18px] font-medium text-gray-900 leading-[1.65] whitespace-nowrap text-right mb-8">
              Through research, creative thinking<br />
              and iteration we help growing brands<br />
              realize their digital full potential.
            </p>
            <OrangeButton />
          </div>
          {/* Right: large image */}
          <div className="self-end">
            <img
              src={LARGE_IMG}
              alt="Studio project"
              className="w-full aspect-[3/2] rounded-2xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
