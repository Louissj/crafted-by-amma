'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import { trackEvent } from '@/lib/analytics';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://craftedbyamma.com';

export default function ReferPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [existing, setExisting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [canShare, setCanShare] = useState(false);

  // Web Share API is absent on most desktop browsers; decide after mount to avoid a hydration mismatch
  useEffect(() => { setCanShare(typeof navigator !== 'undefined' && !!navigator.share); }, []);

  const shareUrl = code ? `${SITE_URL}/?ref=${code}` : '';
  // Kept apart so navigator.share can pass text and url separately; wa.me needs them joined
  const shareMessage = code
    ? `Try Crafted by Amma — homemade powders, snacks & sweets from Amma's kitchen in Mysuru.

Use my referral code ${code} at checkout:`
    : '';
  const shareText = code ? `${shareMessage}
${shareUrl}` : '';

  async function shareDirect() {
    try {
      await navigator.share({ title: 'Crafted by Amma', text: shareMessage, url: shareUrl });
      trackEvent('referral_share', { metadata: { code } });
    } catch {
      // dismissing the sheet throws AbortError - not a failure
    }
  }

  async function generate() {
    setError('');
    if (name.trim().length < 2) { setError('Enter your full name'); return; }
    if (!/^(\+91|91)?[6-9]\d{9}$/.test(phone.replace(/[\s\-()]/g, ''))) {
      setError('Enter a valid Indian WhatsApp number'); return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not create your code'); return; }
      setCode(data.code);
      setExisting(!!data.existing);
      trackEvent('referral_code_created', { metadata: { code: data.code } });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function copy(value: string, which: string) {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(which);
      setTimeout(() => setCopied(''), 1800);
    }).catch(() => setError('Could not copy — please select and copy manually'));
  }

  return (
    <div className="min-h-screen"
      style={{ background: 'linear-gradient(170deg,#1A2E12 0%,#1E3414 30%,#243818 60%,#1A2E12 100%)' }}>
      <Navbar />

      <div className="pt-24 pb-6 px-4 text-center">
        <p className="text-[0.7rem] font-bold tracking-[4px] uppercase mb-3" style={{ color: 'rgba(212,148,42,0.6)' }}>
          Crafted by Amma
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-3" style={{ color: 'rgba(235,225,200,0.96)' }}>
          Refer &amp; Earn
        </h1>
        <p className="text-sm max-w-md mx-auto" style={{ color: 'rgba(235,225,200,0.55)' }}>
          Share your link with friends. When they order using your code, you earn 15% on the powders in that order.
        </p>
      </div>

      <div className="max-w-[560px] mx-auto px-4 pb-36">
        {/* The one rule a referrer has to know before sharing */}
        <div className="mb-6 rounded-2xl overflow-hidden"
          style={{ border: '2px solid rgba(212,148,42,0.55)', background: 'rgba(212,148,42,0.10)', boxShadow: '0 4px 20px rgba(212,148,42,0.10)' }}>
          <div className="px-4 py-2.5 flex items-center gap-2"
            style={{ background: 'rgba(212,148,42,0.18)' }}>
            <span className="text-base">🌾</span>
            <span className="font-display text-sm font-bold" style={{ color: '#D4942A' }}>
              15% applies to powders only
            </span>
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-start gap-2.5">
              <span className="text-sm font-bold leading-5" style={{ color: '#7BAE4A' }}>✓</span>
              <span className="text-xs leading-5" style={{ color: 'rgba(235,225,200,0.78)' }}>
                <b style={{ color: 'rgba(235,225,200,0.95)' }}>All powders</b> — millet powders, masala powders, chutney pudi
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-sm font-bold leading-5" style={{ color: 'rgba(239,68,68,0.85)' }}>✕</span>
              <span className="text-xs leading-5" style={{ color: 'rgba(235,225,200,0.55)' }}>
                <b style={{ color: 'rgba(235,225,200,0.75)' }}>Snacks &amp; sweets</b> — these earn nothing. If your friend orders only these, there is no reward.
              </span>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { n: '1', t: 'Get your code' },
            { n: '2', t: 'Share the link' },
            { n: '3', t: 'Earn 15% on powders' },
          ].map(s => (
            <div key={s.n} className="text-center px-2 py-3 rounded-xl"
              style={{ background: 'rgba(212,148,42,0.06)', border: '1px solid rgba(212,148,42,0.16)' }}>
              <div className="font-display text-lg font-bold" style={{ color: '#D4942A' }}>{s.n}</div>
              <div className="text-[0.68rem] font-semibold mt-0.5" style={{ color: 'rgba(235,225,200,0.6)' }}>{s.t}</div>
            </div>
          ))}
        </div>

        {!code ? (
          <div className="p-5 rounded-2xl space-y-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(212,148,42,0.20)' }}>
            <div>
              <label className="text-[0.65rem] font-bold uppercase tracking-[2px] block mb-1.5"
                style={{ color: 'rgba(235,225,200,0.45)' }}>Your name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(235,225,200,0.92)' }} />
            </div>
            <div>
              <label className="text-[0.65rem] font-bold uppercase tracking-[2px] block mb-1.5"
                style={{ color: 'rgba(235,225,200,0.45)' }}>WhatsApp number *</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" inputMode="tel"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(235,225,200,0.92)' }} />
              <p className="text-[0.65rem] mt-1.5" style={{ color: 'rgba(235,225,200,0.35)' }}>
                We use this only to send you your earnings.
              </p>
            </div>

            {error && (
              <p className="text-xs font-semibold" style={{ color: '#f87171' }}>{error}</p>
            )}

            <button onClick={generate} disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[.98] disabled:opacity-50"
              style={{ background: 'rgba(212,148,42,0.90)', color: '#1A2E12' }}>
              {loading ? 'Creating…' : 'Get my referral code'}
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-2xl space-y-4"
            style={{ background: 'rgba(212,148,42,0.07)', border: '1.5px solid rgba(212,148,42,0.35)' }}>
            {existing && (
              <p className="text-xs font-semibold text-center" style={{ color: 'rgba(235,225,200,0.6)' }}>
                You already have a code — here it is again.
              </p>
            )}

            <div className="text-center">
              <p className="text-[0.65rem] font-bold uppercase tracking-[3px] mb-2" style={{ color: 'rgba(235,225,200,0.45)' }}>
                Your referral code
              </p>
              <div className="font-display text-3xl font-bold tracking-[3px] mb-3" style={{ color: '#D4942A' }}>
                {code}
              </div>
              <button onClick={() => copy(code, 'code')}
                className="px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95"
                style={{ background: 'rgba(212,148,42,0.15)', border: '1px solid rgba(212,148,42,0.35)', color: '#D4942A' }}>
                {copied === 'code' ? '✓ Copied' : 'Copy code'}
              </button>
            </div>

            <div className="h-px" style={{ background: 'rgba(212,148,42,0.20)' }} />

            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[2px] mb-1.5" style={{ color: 'rgba(235,225,200,0.45)' }}>
                Your share link
              </p>
              <div className="px-3 py-2.5 rounded-xl text-xs break-all mb-2"
                style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(235,225,200,0.75)' }}>
                {shareUrl}
              </div>
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank" rel="noopener noreferrer"
                onClick={() => trackEvent('referral_share', { metadata: { code } })}
                className="block w-full py-3 mb-2 rounded-xl text-xs font-bold text-center no-underline transition-all active:scale-[.98]"
                style={{ background: 'rgba(37,211,102,0.90)', color: '#0B2818' }}>
                Share on WhatsApp
              </a>
              <div className="flex gap-2">
                <button onClick={() => copy(shareUrl, 'link')}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[.98]"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(235,225,200,0.8)' }}>
                  {copied === 'link' ? '✓ Copied' : 'Copy link'}
                </button>
                {canShare && (
                  <button onClick={shareDirect}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[.98]"
                    style={{ background: 'rgba(212,148,42,0.16)', border: '1px solid rgba(212,148,42,0.35)', color: '#D4942A' }}>
                    Share to any app
                  </button>
                )}
              </div>
            </div>

            <p className="text-[0.65rem] text-center" style={{ color: 'rgba(235,225,200,0.4)' }}>
              Anyone who opens your link gets the code filled in automatically at checkout.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
