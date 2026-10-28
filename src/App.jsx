
import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://jsonplaceholder.typicode.com/posts";

const metricTitles = [
  "Total Revenue",
  "Active Users",
  "New Orders",
  "Total Customers",
  "Monthly Sales",
  "Conversion Rate",
  "Pending Orders",
  "Customer Growth",
];

const formatNumber = (value) =>
  Number(value).toLocaleString("en-US");

function App() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [minValue, setMinValue] = useState(0);

  const [draftSearch, setDraftSearch] = useState("");
  const [draftCategory, setDraftCategory] = useState("All");
  const [draftMinimum, setDraftMinimum] = useState("0");
  const [validationError, setValidationError] = useState("");

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load metrics");
      }

      const data = await response.json();

      if (
        !Array.isArray(data) ||
        !data.every(
          (item) =>
            item &&
            Number.isFinite(Number(item.id)) &&
            typeof item.title === "string"
        )
      ) {
        throw new Error("Invalid metrics data");
      }

      const formatted = data.slice(0, 8).map((item, index) => ({
        id: item.id,
        title: metricTitles[index],
        category: item.id % 2 === 0 ? "Sales" : "Users",
        value: item.id * 125,
      }));

      setMetrics(formatted);
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch {
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const filteredMetrics = metrics.filter((metric) => {
    const title = String(metric.title || "").toLowerCase();
    const keyword = search.trim().toLowerCase();

    return (
      title.includes(keyword) &&
      (category === "All" || metric.category === category) &&
      metric.value >= minValue
    );
  });

  const totalValue = filteredMetrics.reduce(
    (total, metric) => total + metric.value,
    0
  );

  function handleFilter(event) {
    event.preventDefault();

    const minimum = Number(draftMinimum);

    if (
      draftMinimum.trim() === "" ||
      !Number.isFinite(minimum) ||
      minimum < 0
    ) {
      setValidationError("Enter a valid minimum value of 0 or more.");
      return;
    }

    setValidationError("");
    setSearch(draftSearch.trim());
    setCategory(draftCategory);
    setMinValue(minimum);
  }

  function resetFilters() {
    setDraftSearch("");
    setDraftCategory("All");
    setDraftMinimum("0");

    setSearch("");
    setCategory("All");
    setMinValue(0);
    setValidationError("");
  }

  function chooseCategory(nextCategory) {
    setDraftCategory(nextCategory);
    setCategory(nextCategory);
    setValidationError("");
  }

  function exportCSV() {
    if (filteredMetrics.length === 0) return;

    const escapeCSV = (value) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const rows = [
      ["ID", "Title", "Category", "Value"],
      ...filteredMetrics.map((metric) => [
        metric.id,
        metric.title,
        metric.category,
        metric.value,
      ]),
    ];

    const csv = rows
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "metricly-report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Metricly dashboard home">
          <span className="brand-icon" aria-hidden="true">
            ✳
          </span>
          Metricly<span className="brand-dot">.</span>
          <span className="pro-label">PRO</span>
        </a>

        <div className="topbar-actions">
          <span className="status">
            <span className="status-dot" aria-hidden="true" />
            Dashboard
          </span>

          <button
            className="icon-button"
            type="button"
            onClick={loadMetrics}
            disabled={loading}
            aria-label="Refresh dashboard data"
            title="Refresh data"
          >
            <span aria-hidden="true">{loading ? "…" : "↻"}</span>
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">YOUR WORKSPACE / ANALYTICS</p>

          <h1>
            Your numbers,
            <br />
            <span>your story.</span>
          </h1>

          <p className="hero-description">
            A clearer view of your data. Explore your metrics,
            spot patterns, and find what matters.
          </p>

          <div className="hero-meta">
            <span className="meta-icon" aria-hidden="true">✦</span>
            <span>
              {lastUpdated
                ? `Last updated at ${lastUpdated}`
                : "Your analytics at a glance"}
            </span>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-glow" />

          <div className="art-card">
            <span className="art-card-label">TOTAL VALUE</span>
            <strong>{formatNumber(totalValue)}</strong>
            <span className="art-card-trend">✦ Your overview</span>

            <div className="art-bars">
              {[35, 52, 42, 72, 58, 88, 68].map((height, index) => (
                <span
                  key={index}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          <span className="floating-star star-one">✦</span>
          <span className="floating-star star-two">✧</span>
          <span className="floating-pill">Data made simple</span>
        </div>
      </section>

      <section className="summary" aria-label="Dashboard summary">
        <article className="summary-card summary-purple">
          <div className="summary-top">
            <span>Total metrics</span>
            <span className="summary-icon" aria-hidden="true">▦</span>
          </div>
          <strong>{loading ? "—" : metrics.length}</strong>
          <p>Records available</p>
        </article>

        <article className="summary-card summary-pink">
          <div className="summary-top">
            <span>Visible metrics</span>
            <span className="summary-icon" aria-hidden="true">◉</span>
          </div>
          <strong>{loading ? "—" : filteredMetrics.length}</strong>
          <p>Matching your filters</p>
        </article>

        <article className="summary-card summary-blue">
          <div className="summary-top">
            <span>Total value</span>
            <span className="summary-icon" aria-hidden="true">↗</span>
          </div>
          <strong>{loading ? "—" : formatNumber(totalValue)}</strong>
          <p>Combined metric value</p>
        </article>
      </section>

      <section className="filter-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MAKE IT PERSONAL</p>
            <h2>Find your metrics<span>.</span></h2>
            <p className="section-description">
              Search and filter your dashboard in seconds.
            </p>
          </div>

          <button
            className="reset-button"
            type="button"
            onClick={resetFilters}
          >
            ↺ Reset filters
          </button>
        </div>

        <div className="quick-filters" aria-label="Quick category filters">
          {["All", "Sales", "Users"].map((item) => (
            <button
              key={item}
              type="button"
              className={`quick-filter ${
                category === item ? "active" : ""
              }`}
              aria-pressed={category === item}
              onClick={() => chooseCategory(item)}
            >
              {item === "All" ? "✦" : item === "Sales" ? "↗" : "◎"}
              {" "}{item === "All" ? "All metrics" : item}
            </button>
          ))}
        </div>

        <form className="filter-form" onSubmit={handleFilter}>
          <label>
            Search by title
            <input
              name="keyword"
              type="search"
              placeholder="Try typing a title..."
              value={draftSearch}
              onChange={(event) => {
                const value = event.target.value;
                setDraftSearch(value);
                setSearch(value.trim());
              }}
            />
          </label>

          <label>
            Category
            <select
              name="category"
              value={draftCategory}
              onChange={(event) => {
                setDraftCategory(event.target.value);
                setCategory(event.target.value);
              }}
            >
              <option value="All">All categories</option>
              <option value="Sales">Sales</option>
              <option value="Users">Users</option>
            </select>
          </label>

          <label>
            Minimum value
            <input
              name="minimum"
              type="number"
              min="0"
              step="1"
              required
              value={draftMinimum}
              onChange={(event) => setDraftMinimum(event.target.value)}
              aria-invalid={Boolean(validationError)}
              aria-describedby={
                validationError ? "filter-error" : undefined
              }
            />
          </label>

          <button className="apply-button" type="submit">
            Apply filters <span aria-hidden="true">→</span>
          </button>
        </form>

        {validationError && (
          <p id="filter-error" role="alert">
            {validationError}
          </p>
        )}
      </section>

      <section className="metrics-section" aria-labelledby="metrics-heading">
        <div className="section-heading metrics-heading">
          <div>
            <p className="eyebrow">THE DETAILS</p>
            <h2 id="metrics-heading">Metric cards<span>.</span></h2>
          </div>

          <div className="results-actions">
            <span className="count" aria-live="polite">
              {filteredMetrics.length} results
            </span>

            <button
              className="export-button"
              type="button"
              onClick={exportCSV}
              disabled={
                loading ||
                Boolean(error) ||
                filteredMetrics.length === 0
              }
            >
              ↓ Export CSV
            </button>
          </div>
        </div>

        {loading && (
          <div className="metrics-grid" aria-label="Loading metrics">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="metric-skeleton" key={index}>
                <div className="skeleton-line skeleton-short" />
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line skeleton-value" />
                <div className="skeleton-line skeleton-caption" />
              </div>
            ))}
            <p className="sr-only" role="status">
              Loading metrics...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="message-panel error-panel" role="alert">
            <span className="message-icon" aria-hidden="true">!</span>
            <h3>We couldn't load your data</h3>
            <p>{error}</p>
            <button
              className="apply-button"
              type="button"
              onClick={loadMetrics}
            >
              Try again ↻
            </button>
          </div>
        )}

        {!loading && !error && filteredMetrics.length === 0 && (
          <div className="message-panel empty-state">
            <span className="message-icon" aria-hidden="true">⌕</span>
            <h3>No matching metrics</h3>
            <p>
              Try another title or reset your filters to see all metrics.
            </p>
            <button
              className="reset-button"
              type="button"
              onClick={resetFilters}
            >
              Show all metrics
            </button>
          </div>
        )}

        {!loading && !error && filteredMetrics.length > 0 && (
          <div className="metrics-grid">
            {filteredMetrics.map((metric, index) => (
              <article
                className={`metric-card metric-card-${index % 4}`}
                key={metric.id}
              >
                <div className="metric-card-top">
                  <span className="metric-icon" aria-hidden="true">
                    {metric.category === "Sales" ? "↗" : "◎"}
                  </span>

                  <span
                    className={`category-tag ${
                      metric.category === "Sales"
                        ? "tag-sales"
                        : "tag-users"
                    }`}
                  >
                    {metric.category}
                  </span>
                </div>

                <h3>{metric.title}</h3>

                <div className="metric-value-row">
                  <p className="metric-value">
                    {formatNumber(metric.value)}
                  </p>
                  <span className="value-decoration" aria-hidden="true">
                    {metric.category === "Sales" ? "↗" : "✦"}
                  </span>
                </div>

                <p className="metric-caption">Metric value</p>

                <div className="metric-card-footer">
                  <span>Metric #{metric.id}</span>
                  <span aria-hidden="true">✧</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="dashboard-footer">
        <a className="footer-brand" href="/" aria-label="Metricly home">
          Metricly<span>.</span>
        </a>
        <span>Made with care for clearer insights.</span>
        <span className="footer-status">
          <span className="status-dot" aria-hidden="true" />
          Dashboard ready
        </span>
      </footer>
    </main>
  );
}

export default App;
