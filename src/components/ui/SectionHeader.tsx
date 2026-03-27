import { RevealSection } from './RevealSection';

export default function SectionHeader({ tag, title, dark = false, className = '' }: {
  tag: string; title: string; dark?: boolean; className?: string;
}) {
  return (
    <div className={`text-center max-w-[500px] mx-auto mb-10 ${className}`}>
      <RevealSection>
        <p className={`text-xs sm:text-sm font-semibold tracking-[4px] uppercase mb-1.5 ${dark ? 'text-millet' : 'text-sage'}`}>{tag}</p>
      </RevealSection>
      <RevealSection delay={100}>
        <h2 className={`font-display font-bold leading-tight text-[clamp(2rem,5vw,2.8rem)] ${dark ? 'text-cream-light' : 'text-forest'}`}>{title}</h2>
      </RevealSection>
      <RevealSection delay={200}>
        <div className="w-20 h-px mx-auto mt-3 opacity-50 bg-gradient-to-r from-transparent via-sage to-transparent" />
      </RevealSection>
    </div>
  );
}
