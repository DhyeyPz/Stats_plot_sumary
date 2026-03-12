// export default function StatsPanel({
//   availableStats,
//   selectedStats,
//   isAllStatsSelected,
//   isCalculating,
//   onSelectStat,
//   onSelectAll,
//   onCalculate,
// }) {
//   return (
//     <div className="flex flex-col gap-4 text-white">

//       {/* Top Panel */}
//       <div className="bg-black rounded-lg p-4 overflow-y-auto text-left border border-zinc-700">

//         <h4 className="mb-3 font-semibold text-sm tracking-wide">
//           Select Statistical Functions
//         </h4>

//         {/* Select All */}
//         <label className="block mb-2  cursor-pointer">
//           <input
//             type="checkbox"
//             checked={isAllStatsSelected}
//             onChange={onSelectAll}
//             className="mr-2 accent-emerald-500"
//           />
//           Select All
//         </label>

//         <hr className="border-zinc-700 my-2" />

//         {/* Stats List (same wrap layout) */}
//         <div className="flex flex-wrap gap-3">
//           {availableStats.map((stat) => (
//             <label
//               key={stat}
//               className="flex items-center cursor-pointer hover:text-emerald-400 transition-colors"
//             >
//               <input
//                 type="checkbox"
//                 checked={selectedStats.includes(stat)}
//                 onChange={() => onSelectStat(stat)}
//                 className="mr-2 accent-emerald-500 "
//               />
//               {stat}
//             </label>
//           ))}
//         </div>

//         <hr className="border-zinc-700 mt-3" />

//         {/* Calculate Button */}
//         <div className="flex justify-center mt-3">
//           <button
//             onClick={onCalculate}
//             disabled={isCalculating}
//             className={`w-full py-2 px-4 rounded-md font-medium transition-all
//               ${
//                 isCalculating
//                   ? "bg-zinc-600 cursor-not-allowed"
//                   : "bg-green-500 hover:bg-green-600 shadow-md shadow-green-500/30"
//               }`}
//           >
//             {isCalculating ? "Calculating..." : "Calculate Data"}
//           </button>
//         </div>
//       </div>

//       {/* Bottom Panel */}
//       <div className="bg-black rounded-lg p-4 text-center grow
//                       flex items-center justify-center border border-zinc-700 text-sm">

//         {isCalculating ? (
//           <p className="animate-pulse text-emerald-400">
//             Calculating statistics...
//           </p>
//         ) : (
//           <p className="text-zinc-400 text-xl">
//             Select files, parameters, and statistical functions,
//             <br />
//             then click <span className="text-emerald-400">"Calculate Data"</span> to get results.
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

export default function StatsPanel({
  availableStats,
  selectedStats,
  isAllStatsSelected,
  isCalculating,
  onSelectStat,
  onSelectAll,
  onCalculate,
}) {
  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Top Panel - Stat Selection */}
      <div className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg p-5">
        <div className="flex justify-between items-center mb-4">
          <h4 className="m-0 font-semibold text-zinc-100 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Statistical Functions
          </h4>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            <input
              type="checkbox"
              checked={isAllStatsSelected}
              onChange={onSelectAll}
              className="accent-emerald-500 w-4 h-4 cursor-pointer"
            />
            Select All
          </label>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {availableStats.map((stat) => {
            const isSelected = selectedStats.includes(stat);
            return (
              <label
                key={stat}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 border
                  ${isSelected ? "bg-blue-600 border-white-500 text-zinc-100  " : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800/60 text-zinc-400"}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelectStat(stat)}
                  className="accent-emerald-500 w-4 h-4 cursor-pointer hidden"
                />
                <span className="text-sm font-medium">{stat}</span>
              </label>
            );
          })}
        </div>

        {/* Calculate Button - Now Professional Indigo */}
        <button
          onClick={onCalculate}
          disabled={isCalculating}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 ease-out shadow-lg
            ${
              isCalculating
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800"
                : "bg-green-600 hover:bg-green-500 border border-green-500 hover:border-green-400 shadow-[0_4px_15px_-3px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_20px_-4px_rgba(79,70,229,0.5)] active:scale-[0.98]"
            }`}
        >
          {isCalculating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></span>
              Calculating...
            </span>
          ) : (
            "Calculate Data"
          )}
        </button>
      </div>

      {/* Bottom Panel - Helper/Status Container */}
      <div className="flex-1 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl flex items-center justify-center p-6 text-center">
        {isCalculating ? (
          <p className="animate-pulse text-indigo-400 font-medium">
            Crunching the numbers...
          </p>
        ) : (
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">
            Select files, parameters, and functions, then click{" "}
            <span className="text-indigo-400 font-semibold">
              Calculate Data
            </span>{" "}
            to build your metrics.
          </p>
        )}
      </div>
    </div>
  );
}
