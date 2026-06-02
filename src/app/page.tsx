'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VIPLaunch from '@/components/sections/VIPLaunch';

export default function RootPage() {
  const router = useRouter();
  const [launchMode, setLaunchMode] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/settings/launch')
      .then(r => r.json())
      .then(data => {
        if (data.launchMode === false) {
          router.replace('/home');
        } else {
          setLaunchMode(true);
        }
      })
      .catch(() => router.replace('/home'));
  }, [router]);

  // While checking — show nothing (black flash avoided by background)
  if (launchMode === null) {
    return (
      <div className="fixed inset-0" style={{ background: '#050B03' }} />
    );
  }

  return <VIPLaunch />;
}
