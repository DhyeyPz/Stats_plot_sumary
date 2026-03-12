// export default function ParameterPanel({
//     availableColumns,
//     selectedColumns,
//     columnUnits,
//     isAllSelected,
//     isScanning,
//     onSelectColumn,
//     onSelectAll,
// }) {
//     return (
//         <div
//             style={{
//                 backgroundColor: "#000",
//                 color: "#fff",
//                 borderRadius: "8px",
//                 padding: "12px",
//                 overflowY: "auto",
//                 textAlign: "left",
//             }}
//         >
//             <div
//                 style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     marginBottom: "10px",
//                 }}
//             >
//                 <h4 className="font-semibold ">Select Parameters</h4>
//             </div>
//             {isScanning ? (
//                 <p style={{ color: "#bbb" }}>Scanning files for parameters...</p>
//             ) : availableColumns.length > 0 ? (
//                 <>
//                     <label
//                         style={{
//                             display: "block",
//                             marginBottom: "8px",
//                             cursor: "pointer",
//                             fontWeight: "bold",

//                         }}
//                     >
//                         <input
//                             type="checkbox"
//                             checked={isAllSelected}
//                             onChange={onSelectAll}
//                             style={{ marginRight: "6px" }}
//                         />
//                         Select All
//                     </label>
//                     <hr style={{ borderTop: "1px solid #444" }} />
//                     {availableColumns.map((col) => (
//                         <label
//                             key={col}
//                             style={{
//                                 display: "block",
//                                 marginBottom: "8px",
//                                 cursor: "pointer",
//                                   color: selectedColumns.includes(col) ? "#00FFFF" : "#fff",
//                             }}
//                         >
//                             <input
//                                 type="checkbox"
//                                 checked={selectedColumns.includes(col)}
//                                 onChange={() => onSelectColumn(col)}
//                                 style={{ marginRight: "6px" }}
//                             />
//                             {col} {columnUnits[col] && `(${columnUnits[col]})`}
//                         </label>
//                     ))}
//                 </>
//             ) : (
//                 <p style={{ color: "#666" }}>Select a file to load parameters...</p>
//             )}
//         </div>
//     );
// };
export default function ParameterPanel({
  availableColumns,
  selectedColumns,
  columnUnits,
  isAllSelected,
  isScanning,
  onSelectColumn,
  onSelectAll,
}) {
  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg overflow-hidden">
      {/* Panel Header */}
      <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900/80">
        <h3 className="m-0 font-semibold text-zinc-100 flex items-center gap-2">
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
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          Select Parameters
        </h3>
        {availableColumns.length > 0 && !isScanning && (
          <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={onSelectAll}
              className="accent-emerald-500 w-4 h-4 cursor-pointer"
            />
            Select All
          </label>
        )}
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {isScanning ? (
          <div className="flex items-center gap-2 text-zinc-400 text-sm p-2 animate-pulse">
            <span className="w-4 h-4 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin"></span>
            Scanning parameters...
          </div>
        ) : availableColumns.length > 0 ? (
          <ul className="list-none p-0 m-0 space-y-1">
            {availableColumns.map((col) => {
              const isSelected = selectedColumns.includes(col);
              return (
                <li key={col}>
                  <label
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 border
                      ${isSelected ? "bg-zinc-800 border-zinc-700" : "border-transparent hover:bg-zinc-800/50"}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectColumn(col)}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer flex-shrink-0"
                    />
                    <span
                      className={`text-sm truncate ${
                        isSelected
                          ? "text-zinc-100 font-medium"
                          : "text-zinc-400"
                      }`}
                      title={col}
                    >
                      {col}{" "}
                      {columnUnits[col] && (
                        <span className="text-zinc-500 ml-1 font-normal">
                          ({columnUnits[col]})
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-zinc-500 text-sm p-2">
            Select a file to load parameters.
          </p>
        )}
      </div>
    </div>
  );
}
