import * as XLSX from "xlsx";


const generateXLSXFile = (data, headers, sheetName) => {
  // Format each row to ensure proper types and handle null/undefined values
  const formattedData = data.map((row) => {
    const obj = {};
    headers.forEach((h) => {
      const val = row[h];

      // Replace null or undefined with empty string
      if (val === null || val === undefined) {
        obj[h] = "";
      } 
      // Round numbers to 3 decimal places if finite
      else if (typeof val === "number" && isFinite(val)) {
        obj[h] = Number(val.toFixed(3));
      } 
      // Keep other values as-is
      else {
        obj[h] = val;
      }
    });
    return obj;
  });

  // Convert formatted JSON data to an XLSX worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData, {
    header: headers, // Ensure the headers are in the desired order
  });

  // Set column widths, defaulting to at least 14 characters wide
  worksheet["!cols"] = headers.map((h) => ({
    wch: Math.max(h.length, 14),
  }));

  // Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate the XLSX file as an ArrayBuffer
  const wbout = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  // Return as a Blob so it can be downloaded in the browser
  return new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

export default generateXLSXFile;
