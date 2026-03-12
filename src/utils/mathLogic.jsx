// src/utils/mathLogic.jsx
import {
  rainflowCounting,
  calculateDELs,
  hysteresisFilter,
} from "./rainflowLogic";

const TIME_THRESHOLD = 60.0;

export const calculateStatsInChunks = async (file, selectedCols, headerMap, selectedStats) => {
  const needsRainflow = selectedStats.includes("1Hz DEL");
  const stats = {};
  selectedCols.forEach((col) => {
    stats[col] = { min: Infinity, max: -Infinity, sum: 0, sumOfSquares: 0, count: 0, values: needsRainflow ? [] : null };
  });

  const timeColIndex = headerMap["Time"] || 0;
  const readableStream = file.stream();
  const textDecoder = new TextDecoderStream();
  const reader = readableStream.pipeThrough(textDecoder).getReader();

  let contentBuffer = "";
  let isHeaderFound = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    contentBuffer += value;
    const lines = contentBuffer.split(/\r?\n/);
    contentBuffer = lines.pop();

    for (const line of lines) {
      if (!isHeaderFound) {
        if (line.includes("Time")) isHeaderFound = true;
        continue;
      }
      const vals = line.trim().split(/\s+/).map(parseFloat);
      if (vals.some(isNaN) || vals[timeColIndex] < (window.TIME_THRESHOLD || 0)) continue;

      selectedCols.forEach(col => {
        const idx = headerMap[col];
        if (idx === undefined) return;
        const v = vals[idx];
        const s = stats[col];
        s.min = Math.min(s.min, v);
        s.max = Math.max(s.max, v);
        s.sum += v;
        s.sumOfSquares += v * v;
        s.count++;
        if (needsRainflow) s.values.push(v);
      });
    }
  }

  const finalStats = {};
  selectedCols.forEach(col => {
    const s = stats[col];
    const mean = s.sum / s.count;
    const stdDev = s.count > 1 ? Math.sqrt((s.sumOfSquares - (s.sum * s.sum) / s.count) / (s.count - 1)) : 0;
    
    let dels = { m4: "N/A", m8: "N/A", m10: "N/A" };
    if (needsRainflow && s.values.length > 2) {
      const filtered = hysteresisFilter(s.values, 0.0);
      const cycles = rainflowCounting(filtered);
      dels = calculateDELs(cycles);
    }

    finalStats[col] = {
      Min: s.min, Max: s.max, Mean: mean, Range: s.max - s.min, "Standard Deviation": stdDev,
      min: s.min, max: s.max, mean: mean, range: s.max - s.min, stdDev: stdDev,
      "1Hz DEL (m=4)": dels.m4, "1Hz DEL (m=8)": dels.m8, "1Hz DEL (m=10)": dels.m10
    };
  });
  return finalStats;
};

export const calculateStdDev = (data, mean) => {
  if (data.length < 2) return 0;
  const sqDiffs = data.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0);
  return Math.sqrt(sqDiffs / (data.length - 1));
};

export const calculateGroupStat = (filesData, statName, column, avgMethod) => {
  let values = [];
  filesData.forEach((data) => {
    const stats = data[column];
    if (!stats) return;

    let val = statName.includes("1Hz DEL") ? stats[statName] :
              (statName === "Standard Deviation") ? (stats.StdDev ?? stats.stdDev ?? stats["Standard Deviation"]) :
              (stats[statName] ?? stats[statName.toLowerCase()]);

    if (val !== undefined && val !== "N/A" && val !== null) {
      const num = typeof val === "number" ? val : parseFloat(val);
      if (!isNaN(num)) values.push(num);
    }
  });

  if (values.length === 0) return "N/A";
  if (avgMethod === 3) {
    let maxAbs = -1, result = 0;
    values.forEach(v => { if (Math.abs(v) > maxAbs) { maxAbs = Math.abs(v); result = v; } });
    return result;
  }
  return values.reduce((a, b) => a + b, 0) / values.length;
};