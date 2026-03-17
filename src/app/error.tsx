'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🌾</div>
        <h1 className="font-display text-2xl font-bold text-forest mb-2">Something went wrong</h1>
        <p className="text-sm text-forest/40 mb-6">Don&apos;t worry, your order data is safe. Please try again.</p>
        <button onClick={reset} className="px-6 py-3 bg-sage text-white rounded-xl text-sm font-semibold">
          Try Again
        </button>
        <p className="mt-4 text-xs text-forest/20">
          Need help? WhatsApp us at 7411895085
        </p>
      </div>
    </div>
  );
}
