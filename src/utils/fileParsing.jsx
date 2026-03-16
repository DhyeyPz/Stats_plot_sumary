import { ALLOWED_EXTENSIONS } from "./constants";

export const isAllowedFile = (fileName) =>
  ALLOWED_EXTENSIONS.some((ext) => fileName.toLowerCase().endsWith(ext));

export const parseHeaderAndUnits = (lines) => {
  const headerIndex = lines.findIndex((line) => line.includes("Time"));
  if (headerIndex === -1) {
    return { headers: [], unitMap: {} };
  }
  const unitIndex = headerIndex + 1;
  const headers = lines[headerIndex].trim().split(/\s+/);
  const units = lines[unitIndex]?.trim().split(/\s+/) || [];
  const unitMap = {};
  headers.forEach((h, i) => {
    unitMap[h] = (units[i] || "").replace(/[()]/g, "");
  });
  return { headers, unitMap };
};

export const getFileMetadata = (fileName) => {
  const method3Prefixes = ["DLC14", "DLC15", "DLC32", "DLC33", "DLC42"];
  const isMethod3 = method3Prefixes.some((prefix) =>
    fileName.startsWith(prefix)
  );

  let familyName = fileName.replace(/\.[^/.]+$/, "");
  const seedMatch = familyName.match(/^(.*?)_Seed/i);
  if (seedMatch) {
    familyName = seedMatch[1];
  } else {
    const parts = familyName.split("_");
    if (parts.length > 2) familyName = `${parts[0]}_${parts[1]}`;
  }

  return {
    family: familyName,
    avgMethod: isMethod3 ? 3 : 1,
    partialLoadFactor: 1,
  };
};


// Function to filter out .out files if a .outb with the same name exists
export const filterDuplicateOutFiles = (files) => {
  const fileMap = new Map();

  // 1. Group files by their base name
  for (const file of files) {
    const fileName = file.name;
    const lastDotIndex = fileName.lastIndexOf(".");
    
    // Skip if no extension
    if (lastDotIndex === -1) continue; 

    const baseName = fileName.substring(0, lastDotIndex);
    const extension = fileName.substring(lastDotIndex).toLowerCase();

    // Only process allowed extensions just to be safe
    if (extension !== ".out" && extension !== ".outb") continue;

    if (!fileMap.has(baseName)) {
      fileMap.set(baseName, {});
    }
    
    // Store the file object under its specific extension
    fileMap.get(baseName)[extension] = file;
  }

  const filteredFiles = [];

  // 2. Select .outb over .out
  for (const [baseName, extensions] of fileMap.entries()) {
    if (extensions[".outb"]) {
      filteredFiles.push(extensions[".outb"]); // Prefer .outb if it exists
    } else if (extensions[".out"]) {
      filteredFiles.push(extensions[".out"]);  // Fallback to .out
    }
  }

  return filteredFiles;
};