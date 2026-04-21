
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Build ISO date string "YYYY-MM-DD" for a Date object
function toDateKey(d) {
  return d.toISOString().slice(0, 10);
}

// Get Mon–Sun labels + date keys for the current week
function getCurrentWeek() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label: DAYS[i], key: toDateKey(d) };
  });
}

// Custom tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="wg-tooltip">
      <p className="wg-tooltip-title">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

function ProgressChart({ tasks = [] }) {
  const total     = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending   = total - completed;
  const efficiency = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Build weekly data — group tasks by deadline day in the current week
  const weeklyData = useMemo(() => {
    const week = getCurrentWeek();
    const map = {};
    week.forEach(({ key, label }) => {
      map[key] = { day: label, Completed: 0, Pending: 0 };
    });

    tasks.forEach((t) => {
      const key = toDateKey(new Date(t.deadline));
      if (map[key]) {
        if (t.completed) map[key].Completed += 1;
        else              map[key].Pending   += 1;
      }
    });

    return week.map(({ key }) => map[key]);
  }, [tasks]);

  const maxVal = Math.max(
    1,
    ...weeklyData.map((d) => d.Completed + d.Pending)
  );

  return (
    <div className="progress-container">
      <h2>📊 Progress Tracker</h2>

      {/* Stat boxes */}
      <div className="progress-grid">
        <div className="progress-box">
          <h3>Total Tasks</h3>
          <p>{total}</p>
        </div>
        <div className="progress-box">
          <h3>Completed</h3>
          <p>{completed}</p>
        </div>
        <div className="progress-box">
          <h3>Pending</h3>
          <p>{pending}</p>
        </div>
        <div className="progress-box highlight">
          <h3>Efficiency</h3>
          <p>{efficiency}%</p>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${efficiency}%` }} />
      </div>

      {/* Weekly graph */}
      <div className="weekly-graph-wrap">
        <div className="weekly-graph-header">
          <h3 className="weekly-graph-title">📅 Weekly Task Progress</h3>
          <span className="weekly-graph-sub">Tasks by deadline this week</span>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={weeklyData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            barCategoryGap="30%"
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(128,128,128,0.15)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, maxVal + 1]}
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(102,126,234,0.07)" }} />
            <Legend
              wrapperStyle={{ fontSize: "13px", paddingTop: "12px", color: "var(--text-muted)" }}
            />
            <Bar dataKey="Completed" fill="#4ecdc4" radius={[6, 6, 0, 0]} maxBarSize={36} />
            <Bar dataKey="Pending"   fill="#667eea" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ProgressChart;