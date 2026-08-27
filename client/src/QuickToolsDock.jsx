const QUICK_TOOLS = [
  { eventName: "tax-return-saathi:open-checklist", english: "Checklist", urdu: "چیک لسٹ", icon: "✓" },
  { eventName: "tax-return-saathi:open-resources", english: "Resources", urdu: "وسائل", icon: "i" },
  { eventName: "tax-return-saathi:open-tax-year", english: "Tax Year", urdu: "ٹیکس سال", icon: "•" },
  { eventName: "tax-return-saathi:open-preferences", english: "Preferences", urdu: "ترجیحات", icon: "◌" },
  { eventName: "tax-return-saathi:open-privacy-consent", english: "Privacy", urdu: "رازداری", icon: "◉" },
];

function openQuickTool(eventName) {
  window.dispatchEvent(new Event("tax-return-saathi:close-supplemental-panels"));
  window.dispatchEvent(new Event(eventName));
}

export default function QuickToolsDock() {
  return <nav className="quick-tools-dock" aria-label="Preparation quick tools">
    <style>{`
      .quick-tools-dock { position:fixed; z-index:70; left:50%; bottom:16px; display:flex; align-items:stretch; gap:5px; max-width:calc(100vw - 32px); transform:translateX(-50%); border:1px solid #cbbb7c; border-radius:15px; background:rgba(255,253,245,.98); box-shadow:0 10px 24px rgba(11,61,46,.18); padding:5px; font-family:Georgia,'Times New Roman',serif; }
      .quick-tools-dock__button { display:grid; grid-template-columns:auto 1fr; align-items:center; gap:5px; min-width:105px; border:1px solid transparent; border-radius:10px; background:transparent; color:#173b31; cursor:pointer; padding:7px 9px; text-align:left; font:700 11px/1.1 inherit; }
      .quick-tools-dock__button:hover, .quick-tools-dock__button:focus-visible { border-color:#b99116; background:#f7efcb; outline:3px solid rgba(202,165,24,.3); outline-offset:2px; }
      .quick-tools-dock__icon { display:inline-grid; place-items:center; width:19px; height:19px; border-radius:50%; background:#0B3D2E; color:#f3df81; font:700 12px/1 Arial,sans-serif; }
      .quick-tools-dock__urdu { display:block; color:#0B3D2E; font-size:12px; line-height:1.15; }
      .quick-tools-dock__english { display:block; margin-top:1px; color:#5d5a46; font:600 9px/1.15 Arial,sans-serif; }
      @media (max-width:640px) { .quick-tools-dock { right:10px; left:10px; bottom:10px; max-width:none; justify-content:stretch; border-radius:13px; transform:none; } .quick-tools-dock__button { flex:1; min-width:0; grid-template-columns:1fr; justify-items:center; gap:2px; padding:6px 3px; text-align:center; } .quick-tools-dock__icon { width:17px; height:17px; font-size:11px; } .quick-tools-dock__urdu { font-size:10px; white-space:nowrap; } .quick-tools-dock__english { font-size:8px; white-space:nowrap; } }
      @media (prefers-reduced-motion: no-preference) { .quick-tools-dock__button { transition:background-color 160ms cubic-bezier(.23,1,.32,1), border-color 160ms cubic-bezier(.23,1,.32,1), transform 160ms cubic-bezier(.23,1,.32,1); } .quick-tools-dock__button:active { transform:scale(.97); } }
    `}</style>
    {QUICK_TOOLS.map((tool) => <button className="quick-tools-dock__button" type="button" key={tool.eventName} onClick={() => openQuickTool(tool.eventName)} aria-label={`${tool.urdu} — ${tool.english}`}>
      <span className="quick-tools-dock__icon" aria-hidden="true">{tool.icon}</span>
      <span><span className="quick-tools-dock__urdu" lang="ur" dir="rtl">{tool.urdu}</span><span className="quick-tools-dock__english">{tool.english}</span></span>
    </button>)}
  </nav>;
}
