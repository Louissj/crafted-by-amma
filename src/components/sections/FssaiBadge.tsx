import { RevealSection } from '@/components/ui/RevealSection';

export default function FssaiBadge() {
  return (
    <div className="flex justify-center py-6 px-4" style={{ background: '#F7F4EF' }}>
      <RevealSection>
        <div className="animate-fssai-glow flex items-center gap-3.5 px-6 py-4 rounded-2xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#FFF8E6,#FFEFC4)', border: '1.5px solid rgba(212,148,42,0.35)' }}>
          {/* decorative corner lines */}
          <span className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 rounded-tl" style={{ borderColor: 'rgba(184,115,35,0.4)' }} />
          <span className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 rounded-tr" style={{ borderColor: 'rgba(184,115,35,0.4)' }} />
          <span className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 rounded-bl" style={{ borderColor: 'rgba(184,115,35,0.4)' }} />
          <span className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 rounded-br" style={{ borderColor: 'rgba(184,115,35,0.4)' }} />

          <span className="text-2xl flex-shrink-0">🛡️</span>
          <div>
            <p className="text-[10px] font-black tracking-[3px] uppercase" style={{ color: '#B87323' }}>
              FSSAI Licensed · Food Safety Certified
            </p>
            <p className="font-mono font-bold text-base tracking-wider" style={{ color: '#7A4A12' }}>
              Lic. No. 21226197000270
            </p>
          </div>
        </div>
      </RevealSection>
    </div>
  );
}
