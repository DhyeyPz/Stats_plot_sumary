// import { getFileMetadata } from "./fileParsing";
// import { calculateGroupStat } from "./mathLogic";

// const downloadTextFile = (content, filename) => {
//   const blob = new Blob([content], { type: "text/plain" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
//   URL.revokeObjectURL(url);
// };

// export const generateAndExportFiles = (
//   minMaxDataAllFiles,
//   selectedStats,
//   selectedColumns,
//   columnUnits
// ) => {
//   // --- 1. SHARED SETUP & SORTING ---

//   // A. Determine Columns
//   const priorityCols = ["WindHubVelX", "WindHubVelY", "WindHubVelZ"];
//   const sortedColumns = [
//     ...priorityCols.filter((col) => selectedColumns.includes(col)),
//     ...selectedColumns.filter((col) => !priorityCols.includes(col)),
//   ];

//   // B. Determine Sort Key (WindHubVelX or Wind1VelX)
//   let sortKey = "WindHubVelX";
//   if (
//     !selectedColumns.includes("WindHubVelX") &&
//     selectedColumns.includes("Wind1VelX")
//   ) {
//     sortKey = "Wind1VelX";
//   }

//   // C. MASTER SORTING LOGIC
//   const sortedFileEntries = Object.entries(minMaxDataAllFiles).sort(
//     ([, dataA], [, dataB]) => {
//       const statsA = dataA[sortKey];
//       const statsB = dataB[sortKey];

//       // Always sort by MEAN
//       const valA = statsA ? statsA.mean : Infinity;
//       const valB = statsB ? statsB.mean : Infinity;

//       if (typeof valA !== "number") return 1;
//       if (typeof valB !== "number") return -1;

//       return valA - valB; // Ascending Order
//     }
//   );

//   // D. Determine Stat Order
//   const DESIRED_STAT_ORDER = [
//     "Mean",
//     "Standard Deviation",
//     "Min",
//     "Max",
//     "Range",
//     "1Hz DEL",
//   ];

//   const sortedSelectedStats = DESIRED_STAT_ORDER.filter((stat) =>
//     selectedStats.includes(stat)
//   );

//   // --- 2. GENERATE FILE 1: Averaged Summary (Stats_summary.txt) ---
//   let combinedContent = "";
//   combinedContent +=
//     "#Family Averaged Statistics Summary (Conditional Averaging)\n";
//   combinedContent += "# Generated on: " + new Date().toLocaleString() + "\n";
//   combinedContent += `# Sorted by: Mean of ${sortKey} (Applied to all sections)\n\n`;

//   const combinedHeaderRow = [
//     "File",
//     "PLF",
//     "AVG Method",
//     ...sortedColumns.map((col) => `${col} (${columnUnits[col] || ""})`),
//   ];

//   // Group by Family (Pre-calculation for Summary)
//   const groups = {};
//   sortedFileEntries.forEach(([fileName, fileData]) => {
//     const meta = getFileMetadata(fileName);
//     if (!groups[meta.family]) {
//       groups[meta.family] = { meta: meta, files: [] };
//     }
//     groups[meta.family].files.push({ fileName, fileData });
//   });

//   sortedSelectedStats.forEach((statName) => {
//     // === SPECIAL LOGIC FOR 1HZ DEL ===
//     if (statName === "1Hz DEL") {
//       combinedContent += `--- 1Hz eq load for Ncyc = 1.00e+07 ---\n\n`;

//       [4, 8, 10].forEach((m) => {
//         const specificKey = `1Hz DEL (m=${m})`;
//         combinedContent += `--- m=${m} ---\n\n`;

//         const allRows = [combinedHeaderRow];

//         Object.values(groups).forEach((group) => {
//           const avgRow = [
//             group.meta.family,
//             group.meta.partialLoadFactor,
//             group.meta.avgMethod,
//           ];
//           sortedColumns.forEach((col) => {
//             const rawGroupData = group.files.map((f) => f.fileData);
//             // Calculate Average for specific m-value
//             const calculatedVal = calculateGroupStat(
//               rawGroupData,
//               specificKey, // Pass "1Hz DEL (m=4)"
//               col,
//               group.meta.avgMethod
//             );
//             avgRow.push(
//               typeof calculatedVal === "number"
//                 ? calculatedVal.toFixed(8)
//                 : "N/A"
//             );
//           });
//           allRows.push(avgRow);
//         });

