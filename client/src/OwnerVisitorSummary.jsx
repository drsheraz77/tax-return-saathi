import { useEffect } from "react";
import { useAuth } from "./_core/hooks/useAuth";
import { trpc } from "./lib/trpc";

const formatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });

export default function OwnerVisitorSummary() {
  const { user, loading, isAuthenticated } = useAuth();
  const summary = trpc.visitorAnalytics.weeklySummary.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });

  useEffect(() => {
    if (!loading && !isAuthenticated) window.location.assign("/?owner-visitor-summary=login");
  }, [isAuthenticated, loading]);

  if (loading) return <main className="owner-visitor-summary" aria-busy="true">Loading owner summary…</main>;
  if (!isAuthenticated) return <main className="owner-visitor-summary">Sign in is required to view this page.</main>;
  if (user?.role !== "admin") return <main className="owner-visitor-summary">This owner-only summary is not available for this account.</main>;

  return (
    <main className="owner-visitor-summary" aria-labelledby="owner-visitor-summary-title">
      <a className="owner-visitor-summary__back" href="/">← واپس مرکزی صفحہ / Back to site</a>
      <p className="owner-visitor-summary__eyebrow">مالک کا خلاصہ / Owner summary</p>
      <h1 id="owner-visitor-summary-title">ہفتہ وار مجموعی وزٹس / Weekly aggregate visits</h1>
      <p className="owner-visitor-summary__boundary">صرف رضامندی کے بعد ایک براؤزر سیشن کا مجموعی سگنل گنا جاتا ہے۔ یہ منفرد افراد یا درست ٹریفک رپورٹ نہیں ہے، اور اس میں IP، کوکی، اکاؤنٹ، صفحہ URL، یا ٹیکس/فیڈبیک معلومات محفوظ نہیں ہوتیں۔ / This is an approximate aggregate of consented browser-session signals, not a unique-person or precise traffic report. It stores no IP address, cookie, account, page URL, tax, or feedback information.</p>

      {summary.isLoading ? <p role="status">خلاصہ لوڈ ہو رہا ہے / Loading summary…</p> : null}
      {summary.isError ? <p role="alert">خلاصہ اس وقت دستیاب نہیں۔ دوبارہ کوشش کریں۔ / The summary is unavailable right now. Please try again.</p> : null}
      {summary.data ? <>
        <section className="owner-visitor-summary__total" aria-label="Seven-day aggregate">
          <span>گزشتہ سات UTC دن / Last seven UTC days</span>
          <strong>{summary.data.totalPageViews}</strong>
          <small>مجموعی رضامندی والے سیشن سگنلز / aggregate consented session signals</small>
        </section>
        <section className="owner-visitor-summary__table-wrap" aria-labelledby="owner-visitor-summary-days">
          <h2 id="owner-visitor-summary-days">روزانہ مجموعہ / Daily aggregate</h2>
          <table>
            <thead><tr><th scope="col">UTC تاریخ / Date</th><th scope="col">مجموعی سگنلز / Signals</th></tr></thead>
            <tbody>{summary.data.days.map((entry) => <tr key={entry.day}><td>{formatter.format(new Date(`${entry.day}T00:00:00.000Z`))}</td><td>{entry.pageViews}</td></tr>)}</tbody>
          </table>
        </section>
      </> : null}
      <style>{`
        .owner-visitor-summary { min-height:100vh; box-sizing:border-box; max-width:760px; margin:0 auto; padding:clamp(1.5rem, 5vw, 4rem) 1.25rem 5rem; color:#162c31; background:#fffdf8; font-family:inherit; line-height:1.6; }
        .owner-visitor-summary__back { color:#0b6e63; font-weight:700; text-underline-offset:3px; }
        .owner-visitor-summary__eyebrow { margin:2.5rem 0 .2rem; color:#0b6e63; font-weight:800; font-size:.9rem; }
        .owner-visitor-summary h1 { margin:0; color:#123d43; font-size:clamp(1.75rem, 5vw, 2.65rem); line-height:1.22; }
        .owner-visitor-summary__boundary { margin-top:1.25rem; padding:1rem 1.1rem; border-inline-start:4px solid #ef9c32; background:#fff4df; border-radius:0 .7rem .7rem 0; font-size:.94rem; }
        .owner-visitor-summary__total { display:grid; gap:.25rem; margin:1.6rem 0; padding:1.3rem; border:1px solid #b9ded7; border-radius:1rem; background:#effaf7; }
        .owner-visitor-summary__total span, .owner-visitor-summary__total small { color:#315a58; }
        .owner-visitor-summary__total strong { color:#0b6e63; font-size:3rem; line-height:1; }
        .owner-visitor-summary__table-wrap { overflow-x:auto; padding:1.25rem; border:1px solid #d7e5e1; border-radius:1rem; background:#fff; }
        .owner-visitor-summary__table-wrap h2 { margin:0 0 .8rem; font-size:1.15rem; }
        .owner-visitor-summary table { width:100%; border-collapse:collapse; }
        .owner-visitor-summary th, .owner-visitor-summary td { padding:.75rem .4rem; border-bottom:1px solid #e4ece9; text-align:start; }
        .owner-visitor-summary th { color:#315a58; font-size:.88rem; }
        .owner-visitor-summary td:last-child { font-weight:800; color:#0b6e63; }
        @media (max-width:480px) { .owner-visitor-summary { padding-bottom:6rem; } .owner-visitor-summary__total strong { font-size:2.5rem; } }
      `}</style>
    </main>
  );
}
