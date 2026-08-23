import { useState } from "react";
import { OFFICIAL_RESOURCE_HUB } from "./officialResourceHub.js";

const linkProps = { target: "_blank", rel: "noreferrer" };

export default function OfficialResourceHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState("filing");

  return (
    <aside className="official-resource-hub" aria-label="Official company registration and tax filing resources">
      <style>{`
        .official-resource-hub { position: fixed; z-index: 60; left: 16px; bottom: 78px; font-family: Georgia, 'Times New Roman', serif; }
        .official-resource-hub__toggle { display: flex; align-items: center; gap: 8px; border: 1px solid #b99116; border-radius: 999px; background: #fffdf2; color: #0B3D2E; box-shadow: 0 8px 24px rgba(11, 61, 46, .18); cursor: pointer; padding: 10px 14px; font: 700 14px/1.2 inherit; }
        .official-resource-hub__toggle:hover, .official-resource-hub__toggle:focus-visible { background: #f7f0d5; outline: 3px solid rgba(202, 165, 24, .36); outline-offset: 2px; }
        .official-resource-hub__icon { display: inline-grid; place-items: center; width: 19px; height: 19px; border-radius: 50%; background: #0B3D2E; color: #ecd46e; font: 700 12px/1 sans-serif; }
        .official-resource-hub__panel { width: min(430px, calc(100vw - 32px)); max-height: calc(100vh - 128px); margin-bottom: 10px; overflow-x: hidden; overflow-y: auto; border: 1px solid #d6bd67; border-radius: 14px; background: #fffdf5; color: #173b31; box-shadow: 0 16px 40px rgba(10, 43, 33, .24); }
        .official-resource-hub__header { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; padding: 15px 16px 13px; background: #0B3D2E; color: #fffdf2; }
        .official-resource-hub__eyebrow { margin: 0 0 4px; color: #ecd46e; font-size: 11px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
        .official-resource-hub__title { margin: 0; font-size: 18px; line-height: 1.2; }
        .official-resource-hub__close { min-width: 30px; min-height: 30px; border: 0; border-radius: 50%; background: transparent; color: #fffdf2; cursor: pointer; font: 700 20px/1 sans-serif; }
        .official-resource-hub__close:hover, .official-resource-hub__close:focus-visible { background: rgba(255,255,255,.15); outline: 2px solid #ecd46e; outline-offset: 2px; }
        .official-resource-hub__body { padding: 15px 16px 16px; font-size: 14px; line-height: 1.45; }
        .official-resource-hub__boundary { margin: 0 0 12px; border-left: 3px solid #caa518; padding-left: 10px; color: #4d513c; font-size: 12px; }
        .official-resource-hub__accordion { border-top: 1px solid #e5dbb3; }
        .official-resource-hub__section-toggle { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 12px; border: 0; background: transparent; color: #0B3D2E; cursor: pointer; padding: 12px 0; text-align: left; font: 700 15px/1.3 inherit; }
        .official-resource-hub__section-toggle:hover, .official-resource-hub__section-toggle:focus-visible { color: #075c48; outline: 3px solid rgba(202, 165, 24, .3); outline-offset: -1px; }
        .official-resource-hub__chevron { color: #a77e0e; font-family: sans-serif; }
        .official-resource-hub__section-content { padding: 0 0 12px; }
        .official-resource-hub__intro { margin: 0 0 10px; color: #595844; font-size: 12px; }
        .official-resource-hub__list { display: grid; gap: 9px; margin: 0; padding: 0; list-style: none; }
        .official-resource-hub__item { border: 1px solid #e4d9a9; border-radius: 10px; background: #fffef9; padding: 10px; }
        .official-resource-hub__item-title { display: block; color: #173b31; font-size: 13px; font-weight: 700; }
        .official-resource-hub__item-urdu { display: block; margin-top: 2px; color: #4d513c; font-size: 13px; }
        .official-resource-hub__item-description { margin: 6px 0; color: #4d513c; font-size: 12px; }
        .official-resource-hub__item-description--urdu { margin-top: -2px; }
        .official-resource-hub__link { color: #075c48; font-size: 12px; font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }
        .official-resource-hub__footer { margin: 13px 0 0; color: #625f4e; font-size: 11px; }
        @media (max-width: 520px) { .official-resource-hub { left: 12px; bottom: 126px; } .official-resource-hub__panel { max-height: calc(100vh - 156px); } .official-resource-hub__toggle { font-size: 13px; } }
      `}</style>

      {isOpen && (
        <section id="official-resource-hub-panel" className="official-resource-hub__panel" aria-live="polite">
          <header className="official-resource-hub__header">
            <div>
              <p className="official-resource-hub__eyebrow">Official-resource desk · reviewed {OFFICIAL_RESOURCE_HUB.reviewedOn}</p>
              <h2 className="official-resource-hub__title">Registration & filing resources<br /><span lang="ur" dir="rtl">رجسٹریشن اور فائلنگ وسائل</span></h2>
            </div>
            <button className="official-resource-hub__close" type="button" onClick={() => setIsOpen(false)} aria-label="Close registration and filing resources">×</button>
          </header>
          <div className="official-resource-hub__body">
            <p className="official-resource-hub__boundary"><strong>Educational support only.</strong> This hub links to official services and helps you prepare; it does not register a company, submit a return, or determine your tax position.</p>
            <p className="official-resource-hub__boundary" lang="ur" dir="rtl"><strong>صرف تعلیمی معاونت۔</strong> یہ حصہ سرکاری سروسز کے لنکس اور تیاری میں مدد دیتا ہے؛ یہ کمپنی رجسٹر، ریٹرن جمع یا آپ کی ٹیکس پوزیشن طے نہیں کرتا۔</p>
            {OFFICIAL_RESOURCE_HUB.sections.map((section) => {
              const isExpanded = expandedSection === section.id;
              const panelId = `official-resource-${section.id}`;
              return (
                <section className="official-resource-hub__accordion" key={section.id}>
                  <button className="official-resource-hub__section-toggle" type="button" onClick={() => setExpandedSection((current) => current === section.id ? "" : section.id)} aria-expanded={isExpanded} aria-controls={panelId}>
                    <span>{section.title}<br /><span lang="ur" dir="rtl">{section.titleUrdu}</span></span>
                    <span className="official-resource-hub__chevron" aria-hidden="true">{isExpanded ? "−" : "+"}</span>
                  </button>
                  {isExpanded && (
                    <div id={panelId} className="official-resource-hub__section-content">
                      <p className="official-resource-hub__intro">{section.introduction}</p>
                      <p className="official-resource-hub__intro" lang="ur" dir="rtl">{section.introductionUrdu}</p>
                      <ul className="official-resource-hub__list">
                        {section.resources.map((resource) => (
                          <li className="official-resource-hub__item" key={resource.id}>
                            <span className="official-resource-hub__item-title">{resource.title}</span>
                            <span className="official-resource-hub__item-urdu" lang="ur" dir="rtl">{resource.titleUrdu}</span>
                            <p className="official-resource-hub__item-description">{resource.description}</p>
                            <p className="official-resource-hub__item-description official-resource-hub__item-description--urdu" lang="ur" dir="rtl">{resource.descriptionUrdu}</p>
                            <a className="official-resource-hub__link" href={resource.url} {...linkProps}>{resource.sourceLabel} ↗</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              );
            })}
            <p className="official-resource-hub__footer">Before acting, confirm current requirements, fees, deadlines, and eligibility directly on the linked official portal.</p>
          </div>
        </section>
      )}

      <button className="official-resource-hub__toggle" type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-controls="official-resource-hub-panel">
        <span className="official-resource-hub__icon" aria-hidden="true">i</span>
        Registration & filing resources · <span lang="ur" dir="rtl">وسائل</span>
      </button>
    </aside>
  );
}