//         // Format Table
//         const colWidths = allRows[0].map((_, i) =>
//           Math.max(...allRows.map((r) => String(r[i]).length))
//         );
//         allRows.forEach((row) => {
//           combinedContent +=
//             row
//               .map((c, i) => c + " ".repeat(colWidths[i] - String(c).length))
//               .join("   ") + "\n";
//         });
//         combinedContent += "\n\n";
//       });
//     } else {
//       // === STANDARD LOGIC FOR OTHER STATS ===
//       let headerName = statName === "Standard Deviation" ? "stdev" : statName;
//       combinedContent += `--- ${headerName} Values ---\n\n`;

//       const allRows = [combinedHeaderRow];

//       Object.values(groups).forEach((group) => {
//         const avgRow = [
//           group.meta.family,
//           group.meta.partialLoadFactor,
//           group.meta.avgMethod,
//         ];
//         sortedColumns.forEach((col) => {
//           const rawGroupData = group.files.map((f) => f.fileData);
//           const calculatedVal = calculateGroupStat(
//             rawGroupData,
//             statName,
//             col,
//             group.meta.avgMethod
//           );
//           avgRow.push(
//             typeof calculatedVal === "number" ? calculatedVal.toFixed(2) : "N/A"
//           );
//         });
//         allRows.push(avgRow);
//       });

//       // Format Table
//       const colWidths = allRows[0].map((_, i) =>
//         Math.max(...allRows.map((r) => String(r[i]).length))
//       );
//       allRows.forEach((row) => {
//         combinedContent +=
//           row
//             .map((c, i) => c + " ".repeat(colWidths[i] - String(c).length))
//             .join("   ") + "\n";
//       });
//       combinedContent += "\n\n";
//     }
//   });

//   // --- 3. GENERATE FILE 2: Raw Combined (Stats_summary_combined.txt) ---
//   let rawContent = "";
//   rawContent += "# Statistics for each of the time series files\n";
//   rawContent += "# Generated on: " + new Date().toLocaleString() + "\n";
//   rawContent += `# Sorted by: Mean of ${sortKey} (Applied to all sections)\n\n`;

//   const rawHeaderRow = [
//     "File",
//     "PLF",
//     ...sortedColumns.map((col) => `${col} (${columnUnits[col] || ""})`),
//   ];

//   sortedSelectedStats.forEach((statName) => {
//     // === SPECIAL LOGIC FOR 1HZ DEL ===
//     if (statName === "1Hz DEL") {
//       rawContent += `--- 1Hz eq load for Ncyc = 1.00e+07 ---\n\n`;

//       [4, 8, 10].forEach((m) => {
//         const specificKey = `1Hz DEL (m=${m})`;
//         rawContent += `--- m=${m} ---\n\n`;

//         const allRows = [rawHeaderRow];

//         sortedFileEntries.forEach(([fileName, fileData]) => {
//           const meta = getFileMetadata(fileName);
//           const row = [fileName, meta.partialLoadFactor];

//           sortedColumns.forEach((col) => {
//             const val = fileData[col] ? fileData[col][specificKey] : "N/A";
//             row.push(
//               typeof val === "string" &&
//                 !isNaN(parseFloat(val)) &&
//                 val !== "N/A"
//                 ? val
//                 : "N/A"
//             );
//           });
//           allRows.push(row);
//         });

//         // Format Table
//         const colWidths = allRows[0].map((_, i) =>
//           Math.max(...allRows.map((r) => String(r[i]).length))
//         );
//         allRows.forEach((row) => {
//           rawContent +=
//             row
//               .map((c, i) => c + " ".repeat(colWidths[i] - String(c).length))
//               .join("   ") + "\n";
//         });
//         rawContent += "\n\n";
//       });
//     } else {
//       // === STANDARD LOGIC FOR OTHER STATS ===
//       let headerName = statName === "Standard Deviation" ? "stdev" : statName;
//       rawContent += `--- ${headerName} Values ---\n\n`;

//       const allRows = [rawHeaderRow];

