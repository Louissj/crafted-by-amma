export default function Marquee() {
  const items = ['No Preservatives', 'No Added Sugar', 'No Artificial Flavours', 'ಮನೆಯಲ್ಲಿ ತಯಾರಿಸಿದ', 'Ships Worldwide', 'Millet Powered'];
  const repeated = [...items, ...items];

  return (
    <div className="py-4 overflow-hidden border-t border-b border-brass/[.06]"
      style={{ background: 'linear-gradient(90deg,#1A2A14,#223218,#1A2A14)' }}>
      <div className="flex animate-scroll w-max">
        {repeated.map((item, i) => (
          <div key={i} className="flex items-center gap-3.5 px-5 whitespace-nowrap text-[.72rem] text-millet/80 tracking-[1.5px] font-medium">
            {item}
            <span className="w-[3px] h-[3px] bg-sage rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
