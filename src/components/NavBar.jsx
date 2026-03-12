// import FormatDropdown from "./FormatDropDown";

// export default function Navbar({
//   getRootProps,
//   getInputProps,
//   open,
//   onExport,
//   selectedFormats,
//   toggleFormat,
//   onDownload,
//   disabled,
//   isOpen,
//   setIsOpen,
// handleCalculateData
// }) {
//   return (
//     <div className="bg-black text-white flex justify-between items-center px-6 py-3 border-b border-zinc-800">

//       {/* Title */}
//       <h2 className="text-xl font-bold tracking-wide">
//         Statistics Creation Tool
//       </h2>

//       {/* Right Controls */}
//       <div className="flex items-center gap-4">

//         {/* Upload Folder - Primary (Blue) */}
//         <div {...getRootProps({ className: "cursor-pointer" })}>
//           <input {...getInputProps()} webkitdirectory="" directory="" />
//           <button
//             type="button"
//             onClick={open}
//             className="flex items-center gap-2 px-5 py-3
//               bg-blue-600 hover:bg-blue-700
//               text-white font-semibold text-sm
//               rounded-xl
//               shadow-lg shadow-blue-500/30
//               transition-all duration-200"
//           >
//             📂 Upload Folder
//           </button>
//         </div>

//         {/* Download Dropdown - Emerald (Output) */}
//         <div className="relative flex items-center">
//           <FormatDropdown
//             selectedFormats={selectedFormats || []}
//             toggleFormat={toggleFormat}
//             onDownload={onDownload}
//             disabled={disabled}
//             isOpen={isOpen}
//             setIsOpen={setIsOpen}
//             handleCalculateData={handleCalculateData}
//           />
//         </div>

//         {/* Export Summary - Purple (Generate / Analytics) */}
//         <button
//           type="button"
//           onClick={onExport}
//           disabled={disabled}
//           className={`px-5 py-3 rounded-xl font-semibold text-white text-sm
//             transition-all duration-200
//             ${
//               disabled
//                 ? "bg-purple-600 opacity-50 cursor-not-allowed"
//                 : "bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/30"
//             }`}
//         >
//           📝 Export Summary File
//         </button>

//       </div>
//     </div>
//   );
// }
import FormatDropdown from "./FormatDropDown";

export default function Navbar({
  onUploadFolder, // <-- New prop
  onExport,
  selectedFormats,
  toggleFormat,
  onDownload,
  disabled,
  isOpen,
  setIsOpen,
  handleCalculateData,
}) {
  return (
    <div className="bg-zinc-950 text-zinc-100 flex justify-between items-center px-6 py-4 border-b border-zinc-800 shadow-sm">
      {/* Title with New Analytics Icon */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner shadow-emerald-500/10">
          <svg
            className="w-5 h-5 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
          </svg>
        </div>
        <div className="flex gap-4 items-baseline">
          <h1
            style={{
              fontSize: "1.30rem",
              fontWeight: "600",
              color: "#fff",
              margin: 0,
            }}
          >
            Statistics Plotting Tool
          </h1>
          <span className=" bottom-0 text-[14px]  uppercase tracking-wider text-gray-350 ">
            v<span className="text-[10px] ">1.1.0</span>
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Upload Folder Button - Now uses the new API */}
        <button
          type="button"
          onClick={onUploadFolder} // <-- Direct click handler
          className="flex items-center gap-2 h-10 px-5 
            bg-zinc-800/80 hover:bg-zinc-700/80 
            border border-zinc-700 hover:border-zinc-500 
            text-zinc-200 font-medium text-sm rounded-xl
            transition-all duration-300 ease-out
            hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/50 
            active:translate-y-0 active:scale-95"
        >
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
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          Upload Folder
        </button>

        {/* Download Dropdown Container */}
        <div className="relative flex items-center h-10">
          <FormatDropdown
            selectedFormats={selectedFormats || []}
            toggleFormat={toggleFormat}
            onDownload={onDownload}
            disabled={disabled}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            handleCalculateData={handleCalculateData}
          />
        </div>

        {/* Export Summary Button */}
        <button
          type="button"
          onClick={onExport}
          disabled={disabled}
          className={`flex items-center gap-2 h-10 px-5 rounded-xl font-medium text-sm transition-all duration-300 ease-out active:translate-y-0 active:scale-95
            ${
              disabled
                ? "bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-zinc-800 pointer-events-none"
                : "bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 hover:border-indigo-400 text-white shadow-[0_4px_15px_-3px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_20px_-4px_rgba(79,70,229,0.5)] hover:-translate-y-0.5"
            }`}
        >
          <svg
            className={`w-4 h-4 ${disabled ? "text-zinc-600" : "text-indigo-200"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export Summary
        </button>
      </div>
    </div>
  );
}