//       sortedFileEntries.forEach(([fileName, fileData]) => {
//         const meta = getFileMetadata(fileName);
//         const row = [fileName, meta.partialLoadFactor];
//         sortedColumns.forEach((col) => {
//           const stats = fileData[col];
//           let value = "N/A";
//           if (stats) {
//             if (statName === "Min") value = stats.min;
//             else if (statName === "Max") value = stats.max;
//             else if (statName === "Mean") value = stats.mean;
//             else if (statName === "Standard Deviation") value = stats.stdDev;
//             else if (statName === "Range") value = stats.range;
//           }
//           row.push(typeof value === "number" ? value.toFixed(2) : "N/A");
//         });
//         allRows.push(row);
//       });

//       // Format Table
//       const colWidths = allRows[0].map((_, i) =>
//         Math.max(...allRows.map((r) => String(r[i]).length))
//       );
//       allRows.forEach((row) => {
//         rawContent +=
//           row
//             .map((c, i) => c + " ".repeat(colWidths[i] - String(c).length))
//             .join("   ") + "\n";
//       });
//       rawContent += "\n\n";
//     }
//   });

//   // DOWNLOAD BOTH FILES (Increased delay to 1s to help permissions)
//   downloadTextFile(combinedContent, "Stats_summary__combined.txt");
//   setTimeout(() => {
//     downloadTextFile(rawContent, "Stats_summary.txt");
//   }, 1000);
// };

import { getFileMetadata } from "./fileParsing";
import { calculateGroupStat } from "./mathLogic";

