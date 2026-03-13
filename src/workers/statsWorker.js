// File: src/workers/statsWorker.js

// ⚠️ IMPORTANT: You must copy/paste your existing `rainflowCounting`, `hysteresisFilter`, 
// and `calculateDELs` functions right here at the top of this file. 
// Workers cannot import from standard React components.




// 1. Hysteresis Filter (Python default = 0.0)
export const hysteresisFilter = (series, threshold = 0.0) => {
  if (threshold <= 0 || series.length < 2) {
    return [...series];
  }

  const kept = [series[0]];
  for (let i = 1; i < series.length; i++) {
    if (Math.abs(series[i] - kept[kept.length - 1]) >= threshold) {
      kept.push(series[i]);
    }
  }
  return kept;
};

// 2. Get Turning Points (EXACT Python logic)
export const getTurningPoints = (series) => {
  if (series.length < 3) return series;

  // Remove consecutive duplicates
  const unique = [series[0]];
  for (let i = 1; i < series.length; i++) {
    if (series[i] !== series[i - 1]) {
      unique.push(series[i]);
    }
  }
  if (unique.length < 3) return unique;

  const diffs = [];
  for (let i = 1; i < unique.length; i++) {
    diffs.push(unique[i] - unique[i - 1]);
  }

  const signs = diffs.map((d) => Math.sign(d));
  const indices = [0];

  for (let i = 1; i < signs.length; i++) {
    if (signs[i] !== signs[i - 1]) {
      indices.push(i);
    }
  }
  indices.push(unique.length - 1);

  return indices.map((i) => unique[i]);
};

// 3. Rainflow Counting (ASTM – Python order preserved)
export const rainflowCounting = (series) => {
  const points = getTurningPoints(series);
  const stack = [];
  const cycles = [];

  for (const x of points) {
    stack.push(x);

    while (stack.length >= 4) {
      const S0 = Math.abs(stack[stack.length - 4] - stack[stack.length - 3]);
      const S1 = Math.abs(stack[stack.length - 3] - stack[stack.length - 2]);
      const S2 = Math.abs(stack[stack.length - 2] - stack[stack.length - 1]);

      if (S1 <= S0 && S1 <= S2) {
        const range = Math.abs(
          stack[stack.length - 3] - stack[stack.length - 2]
        );
        cycles.push({ range, count: 1.0 });
        stack.splice(stack.length - 3, 2);
      } else {
        break;
      }
    }
  }

  // Residual half cycles
  for (let i = 0; i < stack.length - 1; i++) {
    const range = Math.abs(stack[i] - stack[i + 1]);
    cycles.push({ range, count: 0.5 });
  }

  return cycles;
};

// 4. DEL CALCULATION (BIT-FOR-BIT PYTHON MATCH)
export const calculateDELs = (cycles) => {
  const mValues = [4, 8, 10];
  const Neq = 1.0e7;

  const totalCycles = cycles.reduce((s, c) => s + c.count, 0);
  const results = {};

  mValues.forEach((m) => {
    if (totalCycles === 0) {
      results[`m${m}`] = 0;
      return;
    }

    let totalDamage = 0;

    cycles.forEach((c) => {
      // Python: (Amplitude*2)^m * Count  → Range^m * Count
      totalDamage += Math.pow(c.range, m) * c.count;
    });

    // Python: del_value = (total_damage / total_cycles)^(1/m)
    const delRange1Hz = Math.pow(totalDamage / totalCycles, 1 / m);

    // Python: del_row_cycles = del_value / 2
    const delAmp1Hz = delRange1Hz / 2;

    // Python: del_life = ((del_1hz^m)/Neq)^(1/m)
    const delLife = Math.pow(Math.pow(delAmp1Hz, m) / Neq, 1 / m);

    results[`m${m}`] = delLife;
  });

  return results;
};




// ⚠️ IMPORTANT: You must copy/paste your existing `rainflowCounting`, `hysteresisFilter`, 
// and `calculateDELs` functions right here at the top of this file. 
// Workers cannot import from standard React components.






self.onmessage = function (e) {
  const { data, col, selectedStats } = e.data;

  // 1. Welford's Algorithm: Single-Pass for Min, Max, Mean, and Variance
  let min = Infinity;
  let max = -Infinity;
  let count = 0;
  let mean = 0;
  let M2 = 0;

  for (let i = 0; i < data.length; i++) {
    const val = data[i];
    
    if (val < min) min = val;
    if (val > max) max = val;

    count++;
    const delta = val - mean;
    mean += delta / count;
    M2 += delta * (val - mean);
  }

  const variance = count > 1 ? M2 / (count - 1) : 0;
  const stdDev = Math.sqrt(variance);

  // 2. Heavy DEL Calculations
  let dels = { m4: "N/A", m8: "N/A", m10: "N/A" };
  if (selectedStats.includes("1Hz DEL")) {
    // Assuming you pasted hysteresisFilter and rainflowCounting above
    const cycles = rainflowCounting(hysteresisFilter(data, 0));
    dels = calculateDELs(cycles);
  }

  // 3. Send the results back to the main UI thread
  self.postMessage({
    col: col,
    stats: {
      Min: min,
      Max: max,
      Mean: mean,
      Range: max - min,
      "Standard Deviation": stdDev,
      "1Hz DEL (m=4)": dels.m4,
      "1Hz DEL (m=8)": dels.m8,
      "1Hz DEL (m=10)": dels.m10
    }
  });
};