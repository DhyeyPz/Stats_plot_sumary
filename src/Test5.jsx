

import React, { useState } from "react";

// Import logic from utils
import { AVAILABLE_STATS } from "./utils/constants";
import { isAllowedFile, parseHeaderAndUnits } from "./utils/fileParsing";
import { calculateStatsInChunks } from "./utils/mathLogic";
import { generateAndExportFiles } from "./utils/exporting";
import Navbar from "./components/NavBar";
import FilePanel from "./components/FilePanel";
import ParameterPanel from "./components/ParameterPanel";
import StatsPanel from "./components/StatsPanel";
import generateXLSXFile from "./utils/power-curve/generatxlsx";
import generateFWContent from "./utils/power-curve/GenarateFWContent";
import generateCSVContent from "./utils/power-curve/generateCSV";
import { OutbReader } from "./utils/outbreader";
import { rainflowCounting,hysteresisFilter,calculateDELs } from "./utils/rainflowLogic";
import { calculateStdDev } from "./utils/mathLogic";
// Fallback download blob
const downloadFile = (content, filename, mimeType) => {
  let blob;
  if (content instanceof ArrayBuffer) {
    blob = new Blob([new Uint8Array(content)], { type: mimeType });
  } else {
    blob = new Blob([content], { type: mimeType });
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const ALL_SEEDS_HEADERS = [
  "FileName",
  "WindSpeed(ms)",
  "Power(kW)",
  "Torque(kNm)",
  "GenSpeed(RPM)",
  "Cp",
  "Ct",
  "Bladepitch1",
  "Bladepitch2",
  "Bladepitch3",
];

const POWER_CURVE_HEADERS = [
  "WindSpeedGroup",
  "WindSpeed(ms)",
  "Power(kW)",
  "Torque(kNm)",
  "GenSpeed(RPM)",
  "Cp",
  "Ct",
  "Bladepitch1",
  "Bladepitch2",
  "Bladepitch3",
];

const Toast = ({ message, show }) => {
  if (!show) return null;
  return (
    <div
      className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-emerald-400 border border-zinc-700 px-6 py-3 rounded-full shadow-2xl z-50 font-medium tracking-wide transition-opacity duration-500 ${show ? "opacity-100" : "opacity-0"}`}
    >
      {message}
    </div>
  );
};

export default function Test5() {
  const [availableColumns, setAvailableColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [columnUnits, setColumnUnits] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [minMaxDataAllFiles, setMinMaxDataAllFiles] = useState({});
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedStats, setSelectedStats] = useState([]);
  const [isAllStatsSelected, setIsAllStatsSelected] = useState(false);
  const [selectedFilesForCalculation, setSelectedFilesForCalculation] =
    useState([]);
  const [isAllFilesSelected, setIsAllFilesSelected] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  // NEW: Store the root directory handle so we can write back to it later
  const [inputDirHandle, setInputDirHandle] = useState(null);

  const [formatDropdownOpen, setFormatDropdownOpen] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState([]);

  const displayMessage = (msg) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 5000);
  };

  const toggleFormat = (formatKey) => {
    setSelectedFormats((prev) =>
      prev.includes(formatKey)
        ? prev.filter((key) => key !== formatKey)
        : [...prev, formatKey],
    );
  };

  // Helper to write to a specific folder, or fallback to standard download
  const saveOrDownload = async (dirHandle, content, filename, mimeType) => {
    if (dirHandle) {
      try {
        const fileHandle = await dirHandle.getFileHandle(filename, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        if (content instanceof ArrayBuffer || content instanceof Blob) {
          await writable.write(content);
        } else {
          await writable.write(new Blob([content], { type: mimeType }));
        }
        await writable.close();
      } catch (err) {
        console.error("Error writing file to directory", err);
        downloadFile(content, filename, mimeType); // fallback
      }
    } else {
      downloadFile(content, filename, mimeType); // fallback
    }
  };

  const handleMultiFormatDownload = async () => {
    if (
      selectedFormats.length === 0 ||
      Object.keys(minMaxDataAllFiles).length === 0
    ) {
      displayMessage("Please select formats and calculate statistics first!");
      return;
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const allSeedsData = prepareAllSeedsData();
    const powerCurveData = preparePowerCurveData();

    const formatsToDownload = Array.from(new Set(selectedFormats));

    // Try to create the "power curve" folder inside the original input folder
    let targetDirHandle = null;
    if (inputDirHandle) {
      try {
        targetDirHandle = await inputDirHandle.getDirectoryHandle(
          "power curve",
          { create: true },
        );
      } catch (err) {
        console.error("Could not create/access 'power curve' folder", err);
      }
    }

    for (const formatKey of formatsToDownload) {
      switch (formatKey) {
        case "all-seeds-csv":
          await saveOrDownload(
            targetDirHandle,
            generateCSVContent(allSeedsData, ALL_SEEDS_HEADERS),
            `All_seeds_power_curve_${dateStr}.csv`,
            "text/csv",
          );
          break;
        case "power-curve-csv":
          await saveOrDownload(
            targetDirHandle,
            generateCSVContent(powerCurveData, POWER_CURVE_HEADERS),
            `Grouped_power_curve_${dateStr}.csv`,
            "text/csv",
          );
          break;
        case "all-seeds-xlsx":
          await saveOrDownload(
            targetDirHandle,
            generateXLSXFile(allSeedsData, ALL_SEEDS_HEADERS, "All Seeds"),
            `All_seeds_power_curve_${dateStr}.xlsx`,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          );
          break;
        case "power-curve-xlsx":
          await saveOrDownload(
            targetDirHandle,
            generateXLSXFile(
              powerCurveData,
              POWER_CURVE_HEADERS,
              "Power Curve",
            ),
            `Grouped_power_curve_${dateStr}.xlsx`,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          );
          break;
        case "all-seeds-fw":
          await saveOrDownload(
            targetDirHandle,
            generateFWContent(allSeedsData, ALL_SEEDS_HEADERS),
            `All_seeds_power_curves_${dateStr}.fw.txt`,
            "text/plain",
          );
          break;
        case "power-curve-fw":
          await saveOrDownload(
            targetDirHandle,
            generateFWContent(powerCurveData, POWER_CURVE_HEADERS),
            `Grouped_power_curve_${dateStr}.fw.txt`,
            "text/plain",
          );
          break;
      }
    }

    displayMessage(
      targetDirHandle
        ? `Saved files to 'power curve' folder!`
        : `Downloaded ${formatsToDownload.length} formats!`,
    );
    setFormatDropdownOpen(false);
    setSelectedFormats([]);
  };

  const SENSOR_TO_FIELD = {
    WindHubVelX: "WindSpeed(ms)",
    Wind1VelX: "WindSpeed(ms)",
    GenPwr: "Power(kW)",
    RotPwr: "Power(kW)",
    GenTq: "Torque(kNm)",
    RotTorq: "Torque(kNm)",
    GenSpeed: "GenSpeed(RPM)",
    RotSpeed: "GenSpeed(RPM)",
    RtAeroCp: "Cp",
    RtAeroCt: "Ct",
    BldPitch1: "Bladepitch1",
    BldPitch2: "Bladepitch2",
    BldPitch3: "Bladepitch3",
  };

  const POWER_CURVE_SENSORS = [
    "WindHubVelX",
    "GenPwr",
    "GenTq",
    "GenSpeed",
    "RtAeroCp",
    "RtAeroCt",
    "BldPitch1",
    "BldPitch2",
    "BldPitch3",
  ];

  const prepareAllSeedsData = () => {
    return Object.entries(minMaxDataAllFiles).map(([fileName, stats]) => {
      const row = { FileName: fileName };
      selectedColumns.forEach((col) => {
        const field = SENSOR_TO_FIELD[col];
        if (field) row[field] = stats[col]?.mean ?? 0;
      });
      POWER_CURVE_SENSORS.forEach((col) => {
        const field = SENSOR_TO_FIELD[col];
        if (field && row[field] === undefined) {
          row[field] = stats[col]?.mean ?? 0;
        }
      });
      return row;
    });
  };

  const preparePowerCurveData = () => {
    const getBaseFilename = (fileName) => {
      const lower = fileName.toLowerCase();
      if (lower.includes("_seed")) return lower.split("_seed")[0];
      return fileName.replace(/\.out$/i, "");
    };

    const grouped = {};

    Object.entries(minMaxDataAllFiles).forEach(([fileName, stats]) => {
      const baseName = getBaseFilename(fileName);
      const windSpeed = stats.WindHubVelX?.mean || stats.Wind1VelX?.mean || 0;
      const windSpeedBin = Math.round(windSpeed * 2) / 2;

      if (!grouped[baseName]) grouped[baseName] = [];

      const row = { WindSpeedGroup: baseName, "WindSpeed(ms)": windSpeedBin };

      POWER_CURVE_SENSORS.forEach((col) => {
        const field = SENSOR_TO_FIELD[col];
        if (field && field !== "WindSpeed(ms)") {
          switch (col) {
            case "GenPwr":
              row["Power(kW)"] = stats.GenPwr?.mean ?? stats.RotPwr?.mean ?? 0;
              break;
            case "GenTq":
              row["Torque(kNm)"] =
                stats.GenTq?.mean ?? stats.RotTorq?.mean ?? 0;
              break;
            case "GenSpeed":
              row["GenSpeed(RPM)"] =
                stats.GenSpeed?.mean ?? stats.RotSpeed?.mean ?? 0;
              break;
            case "RtAeroCp":
              row["Cp"] = stats.RtAeroCp?.mean ?? 0;
              break;
            case "RtAeroCt":
              row["Ct"] = stats.RtAeroCt?.mean ?? 0;
              break;
            case "BldPitch1":
              row["Bladepitch1"] = stats.BldPitch1?.mean ?? 0;
              break;
            case "BldPitch2":
              row["Bladepitch2"] = stats.BldPitch2?.mean ?? 0;
              break;
            case "BldPitch3":
              row["Bladepitch3"] = stats.BldPitch3?.mean ?? 0;
              break;
          }
        }
      });
      grouped[baseName].push(row);
    });

    return Object.entries(grouped)
      .map(([groupName, files]) => {
        const averages = files.reduce(
          (acc, file) => {
            Object.keys(file).forEach((key) => {
              if (key !== "WindSpeedGroup") {
                acc[key] = (acc[key] || 0) + (file[key] || 0);
              }
            });
            return acc;
          },
          { WindSpeedGroup: groupName },
        );

        const fileCount = files.length;
        Object.keys(averages).forEach((key) => {
          if (key !== "WindSpeedGroup") {
            averages[key] = parseFloat((averages[key] / fileCount).toFixed(3));
          }
        });
        return averages;
      })
      .sort(
        (a, b) =>
          parseFloat(a["WindSpeed(ms)"]) - parseFloat(b["WindSpeed(ms)"]),
      );
  };

  // NEW DIRECTORY PICKER LOGIC (Replaces Dropzone)
  const handleUploadFolderClick = async () => {
    try {
      // 1. Ask user for read/write access to a folder
      const dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
      setInputDirHandle(dirHandle);

      // 2. Read files directly from the top level of the folder
      const files = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind === "file" && isAllowedFile(entry.name)) {
          const file = await entry.getFile();
          files.push(file);
        }
      }

      const allFileNames = files.map((f) => f.name);
      setUploadedFiles(files);
      setSelectedFilesForCalculation(allFileNames);
      setIsAllFilesSelected(true);
      setAvailableColumns([]);
      setSelectedColumns([]);
      setColumnUnits({});
      setMinMaxDataAllFiles({});
      setSelectedStats(AVAILABLE_STATS);
      setIsAllStatsSelected(true);

      if (allFileNames.length > 0) {
        await scanSelectedFilesForParameters(files);
      } else {
        displayMessage("No valid .out files found in the selected folder.");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Folder selection failed:", err);
        displayMessage(
          "Failed to open folder. Ensure your browser supports this feature.",
        );
      }
    }
  };

  const scanSelectedFilesForParameters = async (files) => {
    setIsScanning(true);
    const uniqueHeaders = new Set();
    const newColumnUnits = {};

    for (const file of files) {
      if (file.name.toLowerCase().endsWith(".outb")) {
        const reader = new OutbReader(file);
        await reader.readHeader();
        const { headers, unitMap } = reader.getMetadata();

        headers.forEach(h => {
          if (h !== "Time") uniqueHeaders.add(h);
        });
        Object.assign(newColumnUnits, unitMap);
      } else {
        const headerChunk = await file.slice(0, 1024 * 50).text();
        const { headers, unitMap } = parseHeaderAndUnits(headerChunk.split(/\r?\n/));

        headers.forEach(h => {
          if (h !== "Time") uniqueHeaders.add(h);
        });
        Object.assign(newColumnUnits, unitMap);
      }
    }

    const sortedHeaders = Array.from(uniqueHeaders).sort();
    setAvailableColumns(sortedHeaders);
    setColumnUnits(newColumnUnits);
    setSelectedColumns(sortedHeaders);
    setIsScanning(false);
  };
  const handleCalculateData = async () => {
    setIsCalculating(true);
    const newMinMaxData = {};

    for (const file of uploadedFiles.filter(f => selectedFilesForCalculation.includes(f.name))) {
      let fileStats = {};

      if (file.name.toLowerCase().endsWith(".outb")) {
        const reader = new OutbReader(file);
        await reader.readHeader();
        for (const col of selectedColumns) {
          // const { y } = await reader.getChannelData(col);
          // const data = Array.from(y);
          // const mean = data.reduce((a, b) => a + b, 0) / data.length;

          // let dels = { m4: "N/A", m8: "N/A", m10: "N/A" };
          // if (selectedStats.includes("1Hz DEL")) {
          //   const cycles = rainflowCounting(hysteresisFilter(data, 0));
          //   dels = calculateDELs(cycles);
          // }

          // fileStats[col] = {
          //   Min: Math.min(...data), Max: Math.max(...data), Mean: mean,
          //   Range: Math.max(...data) - Math.min(...data),
          //   "Standard Deviation": calculateStdDev(data, mean),
          //   "1Hz DEL (m=4)": dels.m4, "1Hz DEL (m=8)": dels.m8, "1Hz DEL (m=10)": dels.m10
          // };

          
const { y } = await reader.getChannelData(col);
const data = y instanceof Float64Array || y instanceof Float32Array ? y : Array.from(y);

// Single-pass calculation for Min, Max, and Mean to save memory
let min = Infinity;
let max = -Infinity;
let sum = 0;

for (let i = 0; i < data.length; i++) {
  const val = data[i];
  if (val < min) min = val;
  if (val > max) max = val;
  sum += val;
}

const mean = sum / data.length;

let dels = { m4: "N/A", m8: "N/A", m10: "N/A" };
if (selectedStats.includes("1Hz DEL")) {
  const cycles = rainflowCounting(hysteresisFilter(data, 0));
  dels = calculateDELs(cycles);
}

fileStats[col] = {
  Min: min,
  Max: max,
  Mean: mean,
  Range: max - min,
  "Standard Deviation": calculateStdDev(data, mean),
  "1Hz DEL (m=4)": dels.m4,
  "1Hz DEL (m=8)": dels.m8,
  "1Hz DEL (m=10)": dels.m10
};

        }




      } else {
        const headerChunk = await file.slice(0, 50000).text();
        const { headers } = parseHeaderAndUnits(headerChunk.split(/\r?\n/));
        fileStats = await calculateStatsInChunks(file, selectedColumns, Object.fromEntries(headers.map((h, i) => [h, i])), selectedStats);
      }
      newMinMaxData[file.name] = fileStats;
    }
    setMinMaxDataAllFiles(newMinMaxData);
    setIsCalculating(false);
  };
  const handleExportSummary = async () => {
    if (
      Object.keys(minMaxDataAllFiles).length === 0 ||
      selectedStats.length === 0 ||
      selectedColumns.length === 0
    ) {
      displayMessage("Please select columns and calculate statistics first.");
      return;
    }

    // Pass the input directory handle so it can save to the 'stat' folder
    const success = await generateAndExportFiles(
      minMaxDataAllFiles,
      selectedStats,
      selectedColumns,
      columnUnits,
      inputDirHandle,
    );

    if (success) {
      displayMessage("Summary successfully saved to the 'stat' folder!");
    } else {
      displayMessage("Summary exported to default downloads folder.");
    }
  };

  const handleSelectFile = (fileName) => {
    setSelectedFilesForCalculation((prev) => {
      const newSelection = prev.includes(fileName)
        ? prev.filter((name) => name !== fileName)
        : [...prev, fileName];
      setIsAllFilesSelected(newSelection.length === uploadedFiles.length);
      const selectedFiles = uploadedFiles.filter((file) =>
        newSelection.includes(file.name),
      );
      scanSelectedFilesForParameters(selectedFiles);
      return newSelection;
    });
  };

  const handleSelectAllFiles = (e) => {
    const isChecked = e.target.checked;
    setIsAllFilesSelected(isChecked);
    if (isChecked) {
      const allFiles = uploadedFiles;
      const allFileNames = allFiles.map((f) => f.name);
      setSelectedFilesForCalculation(allFileNames);
      scanSelectedFilesForParameters(allFiles);
    } else {
      setSelectedFilesForCalculation([]);
      scanSelectedFilesForParameters([]);
    }
  };

  const handleSelectColumn = (col) => {
    setSelectedColumns((prev) => {
      const newSelection = prev.includes(col)
        ? prev.filter((c) => c !== col)
        : [...prev, col];
      setIsAllSelected(newSelection.length === availableColumns.length);
      return newSelection;
    });
  };

  const handleSelectAllColumns = (e) => {
    const isChecked = e.target.checked;
    setIsAllSelected(isChecked);
    setSelectedColumns(isChecked ? availableColumns : []);
  };

  const handleSelectStat = (stat) => {
    setSelectedStats((prev) => {
      const newSelection = prev.includes(stat)
        ? prev.filter((s) => s !== stat)
        : [...prev, stat];
      setIsAllStatsSelected(newSelection.length === AVAILABLE_STATS.length);
      return newSelection;
    });
  };

  const handleSelectAllStats = (e) => {
    const isChecked = e.target.checked;
    setIsAllStatsSelected(isChecked);
    setSelectedStats(isChecked ? AVAILABLE_STATS : []);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 font-sans">
      <Navbar
        onUploadFolder={handleUploadFolderClick} // Replaced dropzone with direct click handler
        onExport={handleExportSummary}
        selectedFormats={selectedFormats}
        toggleFormat={toggleFormat}
        onDownload={handleMultiFormatDownload}
        disabled={Object.keys(minMaxDataAllFiles).length === 0}
        isOpen={formatDropdownOpen}
        setIsOpen={setFormatDropdownOpen}
        handleCalculateData={handleCalculateData}
      />

      <div className="grid grid-cols-1 md:grid-cols-[350px_350px_1fr] gap-5 p-5 flex-grow overflow-hidden">
        <FilePanel
          uploadedFiles={uploadedFiles}
          selectedFiles={selectedFilesForCalculation}
          isAllSelected={isAllFilesSelected}
          onSelectFile={handleSelectFile}
          onSelectAll={handleSelectAllFiles}
        />

        <ParameterPanel
          availableColumns={availableColumns}
          selectedColumns={selectedColumns}
          columnUnits={columnUnits}
          isAllSelected={isAllSelected}
          isScanning={isScanning}
          onSelectColumn={handleSelectColumn}
          onSelectAll={handleSelectAllColumns}
        />

        <StatsPanel
          availableStats={AVAILABLE_STATS}
          selectedStats={selectedStats}
          isAllStatsSelected={isAllStatsSelected}
          isCalculating={isCalculating}
          onSelectStat={handleSelectStat}
          onSelectAll={handleSelectAllStats}
          onCalculate={handleCalculateData}
        />
      </div>

      <Toast message={message} show={showMessage} />
    </div>
  );
}
