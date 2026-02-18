import { useState } from "react";

const CELL_SIZE = 14;
const CELL_GAP = 3;
const STEP = CELL_SIZE + CELL_GAP;

export default function Heatmap({ calendar }) {
  const weeks = calendar.weeks;
  const total = calendar.totalContributions;
  const [tooltip, setTooltip] = useState(null);

  // Generate month labels
  const months = [];
  weeks.forEach((week, i) => {
    const firstDay = week.contributionDays[0];
    const month = new Date(firstDay.date).toLocaleString("default", { month: "short" });
    const prevMonth =
      i === 0
        ? null
        : new Date(weeks[i - 1].contributionDays[0].date).toLocaleString("default", { month: "short" });
    if (month !== prevMonth) months.push({ month, index: i });
  });

  const gridWidth = weeks.length * STEP - CELL_GAP;

  return (
    <div
      style={{
        marginTop: "40px",
        background: "#161b22",
        border: "1px solid #30363d",
        borderRadius: "12px",
        padding: "24px 28px",
        display: "inline-block",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          gap: "24px",
        }}
      >
        <span style={{ color: "#e6edf3", fontWeight: 600, fontSize: "15px" }}>
          Contribution Activity
        </span>
        <span
          style={{
            background: "#1a3a27",
            color: "#3fb950",
            border: "1px solid #238636",
            borderRadius: "20px",
            padding: "2px 12px",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {total.toLocaleString()} contributions
        </span>
      </div>

      {/* Month labels */}
      <div style={{ marginLeft: 32, position: "relative", height: "18px", width: gridWidth }}>
        {months.map((m, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${m.index * STEP}px`,
              fontSize: "11px",
              color: "#8b949e",
              whiteSpace: "nowrap",
              userSelect: "none",
            }}
          >
            {m.month}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        {/* Day Labels */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: `${CELL_GAP}px`,
            paddingTop: "2px",
          }}
        >
          {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
            <span
              key={i}
              style={{
                height: CELL_SIZE,
                lineHeight: `${CELL_SIZE}px`,
                fontSize: "11px",
                color: "#8b949e",
                userSelect: "none",
                width: 24,
                textAlign: "right",
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div style={{ display: "flex", gap: `${CELL_GAP}px` }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: `${CELL_GAP}px` }}>
              {week.contributionDays.map((day) => (
                <div
                  key={day.date}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({ day, x: rect.left, y: rect.top });
                    e.currentTarget.style.transform = "scale(1.5)";
                    e.currentTarget.style.filter = "brightness(1.5)";
                  }}
                  onMouseLeave={(e) => {
                    setTooltip(null);
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.filter = "brightness(1)";
                  }}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    backgroundColor: day.color,
                    borderRadius: "3px",
                    cursor: "default",
                    transition: "transform 0.1s, filter 0.1s",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "4px",
          marginTop: "14px",
          fontSize: "11px",
          color: "#8b949e",
        }}
      >
        <span style={{ marginRight: "4px" }}>Less</span>
        {["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"].map((c, i) => (
          <div
            key={i}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: c,
              borderRadius: "3px",
              border: "1px solid #30363d",
            }}
          />
        ))}
        <span style={{ marginLeft: "4px" }}>More</span>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          style={{
            position: "fixed",
            top: tooltip.y - 46,
            left: tooltip.x - 44,
            background: "#1f2937",
            color: "#e6edf3",
            padding: "6px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 500,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            border: "1px solid #30363d",
            boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
            zIndex: 1000,
          }}
        >
          <span style={{ color: "#3fb950" }}>{tooltip.day.contributionCount} contributions</span>
          <span style={{ color: "#8b949e", marginLeft: 6 }}>on {tooltip.day.date}</span>
        </div>
      )}
    </div>
  );
}
