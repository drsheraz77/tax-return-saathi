import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const app = fs.readFileSync(path.join(process.cwd(), "client/src/App.jsx"), "utf8");
const dashboard = fs.readFileSync(path.join(process.cwd(), "client/src/AnalysisDashboard.jsx"), "utf8");
const styles = fs.readFileSync(path.join(process.cwd(), "client/src/dashboard.css"), "utf8");

describe("analysis dashboard presentation", () => {
  it("keeps the existing detailed result sections and adds an overview dashboard", () => {
    expect(app).toContain("<AnalysisDashboard");
    expect(app).toContain("result.calculations?.evidenceSummary");
    expect(app).toContain("result.calculations?.fieldReconciliation");
    expect(app).toContain("deterministicFindings={result.calculations?.deterministicFindings || []}");
    expect(app).toContain("id=\"evidence-review-panel\"");
  });

  it("uses real result counts for KPIs and accessible progress bars", () => {
    expect(dashboard).toContain("unresolvedCount");
    expect(dashboard).toContain("overallMatched");
    expect(dashboard).toContain('role="progressbar"');
    expect(dashboard).toContain("evidenceNotProvided");
    expect(dashboard).toContain("This dashboard is an educational review");
  });

  it("provides responsive dashboard styling without changing data contracts", () => {
    expect(styles).toContain(".analysis-dashboard__kpis");
    expect(styles).toContain("grid-template-columns: repeat(4");
    expect(styles).toContain("@media (max-width: 700px)");
    expect(styles).toContain("prefers-reduced-motion");
  });
});
