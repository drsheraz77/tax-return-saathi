import React from "react";

const COLORS = {
  green: "#0B3D2E",
  green2: "#155E43",
  gold: "#C9A227",
  ink: "#1D2321",
  red: "#A63A28",
  muted: "#6E756D",
};

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(value || 0)));
}

function Bar({ label, value, total, color = COLORS.green2, detail }) {
  const percentage = total > 0 ? clampPercent((value / total) * 100) : 0;
  return (
    <div className="analysis-dashboard__bar-row">
      <div className="analysis-dashboard__bar-label">
        <span>{label}</span>
        <strong>{value}/{total}</strong>
      </div>
      <div className="analysis-dashboard__bar-track" role="progressbar" aria-label={`${label} coverage`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={percentage}>
        <div className="analysis-dashboard__bar-fill" style={{ width: `${percentage}%`, background: color }} />
      </div>
      {detail && <div className="analysis-dashboard__bar-detail">{detail}</div>}
    </div>
  );
}

export default function AnalysisDashboard({ result, lang, unresolvedCount = 0, evidenceSummary, evidenceChecks, fieldReconciliation, deterministicFindings = [] }) {
  const urdu = lang === "ur";
  const checks = evidenceChecks || {};
  const evidenceRows = [
    { key: "banks", label: urdu ? "بینک" : "Banks" },
    { key: "assets", label: urdu ? "اثاثے" : "Assets" },
    { key: "liabilities", label: urdu ? "واجبات" : "Liabilities" },
  ].filter(({ key }) => checks[key] && checks[key].total > 0);
  const known = evidenceSummary?.knownFields?.length || 0;
  const unknown = evidenceSummary?.unknownFields?.length || 0;
  const fieldTotal = fieldReconciliation?.total || 0;
  const fieldMatched = fieldReconciliation?.matched || 0;
  const fieldNeedsReview = (fieldReconciliation?.mismatches || 0) + (fieldReconciliation?.requiresVerification || 0);
  const evidenceTotal = evidenceRows.reduce((sum, row) => sum + (checks[row.key].total || 0), 0);
  const evidenceMatched = evidenceRows.reduce((sum, row) => sum + (checks[row.key].matched || 0), 0);
  const overallTotal = fieldTotal + evidenceTotal;
  const overallMatched = fieldMatched + evidenceMatched;
  const overallPercent = overallTotal > 0 ? clampPercent((overallMatched / overallTotal) * 100) : 0;
  const status = result?.status || "needs_review";
  const statusLabel = status === "reconciled" ? (urdu ? "حساب مل گیا" : "Reconciled") : status === "major_issues" ? (urdu ? "اہم مسائل" : "Major issues") : (urdu ? "مزید جانچ ضروری" : "Needs review");
  const statusClass = status === "reconciled" ? "is-good" : status === "major_issues" ? "is-risk" : "is-review";

  return (
    <section className="analysis-dashboard" aria-labelledby="analysis-dashboard-title">
      <div className="analysis-dashboard__hero">
        <div>
          <div className="analysis-dashboard__eyebrow">{urdu ? "ریٹرن ریویو ڈیش بورڈ" : "RETURN REVIEW DASHBOARD"}</div>
          <h3 id="analysis-dashboard-title">{urdu ? "آپ کے تجزیے کا خلاصہ" : "Your analysis at a glance"}</h3>
          <p>{urdu ? "اہم حالتیں، ثبوت کی کوریج اور باقی جانچ ایک جگہ دیکھیں۔" : "See the key status, evidence coverage, and remaining checks in one place."}</p>
        </div>
        <div className={`analysis-dashboard__status ${statusClass}`}><span className="analysis-dashboard__status-dot" />{statusLabel}</div>
      </div>

      <div className="analysis-dashboard__kpis">
        <div className="analysis-dashboard__kpi"><span>{urdu ? "معلوم فیلڈز" : "Known fields"}</span><strong>{known}</strong><small>{urdu ? "فراہم کردہ ثبوت" : "from supplied evidence"}</small></div>
        <div className="analysis-dashboard__kpi"><span>{urdu ? "مطابق جانچ" : "Matched checks"}</span><strong>{overallMatched}</strong><small>{overallTotal > 0 ? `${overallPercent}% ${urdu ? "کوریج" : "coverage"}` : (urdu ? "ابھی ڈیٹا نہیں" : "No comparison data")}</small></div>
        <div className={`analysis-dashboard__kpi ${unresolvedCount > 0 ? "is-alert" : ""}`}><span>{urdu ? "باقی آئٹمز" : "Unresolved items"}</span><strong>{unresolvedCount}</strong><small>{unresolvedCount > 0 ? (urdu ? "آپ کی توجہ درکار" : "need your attention") : (urdu ? "کوئی باقی نہیں" : "none pending")}</small></div>
        <div className="analysis-dashboard__kpi"><span>{urdu ? "اہم نتائج" : "Key findings"}</span><strong>{deterministicFindings.length}</strong><small>{urdu ? "قابلِ جانچ اشارے" : "review signals"}</small></div>
      </div>

      <div className="analysis-dashboard__grid">
        <div className="analysis-dashboard__card">
          <div className="analysis-dashboard__card-heading"><div><h4>{urdu ? "ثبوت کی کوریج" : "Evidence coverage"}</h4><p>{urdu ? "دستاویزات سے ملنے والے تقابلی اشارے" : "Comparison signals established from documents"}</p></div><div className="analysis-dashboard__ring" style={{ "--coverage": `${overallPercent}%` }}><span>{overallPercent}%</span></div></div>
          {evidenceRows.length > 0 ? evidenceRows.map((row) => {
            const check = checks[row.key];
            return <Bar key={row.key} label={row.label} value={check.matched || 0} total={check.total || 0} color={check.mismatches > 0 ? COLORS.gold : COLORS.green2} detail={check.evidenceNotProvided > 0 ? `${check.evidenceNotProvided} ${urdu ? "ثبوت دستیاب نہیں" : "evidence not provided"}` : undefined} />;
          }) : <div className="analysis-dashboard__empty">{urdu ? "بینک، اثاثہ یا واجبات کی تقابلی جانچ دستیاب نہیں۔" : "No bank, asset, or liability comparison was available."}</div>}
        </div>

        <div className="analysis-dashboard__card">
          <div className="analysis-dashboard__card-heading"><div><h4>{urdu ? "ریٹرن موازنہ" : "Return comparison"}</h4><p>{urdu ? "واپس شدہ اعداد اور ثبوت کا خلاصہ" : "Return values compared with available evidence"}</p></div><span className="analysis-dashboard__mini-badge">{fieldTotal} {urdu ? "کل" : "total"}</span></div>
          <div className="analysis-dashboard__comparison">
            <div className="analysis-dashboard__comparison-row"><span><i className="analysis-dashboard__legend is-good" />{urdu ? "مطابق" : "Matched"}</span><strong>{fieldMatched}</strong></div>
            <div className="analysis-dashboard__comparison-row"><span><i className="analysis-dashboard__legend is-review" />{urdu ? "اختلاف / تصدیق" : "Mismatch / verify"}</span><strong>{fieldNeedsReview}</strong></div>
            <div className="analysis-dashboard__stacked-track" aria-label="Return comparison summary"><span style={{ width: `${fieldTotal ? (fieldMatched / fieldTotal) * 100 : 0}%`, background: COLORS.green2 }} /><span style={{ width: `${fieldTotal ? (fieldNeedsReview / fieldTotal) * 100 : 0}%`, background: COLORS.gold }} /></div>
          </div>
          <div className="analysis-dashboard__callout"><strong>{unknown}</strong><span>{urdu ? "نامعلوم فیلڈز کو اصل ریکارڈ سے چیک کریں۔" : "unknown fields still require verification against the original records."}</span></div>
        </div>
      </div>

      <div className="analysis-dashboard__footer"><span><strong>{urdu ? "اہم نوٹ:" : "Important:"}</strong> {urdu ? "یہ ڈیش بورڈ تعلیمی جانچ ہے؛ یہ ایف بی آر کا فیصلہ یا فائلنگ نتیجہ نہیں۔" : "This dashboard is an educational review; it is not an FBR decision or filing outcome."}</span>{unresolvedCount > 0 && <a href="#evidence-review-panel">{urdu ? "باقی آئٹمز دیکھیں ↓" : "Review unresolved items ↓"}</a>}</div>
    </section>
  );
}
