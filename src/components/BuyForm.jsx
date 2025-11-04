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
