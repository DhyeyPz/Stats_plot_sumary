// File: src/utils/workerHelper.js

export const runStatsWorker = (dataArray, col, selectedStats) => {
  return new Promise((resolve, reject) => {
    // This URL syntax works for Vite and modern Webpack/CRA setups
    const worker = new Worker(new URL('../workers/statsWorker.js', import.meta.url), { type: 'module' });

    worker.onmessage = (e) => {
      resolve(e.data);
      worker.terminate(); // Instantly kill the worker to free up RAM
    };

    worker.onerror = (error) => {
      console.error(`Worker failed on column: ${col}`, error);
      reject(error);
      worker.terminate();
    };

    // Send the data. If dataArray is a TypedArray, this is lightning fast.
    worker.postMessage({ data: dataArray, col, selectedStats });
  });
};