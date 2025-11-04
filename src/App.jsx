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
