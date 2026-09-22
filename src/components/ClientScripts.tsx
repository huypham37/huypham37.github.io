'use client';

import { useEffect } from 'react';

export default function ClientScripts() {
  useEffect(() => {
    import('../../scripts/page.js').catch(() => {});
  }, []);

  return null;
}
