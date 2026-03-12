// export default function FilePanel  ({
//   uploadedFiles,
//   selectedFiles,
//   isAllSelected,
//   onSelectFile,
//   onSelectAll,
// }){
//   return (
//     <div
//       style={{
//         backgroundColor: "#000",
//         color: "#fff",
//         borderRadius: "8px",
//         padding: "12px",
//         overflowY: "auto",
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: "10px",
//         }}
//       >
//         <h3 style={{ margin: 0 }}>📁 Uploaded Files</h3>
//         <label style={{ cursor: "pointer", fontSize: "14px" }}>
//           <input
//             type="checkbox"
//             checked={isAllSelected}
//             onChange={onSelectAll}
//             style={{ marginRight: "6px" }}
//           />
//           Select All
//         </label>
//       </div>
//       <hr style={{ borderTop: "1px solid #444" }} />
//       <ul style={{ listStyle: "none", paddingLeft: "0", margin: 0 }}>
//         {uploadedFiles.map((file) => (
//           <li
//             key={file.name}
//             style={{ marginBottom: "6px", textAlign: "left" }}
//           >
//             <label
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "6px",
//                 cursor: "pointer",
//               }}
//             >
//               <input
//                 type="checkbox"
//                 checked={selectedFiles.includes(file.name)}
//                 onChange={() => onSelectFile(file.name)}
//                 style={{ marginRight: "6px" }}
//               />
//               <span
//                 style={{
//                   fontSize: "14px",
//                   color: selectedFiles.includes(file.name) ? "#00FFFF" : "#fff",

//                 }}
//               >
//                 {file.name}
//               </span>
//             </label>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };
export default function FilePanel({
  uploadedFiles,
  selectedFiles,
  isAllSelected,
  onSelectFile,
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
              d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
            />
          </svg>
          Uploaded Files
        </h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onSelectAll}
            className="accent-emerald-500 w-4 h-4 cursor-pointer"
          />
          Select All
        </label>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {uploadedFiles.length === 0 ? (
          <p className="text-zinc-500 text-sm p-2">No files uploaded yet.</p>
        ) : (
          <ul className="list-none p-0 m-0 space-y-1">
            {uploadedFiles.map((file) => {
              const isSelected = selectedFiles.includes(file.name);
              return (
                <li key={file.name}>
                  <label
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 border
                      ${isSelected ? "bg-zinc-800 border-zinc-700" : "border-transparent hover:bg-zinc-800/50"}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectFile(file.name)}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer flex-shrink-0"
                    />
                    <span
                      className={`text-sm truncate ${
                        isSelected
                          ? "text-zinc-100 font-medium"
                          : "text-zinc-400"
                      }`}
                      title={file.name}
                    >
                      {file.name}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
