// Bestinindia React App — Full Repo Structure (Vite + Tailwind + Razorpay integration placeholders)
// This is the complete set of files for a deployable project.
// Folder layout:
// bestinindia/
// ├── index.html
// ├── package.json
// ├── postcss.config.js
// ├── tailwind.config.js
// ├── vite.config.js
// └── src/
//     ├── App.jsx
//     ├── main.jsx
//     ├── index.css
//     └── components/
//         └── BuyForm.jsx

/* ======================
   index.html
   ====================== */
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bestinindia</title>
  </head>
  <body class="bg-neutral-900 text-neutral-100">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

/* ======================
   package.json
   ====================== */
{
  "name": "bestinindia",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.13",
    "vite": "^5.3.1"
  }
}

/* ======================
   postcss.config.js
   ====================== */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

/* ======================
   tailwind.config.js
   ====================== */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        neutral: {
          850: '#1c1c1c',
        },
      },
    },
  },
  plugins: [],
}

/* ======================
   vite.config.js
   ====================== */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});

/* ======================
   src/main.jsx
   ====================== */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/* ======================
   src/index.css
   ====================== */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Inter', system-ui, sans-serif;
}

/* ======================
   src/components/BuyForm.jsx
   ====================== */
import React, { useState } from 'react';

export default function BuyForm({ slot, onCancel, onConfirm, onSimulate, loading }) {
  const [companyName, setCompanyName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [useSimulate, setUseSimulate] = useState(false);

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (useSimulate) onSimulate(companyName, logoUrl); else onConfirm({ companyName, logoUrl }); }}>
      <div className="space-y-3">
        <label className="block text-sm text-neutral-300">Company name</label>
        <input required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your company" className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-neutral-100 text-sm" />

        <label className="block text-sm text-neutral-300">Logo URL (image)</label>
        <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://.../logo.png" className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-neutral-100 text-sm" />

        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <input id="simulate" type="checkbox" checked={useSimulate} onChange={e => setUseSimulate(e.target.checked)} className="h-4 w-4" />
          <label htmlFor="simulate">Simulate purchase (dev mode, no payment)</label>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
          <button type="button" onClick={onCancel} className="px-3 py-2 rounded border border-neutral-700 text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="px-3 py-2 rounded bg-emerald-600 text-neutral-900 font-semibold text-sm">{useSimulate ? 'Simulate Buy' : `Pay ₹${slot.price}`}</button>
        </div>
      </div>
    </form>
  );
}

/* ======================
   src/App.jsx
   ====================== */
import React, { useEffect, useState } from 'react';
import BuyForm from './components/BuyForm.jsx';

const GRID_COLS = 24;
const GRID_ROWS = 12;
const TOTAL_SLOTS = GRID_COLS * GRID_ROWS;

function createInitialSlots() {
  const slots = [];
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    slots.push({ id: i, status: 'available', owner: null, logoUrl: null, price: 500 + (i % 5) * 100 });
  }
  return slots;
}

export default function App() {
  const [slots, setSlots] = useState(() => createInitialSlots());
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
    }
  }, []);

  function openBuyModal(slot) {
    if (slot.status === 'sold') {
      setMessage('This slot has already been sold.');
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setSelected(slot);
    setShowModal(true);
  }

  function closeModal() { setSelected(null); setShowModal(false); }

  async function createOrderOnServer(amountINR) {
    return new Promise(resolve => {
      setTimeout(() => resolve({ id: 'order_fake_' + Math.random().toString(36).slice(2, 10), amount: amountINR * 100, currency: 'INR' }), 600);
    });
  }

  async function handleBuyConfirm({ companyName, logoUrl }) {
    if (!selected) return;
    setLoading(true);

    try {
      const order = await createOrderOnServer(selected.price);
      const options = {
        key: 'RAZORPAY_KEY_ID',
        amount: order.amount,
        currency: order.currency,
        name: 'Bestinindia',
        description: `Buy pixel slot #${selected.id}`,
        order_id: order.id,
        prefill: { name: companyName || '' },
        notes: { slot_id: selected.id.toString() },
        handler: function () {
          setSlots(prev => prev.map(s => s.id === selected.id ? { ...s, status: 'sold', owner: companyName, logoUrl } : s));
          setMessage('Payment successful — slot purchased!');
          setTimeout(() => setMessage(null), 4000);
          closeModal();
          setLoading(false);
        },
        modal: { ondismiss: function () { setLoading(false); } }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setMessage('Payment failed or cancelled.');
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  function simulatePurchase(companyName, logoUrl) {
    if (!selected) return;
    setSlots(prev => prev.map(s => s.id === selected.id ? { ...s, status: 'sold', owner: companyName, logoUrl } : s));
    setMessage('Simulated purchase complete (dev mode).');
    setTimeout(() => setMessage(null), 3000);
    closeModal();
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <header className="py-6 px-6 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Bestinindia</h1>
            <p className="text-sm text-neutral-400">Showcase your company — buy pixels to place your logo.</p>
          </div>
          <div className="text-sm text-neutral-400">Grid: {GRID_COLS} x {GRID_ROWS} • Slots: {TOTAL_SLOTS}</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {message && <div className="mb-4 p-3 rounded bg-green-800 text-green-100">{message}</div>}

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Pixel Grid</h2>
            <div className="text-sm text-neutral-500">Click an available pixel to buy</div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0,1fr))`, gap: 6 }}>
            {slots.map(slot => (
              <button
                key={slot.id}
                onClick={() => openBuyModal(slot)}
                className={`aspect-square w-full rounded-sm flex items-center justify-center border ${slot.status === 'sold' ? 'bg-gradient-to-br from-neutral-700 to-neutral-800 border-neutral-600' : 'bg-neutral-950 border-neutral-800 hover:scale-105'} transform transition-all`}
                title={`Slot #${slot.id} — ${slot.status === 'available' ? `₹${slot.price}` : slot.owner}`}
              >
                {slot.status === 'sold' && slot.logoUrl ? (
                  <img src={slot.logoUrl} alt={slot.owner} className="max-h-full max-w-full object-contain p-1" />
                ) : (
                  <div className="text-[10px] text-neutral-500">{slot.status === 'available' ? `₹${slot.price}` : 'SOLD'}</div>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-sm font-medium text-neutral-400 mb-2">Legend</h3>
          <div className="flex gap-4 items-center text-sm text-neutral-300">
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-neutral-950 border border-neutral-800 inline-block"></span> Available</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-gradient-to-br from-neutral-700 to-neutral-800 border border-neutral-600 inline-block"></span> Sold</div>
          </div>
        </section>
      </main>

      {showModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={closeModal}></div>
          <div className="relative w-full max-w-md bg-neutral-850 rounded-lg p-6 border border-neutral-800">
            <h2 className="text-lg font-semibold mb-2">Buy Pixel Slot #{selected.id}</h2>
            <p className="text-sm text-neutral-400 mb-4">Price: <span className="font-medium">₹{selected.price}</span></p>

            <BuyForm slot={selected} onCancel={closeModal} onConfirm={handleBuyConfirm} onSimulate={simulatePurchase} loading={loading} />
          </div>
        </div>
      )}

      <footer className="py-6 px-6 border-t border-neutral-800 mt-6 text-center text-sm text-neutral-500">
        Built for Bestinindia • Demo Razorpay setup (replace key and implement server-side order creation)
      </footer>
    </div>
  );
}
