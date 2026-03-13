// // src/utils/workerPool.js

// export const calculateAllColumnsParallel = async (reader, columns, selectedStats) => {
//   const promises = columns.map(async (col) => {
//     const { y } = await reader.getChannelData(col);
//     // Ensure y is a TypedArray
//     const typedData = (y instanceof Float32Array) ? y : new Float32Array(y);
    
//     return new Promise((resolve) => {
//       const worker = new Worker(new URL('../workers/statsWorker.js', import.meta.url), { type: 'module' });
      
//       worker.onmessage = (e) => {
//         resolve({ col: e.data.col, stats: e.data.stats });
//         worker.terminate();
//       };

//       // TRANSFER the buffer (Zero-copy). 
//       // After this line, 'typedData' is empty in the main thread. This is LIGHTNING fast.
//       worker.postMessage(
//         { buffer: typedData.buffer, col, selectedStats },
//         [typedData.buffer] 
//       );
//     });
//   });

//   const results = await Promise.all(promises);
//   // Reconstruct into the object format your UI expects
//   return results.reduce((acc, curr) => {
//     acc[curr.col] = curr.stats;
//     return acc;
//   }, {});
// };

// File: src/utils/workerPool.js

export const calculateParallel = async (reader, columns, selectedStats) => {
  const pool = columns.map(async (col) => {
    // 1. Get binary data (STAYS BINARY)
    const { y } = await reader.getChannelData(col);
    const typedData = (y instanceof Float32Array) ? y : new Float32Array(y);
    
    return new Promise((resolve) => {
      const worker = new Worker(new URL('../workers/statsWorker.js', import.meta.url), { type: 'module' });
      
      worker.onmessage = (e) => {
        resolve({ col: e.data.col, stats: e.data.stats });
        worker.terminate();
      };

      // 2. TRANSFERABLE OBJECT (Zero Latency)
      // We pass [typedData.buffer] to MOVE memory, not copy it.
      worker.postMessage(
        { buffer: typedData.buffer, col, selectedStats },
        [typedData.buffer] 
      );
    });
  });

  const results = await Promise.all(pool);
  return results.reduce((acc, { col, stats }) => ({ ...acc, [col]: stats }), {});
};