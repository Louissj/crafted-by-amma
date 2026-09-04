'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const SEEN_KEY = 'amma_refer_splash';
const SHOW_AFTER_MS = 900;   // let the page paint first
const VISIBLE_MS = 4000;     // long enough to read it and tap through

// Never interrupt someone who is buying, tracking an order, or working in admin
const SKIP_PREFIXES = ['/cart', '/checkout', '/track', '/admin', '/refer'];

export default function ReferSplash() {
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (SKIP_PREFIXES.some(p => pathname?.startsWith(p))) return;

    // Once per browser session — a splash on every navigation would grate
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
    } catch { return; } // private mode: skip rather than nag every page
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }

    const inTimer = setTimeout(() => setShow(true), SHOW_AFTER_MS);
    const outTimer = setTimeout(() => setShow(false), SHOW_AFTER_MS + VISIBLE_MS);
    return () => { clearTimeout(inTimer); clearTimeout(outTimer); };
  }, [pathname]);

  return (
    <AnimatePresence>
      {show && (
        // pointer-events-none on the backdrop so this can never swallow a tap
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9500] flex items-center justify-center px-6 pointer-events-none"
          style={{ background: 'rgba(10,18,8,0.55)', backdropFilter: 'blur(2px)' }}>
          <motion.button
            initial={{ opacity: 0, scale: 0.88, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => { setShow(false); router.push('/refer'); }}
            className="pointer-events-auto w-full max-w-[320px] rounded-3xl overflow-hidden text-left cursor-pointer active:scale-[.98] transition-transform"
            style={{
              background: 'linear-gradient(150deg,#1E3414,#243818)',
              border: '2px solid rgba(212,148,42,0.55)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.45), 0 0 40px rgba(212,148,42,0.15)',
            }}>
            <div className="px-5 py-5 text-center">
              <div className="text-4xl mb-2">🎁</div>
              <p className="text-[0.6rem] font-bold tracking-[3px] uppercase mb-1.5"
                style={{ color: 'rgba(212,148,42,0.65)' }}>
                Refer &amp; Earn
              </p>
              <p className="font-display text-2xl font-bold mb-1.5" style={{ color: '#D4942A' }}>
                Get 15% back
              </p>
              <p className="text-xs leading-5 mb-3" style={{ color: 'rgba(235,225,200,0.65)' }}>
                Share your link with friends and earn 15% on the powders they order.
              </p>
              <span className="inline-block px-4 py-1.5 rounded-full text-[0.7rem] font-bold"
                style={{ background: 'rgba(212,148,42,0.18)', border: '1px solid rgba(212,148,42,0.40)', color: '#D4942A' }}>
                Get my link →
              </span>
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
