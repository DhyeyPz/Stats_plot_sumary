// src/utils/rainflowLogic.jsx

// 1. Hysteresis Filter (Optimized with TypedArrays)
export const hysteresisFilter = (series, threshold = 0.0) => {
  if (threshold <= 0 || series.length < 2) {
    return series; // Keep as TypedArray
  }
  
  // Pre-allocate max size to avoid memory re-allocation
  const kept = new Float32Array(series.length);
  kept[0] = series[0];
  let keptCount = 1;

  for (let i = 1; i < series.length; i++) {
    if (Math.abs(series[i] - kept[keptCount - 1]) >= threshold) {
      kept[keptCount] = series[i];
      keptCount++;
    }
  }
  // Return exact sliced TypedArray
  return kept.subarray(0, keptCount);
};

// 2. Get Turning Points (Optimized with Pre-allocation and zero `.push()`)
export const getTurningPoints = (series) => {
  if (series.length < 3) return series;

  // Step A: Remove consecutive duplicates instantly
  const unique = new Float32Array(series.length);
  unique[0] = series[0];
  let uniqueCount = 1;

  for (let i = 1; i < series.length; i++) {
    if (series[i] !== series[i - 1]) {
      unique[uniqueCount] = series[i];
      uniqueCount++;
    }
  }

  if (uniqueCount < 3) return unique.subarray(0, uniqueCount);

  // Step B: Calculate Turning Points
  const indices = new Int32Array(uniqueCount);
  indices[0] = 0;
  let indicesCount = 1;

  let prevSign = Math.sign(unique[1] - unique[0]);

  for (let i = 2; i < uniqueCount; i++) {
    const currentSign = Math.sign(unique[i] - unique[i - 1]);
    if (currentSign !== prevSign) {
      indices[indicesCount] = i - 1;
      indicesCount++;
      prevSign = currentSign;
    }
  }
  indices[indicesCount] = uniqueCount - 1;
  indicesCount++;

  // Step C: Compile Final Points
  const turningPoints = new Float32Array(indicesCount);
  for (let i = 0; i < indicesCount; i++) {
    turningPoints[i] = unique[indices[i]];
  }

  return turningPoints;
};

// 3. Rainflow Counting (Optimized Stack processing)
export const rainflowCounting = (series) => {
  const points = getTurningPoints(series);
  const stack = new Float32Array(points.length);
  let stackCount = 0;
  const cycles = []; 

  for (let i = 0; i < points.length; i++) {
    stack[stackCount++] = points[i];

    while (stackCount >= 3) {
      const X = Math.abs(stack[stackCount - 1] - stack[stackCount - 2]);
      const Y = Math.abs(stack[stackCount - 2] - stack[stackCount - 3]);

      if (X >= Y) {
        if (stackCount === 3) {
          cycles.push({ range: Y, count: 0.5 });
          stack[0] = stack[1];
          stack[1] = stack[2];
          stackCount = 2;
          break;
        } else {
          cycles.push({ range: Y, count: 1.0 });
          stack[stackCount - 3] = stack[stackCount - 1];
          stackCount -= 2;
        }
      } else {
        break;
      }
    }
  }

  // Residual half cycles
  for (let i = 0; i < stackCount - 1; i++) {
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
    
    let sumDamage = 0;
    // Faster standard loop instead of reduce
    for (let i = 0; i < cycles.length; i++) {
      sumDamage += cycles[i].count * Math.pow(cycles[i].range, m);
    }
    
    results[`m${m}`] = Math.pow(sumDamage / Neq, 1 / m);
  });

  return results;
};