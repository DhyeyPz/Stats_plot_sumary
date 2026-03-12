import { useRef, useEffect } from "react";

const FormatDropdown = ({
  selectedFormats = [],
  toggleFormat,
  onDownload,
  disabled = false,
  isOpen,
  handleCalculateData,
  setIsOpen,
}) => {
  const formats = [
    {
      key: "all-seeds-csv",
      label: "📊 All Seeds CSV",
      desc: "Individual files",
      available: true,
    },
    {
      key: "power-curve-csv",
      label: "📈 Power Curve CSV",
      desc: "Filename_3.0 groups",
      available: true,
    },
    {
      key: "all-seeds-xlsx",
      label: "📗 All Seeds XLSX",
      desc: "Excel format",
      available: true,
    },
    {
      key: "power-curve-xlsx",
      label: "📘 Power Curve XLSX",
      desc: "Grouped Excel",
      available: true,
    },
    {
      key: "all-seeds-fw",
      label: "📄 All Seeds FW.TXT",
      desc: "Fixed-width",
      available: true,
    },
    {
      key: "power-curve-fw",
      label: "📑 Power Curve FW.TXT",
      desc: "Grouped fixed-width",
      available: true,
    },
  ];

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  return (
    <div className="relative h-10" ref={dropdownRef}>
      {/* Trigger Button - Now pure neutral dark grey */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 h-10 px-5 
        border font-medium text-sm rounded-xl
        transition-all duration-300 ease-out active:translate-y-0 active:scale-95
        ${
          disabled
            ? "bg-zinc-900 border-zinc-800 text-zinc-600 opacity-60 cursor-not-allowed pointer-events-none"
            : "bg-zinc-800/80 hover:bg-zinc-700/80 border-zinc-700 hover:border-zinc-500 text-zinc-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/50"
        }`}
      >
        Download Power Curve Inputs
        {selectedFormats.length > 0 && (
          <span className="bg-zinc-700 text-zinc-100 py-0.5 px-2 rounded-md text-xs font-bold border border-zinc-600">
            {selectedFormats.length}
          </span>
        )}
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu Content */}
      {isOpen && (
        <div
          className="absolute right-0 mt-3 w-[500px] 
        bg-zinc-900 border border-zinc-700 
        rounded-2xl shadow-2xl z-50 overflow-hidden transform opacity-100 scale-100 transition-all duration-200 origin-top-right"
        >
          {/* Header of dropdown */}
          <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
            <div className="flex flex-col w-full">
              <h3 className="text-sm font-semibold text-zinc-100">
                Export Format
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Choose your preferred file formats
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          {/* Formats list and selection*/}
          <div className="grid grid-cols-2 gap-3 p-4 max-h-[350px] overflow-y-auto custom-scrollbar">
            {formats.map((format) => {
              const isSelected = selectedFormats.includes(format.key);
              const isAvailable = format.available;

              return (
                <button
                  key={format.key}
                  onClick={() => isAvailable && toggleFormat(format.key)}
                  disabled={disabled || !isAvailable}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 text-left active:scale-[0.98]
                  ${
                    isSelected
                      ? "border-zinc-500 bg-zinc-800"
                      : "border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800"
                  }
                  ${!isAvailable && "opacity-50 cursor-not-allowed"}
                `}
                >
                  <div className="flex-1">
                    <span
                      className={`text-sm font-medium ${isSelected ? "text-zinc-100" : "text-zinc-400"}`}
                    >
                      {format.label}
                    </span>
                  </div>

                  {isAvailable && (
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                      ${
                        isSelected
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-zinc-600 bg-zinc-900"
                      }
                    `}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer containing download button */}
          {selectedFormats.length > 0 && (
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 flex justify-end">
              <button
                onClick={() => {
                  onDownload();
                  setIsOpen(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl w-full transition-all duration-200 active:scale-95 shadow-lg shadow-indigo-600/20"
              >
                Download Selected ({selectedFormats.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FormatDropdown;
