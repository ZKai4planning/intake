'use client';

import { useEffect, useRef, useState } from 'react';

export default function TestPaymentWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState('');

  const addLog = (msg: string) => {
    console.log(msg);
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  useEffect(() => {
    async function init() {
      try {
        addLog('Fetching payment config from backend...');
        const configRes = await fetch('/api/payments/config');
        const config = await configRes.json();

        if (!config.success) {
          throw new Error(config.message || 'Failed to load payment config');
        }

        const { publicKey, mode } = config.data;
        addLog(`Config: mode=${mode}, publicKey=${publicKey ? `${publicKey.slice(0, 8)}...` : 'MISSING'}`);

        if (!publicKey) {
          throw new Error('REVOLUT_MERCHANT_PUBLIC_KEY is not set on the server (check .env.local, then restart the dev server)');
        }

        addLog('Loading SDK...');
        const RevolutCheckout = await import('@revolut/checkout');
        addLog('SDK loaded');

        const { destroy } = await RevolutCheckout.default.embeddedCheckout({
          publicToken: publicKey,
          mode: mode === 'prod' ? 'prod' : 'sandbox',
          locale: 'auto',
          target: containerRef.current!,

          createOrder: async () => {
            addLog('Calling backend...');

            const response = await fetch('/api/payments/create-embedded-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: 1000,
                currency: 'GBP',
                description: 'Test Payment',
              }),
            });

            const data = await response.json();
            addLog(`Response: status=${response.status}, success=${data.success}, publicId=${data.data?.publicId?.substring(0, 8)}...`);

            if (!data.success) {
              addLog(`Backend error detail: ${data.message ?? data.error}`);
              throw new Error(data.message || data.error || 'Order creation failed');
            }

            return { publicId: data.data.publicId };
          },

          onSuccess: ({ orderId }) => {
            addLog(`✅ Payment success: ${orderId}`);
          },

          onError: ({ error }) => {
            addLog(`❌ Payment error: ${error.message}`);
            setError(error.message);
          },

          onCancel: () => {
            addLog('⚠️ Payment cancelled');
          },
        });

        addLog('✅ Widget ready');
        return () => destroy();
      } catch (err: any) {
        addLog(`❌ Failed: ${err.message}`);
        setError(err.message);
      }
    }

    init();
  }, []);

  return (
    <div className="max-w-lg mx-auto p-4">
      <details className="mb-4" open>
        <summary className="text-sm text-gray-500 cursor-pointer">Debug Log</summary>
        <div className="mt-2 p-3 bg-gray-900 text-green-400 rounded-lg text-xs font-mono h-40 overflow-y-auto">
          {log.map((msg, i) => (
            <div key={i} className={msg.includes('❌') ? 'text-red-400' : ''}>{msg}</div>
          ))}
        </div>
      </details>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div ref={containerRef} className="min-h-[400px]" />
    </div>
  );
}