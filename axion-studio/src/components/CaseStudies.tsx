import { ArrowRight } from 'lucide-react';

const cases = [
  {
    id: 1,
    title: 'Kova Coffee',
    category: 'Brand Identity · Packaging',
    year: '2024',
    description:
      'Complete rebrand for a specialty coffee company entering the premium retail market. From naming strategy through to packaging design and retail rollout.',
    thumb: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80',
    color: '#1a1209',
  },
  {
    id: 2,
    title: 'Lumen Health',
    category: 'Digital Experience · App Design',
    year: '2024',
    description:
      'A health-tech startup transforming how people understand their metabolic health. We built the full product design system and onboarding flow.',
    thumb: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
    color: '#0a1a12',
  },
];

function CaseCard({ c }: { c: (typeof cases)[0] }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-[#111] border border-white/5 cursor-pointer">
      {/* Thumbnail */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={c.thumb}
          alt={c.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-white/30 text-xs tracking-widest uppercase mb-1">{c.category}</p>
            <h3 className="text-white text-2xl font-light">{c.title}</h3>
          </div>
          <span className="text-white/20 text-sm shrink-0">{c.year}</span>
        </div>

        <p className="text-white/40 text-sm leading-relaxed mb-6">{c.description}</p>

        {/* Expand button */}
        <div className="flex items-center gap-3">
          <button className="group/btn flex items-center gap-2 overflow-hidden rounded-full bg-white/5 border border-white/10 h-9 w-9 hover:w-[148px] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
            <span className="shrink-0 w-9 h-9 flex items-center justify-center">
              <ArrowRight
                size={14}
                className="text-white transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover/btn:-rotate-45"
              />
            </span>
            <span className="whitespace-nowrap text-white text-sm pr-4 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 delay-100">
              View case study
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function CaseStudies() {
  return (
    <section id="work" className="py-32 px-6 md:px-12 bg-[#080808]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-white/30 text-xs tracking-widest uppercase mb-4">Selected work</p>
            <h2 className="text-4xl md:text-5xl font-light text-white leading-tight">
              Recent projects
            </h2>
          </div>
          <a
            href="#"
            className="group hidden md:flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors"
          >
            View all
            <ArrowRight
              size={14}
              className="transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45"
            />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c) => (
            <CaseCard key={c.id} c={c} />
          ))}
        </div>

        {/* Mobile "all work" link */}
        <div className="mt-8 flex md:hidden">
          <a
            href="#"
            className="group flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
          >
            View all work
            <ArrowRight
              size={14}
              className="transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