const downloadTextFile = (content, filename) => {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generateAndExportFiles = async (
  minMaxDataAllFiles,
  selectedStats,
  selectedColumns,
  columnUnits,
  inputDirHandle
) => {
  // --- 1. SHARED SETUP & SORTING ---
  const priorityCols = ["WindHubVelX", "WindHubVelY", "WindHubVelZ"];
  const sortedColumns = [
    ...priorityCols.filter((col) => selectedColumns.includes(col)),
    ...selectedColumns.filter((col) => !priorityCols.includes(col)),
  ];

  const sortedFileEntries = Object.entries(minMaxDataAllFiles).sort(
    ([, dataA], [, dataB]) => {
      const statsA = dataA["WindHubVelX"] || dataA["Wind1VelX"];
      const statsB = dataB["WindHubVelX"] || dataB["Wind1VelX"];
      const valA = statsA ? (statsA.Mean ?? statsA.mean) : Infinity;
      const valB = statsB ? (statsB.Mean ?? statsB.mean) : Infinity;
      return (valA ?? Infinity) - (valB ?? Infinity);
    }
  );

  const DESIRED_STAT_ORDER = ["Mean", "Standard Deviation", "Min", "Max", "Range", "1Hz DEL"];
  const sortedSelectedStats = DESIRED_STAT_ORDER.filter((stat) => selectedStats.includes(stat));

  const formatTable = (rows) => {
    const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => String(r[i]).length)));
    return rows.map((r) => r.map((c, i) => String(c).padEnd(widths[i])).join("   ")).join("\n") + "\n\n";
  };

  // --- 2. GENERATE FILE 1: Averaged Summary (combinedContent) ---
  let combinedContent = "# Family Averaged Statistics Summary\n";
  combinedContent += "# Generated on: " + new Date().toLocaleString() + "\n\n";

  const combinedHeaderRow = ["File (Family)", "PLF", "AVG Method", ...sortedColumns.map((col) => `${col} (${columnUnits[col] || ""})`)];

  const groups = {};
  sortedFileEntries.forEach(([fileName, fileData]) => {
    const meta = getFileMetadata(fileName);
    if (!groups[meta.family]) groups[meta.family] = { meta: meta, files: [] };
    groups[meta.family].files.push({ fileName, fileData });
  });

  sortedSelectedStats.forEach((statName) => {
    if (statName === "1Hz DEL") {
      combinedContent += `--- 1Hz eq load for Ncyc = 1.00e+07 ---\n\n`;
      [4, 8, 10].forEach((m) => {
        const specificKey = `1Hz DEL (m=${m})`;
        combinedContent += `--- m=${m} ---\n\n`;
        const allRows = [combinedHeaderRow];

        Object.values(groups).forEach((group) => {
          const avgRow = [group.meta.family, String(group.meta.partialLoadFactor), String(group.meta.avgMethod)];
          sortedColumns.forEach((col) => {
            const rawGroupData = group.files.map((f) => f.fileData);
            const calculatedVal = calculateGroupStat(rawGroupData, specificKey, col, group.meta.avgMethod);
            avgRow.push(typeof calculatedVal === "number" ? calculatedVal.toFixed(8) : String(calculatedVal));
          });
          allRows.push(avgRow);
        });
        combinedContent += formatTable(allRows);
      });
    } else {
      let headerName = statName === "Standard Deviation" ? "stdev" : statName;
      combinedContent += `--- ${headerName} Values ---\n\n`;
      const allRows = [combinedHeaderRow];

      Object.values(groups).forEach((group) => {
        const avgRow = [group.meta.family, String(group.meta.partialLoadFactor), String(group.meta.avgMethod)];
        sortedColumns.forEach((col) => {
          const rawGroupData = group.files.map((f) => f.fileData);
          const calculatedVal = calculateGroupStat(rawGroupData, statName, col, group.meta.avgMethod);
          avgRow.push(typeof calculatedVal === "number" ? calculatedVal.toFixed(2) : String(calculatedVal));
        });
        allRows.push(avgRow);
      });
      combinedContent += formatTable(allRows);
    }
  });

  // --- 3. GENERATE FILE 2: Raw Combined (rawContent) ---
  let rawContent = "# Per-File Statistics Summary\n";
  rawContent += "# Generated on: " + new Date().toLocaleString() + "\n\n";

  const rawHeaderRow = ["File", "PLF", ...sortedColumns.map((col) => `${col} (${columnUnits[col] || ""})`)];

  sortedSelectedStats.forEach((statName) => {
    if (statName === "1Hz DEL") {
      rawContent += `--- 1Hz eq load for Ncyc = 1.00e+07 ---\n\n`;
      [4, 8, 10].forEach((m) => {
        const specificKey = `1Hz DEL (m=${m})`;
        rawContent += `--- m=${m} ---\n\n`;
        const allRows = [rawHeaderRow];
        sortedFileEntries.forEach(([fileName, fileData]) => {
          const meta = getFileMetadata(fileName);
          const row = [fileName, String(meta.partialLoadFactor)];
          sortedColumns.forEach((col) => {
            const val = fileData[col] ? fileData[col][specificKey] : "N/A";
            row.push(typeof val === "number" ? val.toFixed(8) : String(val));
          });
          allRows.push(row);
        });
        rawContent += formatTable(allRows);
      });
    } else {
      rawContent += `--- ${statName} Values ---\n\n`;
      const allRows = [rawHeaderRow];
      sortedFileEntries.forEach(([fileName, fileData]) => {
        const row = [fileName, String(getFileMetadata(fileName).partialLoadFactor)];
        sortedColumns.forEach((col) => {
          const s = fileData[col];
          let v = "N/A";
          if (s) {
            if (statName === "Min") v = s.Min ?? s.min;
            else if (statName === "Max") v = s.Max ?? s.max;
            else if (statName === "Mean") v = s.Mean ?? s.mean;
            else if (statName === "Range") v = s.Range ?? s.range;
            else if (statName === "Standard Deviation") v = s["Standard Deviation"] ?? s.stdDev ?? s.stdev;
          }
          row.push(typeof v === "number" ? v.toFixed(2) : String(v));
        });
        allRows.push(row);
      });
      rawContent += formatTable(allRows);
    }
  });

  // --- 4. SAVE TO 'stat' FOLDER OR DOWNLOAD ---
  if (inputDirHandle) {
    try {
      const statDir = await inputDirHandle.getDirectoryHandle("stat", { create: true });

      const write = async (name, content) => {
        const fh = await statDir.getFileHandle(name, { create: true });
        const w = await fh.createWritable();
        await w.write(content);
        await w.close();
      };

      await write("Stats_summary_combined.txt", combinedContent);
      await write("Stats_summary.txt", rawContent);
      return true;
    } catch (err) {
      console.warn("Folder write failed, triggering downloads.", err);
    }
  }

  // Fallback downloads
  downloadTextFile(combinedContent, "Stats_summary_combined.txt");
  setTimeout(() => downloadTextFile(rawContent, "Stats_summary.txt"), 1000);
  return false;
};