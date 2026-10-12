'use client';

import { useEffect, useRef, useState } from 'react';

export default function PaymentPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [debug, setDebug] = useState<string[]>([]);

  const addDebug = (msg: string) => {
    console.log(msg);
    setDebug(prev => [...prev, msg]);
  };

  useEffect(() => {
    async function init() {
      try {
        addDebug('Step 1: Fetching payment config from backend...');
        const configRes = await fetch('/api/payments/config');
        const config = await configRes.json();

        if (!config.success) {
          throw new Error(config.message || 'Failed to load payment config');
        }

        const { publicKey, mode } = config.data;
        addDebug(`Step 2: Config loaded — mode=${mode}, publicKey=${publicKey ? `${publicKey.substring(0, 10)}...` : 'MISSING'}`);

        if (!publicKey) {
          throw new Error('REVOLUT_MERCHANT_PUBLIC_KEY is not set on the server (check .env.local, then restart the dev server)');
        }

        addDebug('Step 3: Loading SDK...');
        const RevolutCheckout = await import('@revolut/checkout');
        addDebug('Step 4: SDK loaded');

        const { destroy } = await RevolutCheckout.default.embeddedCheckout({
          publicToken: publicKey,
          mode: mode === 'prod' ? 'prod' : 'sandbox',
          locale: 'auto',
          target: containerRef.current!,

          createOrder: async () => {
            addDebug('Step 5: Calling backend...');

            try {
              const response = await fetch('/api/payments/create-embedded-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  amount: 1000,
                  currency: 'GBP',
                  description: 'AI4Planning Service',
                }),
              });

              addDebug(`Step 6: Backend status: ${response.status}`);
              const data = await response.json();
              addDebug(`Step 7: publicId: ${data.data?.publicId?.substring(0, 20)}...`);

              if (!data.success) {
                addDebug(`Step 7b: Backend error detail: ${data.message ?? data.error}`);
                throw new Error(data.message || data.error || 'Order creation failed');
              }
              return { publicId: data.data.publicId };
            } catch (err: any) {
              addDebug(`❌ createOrder failed: ${err.message}`);
              throw err;
            }
          },

          onSuccess: ({ orderId }) => {
            addDebug(`✅ Success: ${orderId}`);
            setSuccess(true);
            setLoading(false);
          },

          onError: ({ error: checkoutError }) => {
            addDebug(`❌ onError: ${checkoutError.message}`);
            setError(checkoutError.message);
            setLoading(false);
          },

          onCancel: () => {
            addDebug('⚠️ Cancelled');
            setLoading(false);
          },
        });

        addDebug('Step 8: Widget mounted successfully');
      } catch (err: any) {
        addDebug(`❌ Init failed: ${err.message}`);
        setError(err.message);
        setLoading(false);
      }
    }

    init();
  }, []);

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        </div>
      </main>
    );
  }

  return (
  <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
      <h1 className="text-2xl font-bold text-center mb-2">Complete Payment</h1>
      <p className="text-gray-500 text-center mb-6">AI4Planning Service</p>

      {/* Debug */}
      <details className="mb-4" open>
        <summary className="text-xs text-gray-400 cursor-pointer">Debug</summary>
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono max-h-32 overflow-y-auto">
          {debug.map((msg, i) => (
            <div key={i} className={msg.includes('❌') ? 'text-red-600' : 'text-gray-600'}>{msg}</div>
          ))}
        </div>
      </details>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      {/* ✅ Always show the widget container */}
      <div ref={containerRef} className="min-h-[300px]" />
    </div>
  </main>
);
}