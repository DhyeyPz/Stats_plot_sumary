//function to generate the fw.txt file
//data -array of objects header-the parameters
const  generateFWContent = (data, headers) => {
  //sort the data accdn to windspeed
  const sortedData = data.sort(
    (a, b) => (a["WindSpeed(ms)"] || 0) - (b["WindSpeed(ms)"] || 0),
  );

  //loop throught each header and extract values
  const formattedRows = sortedData.map((row) =>
    headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      if (typeof val === "number") return Number(val).toFixed(3);
      return val.toString();
    }),
  );

  // for proper arrangement of columns
  const columnWidths = headers.map((header, colIndex) => {
    const maxDataWidth = Math.max(
      ...formattedRows.map((row) => row[colIndex].length),
      header.length,
    );
    return maxDataWidth + 2;
  });

  //start creating the fw.text content
  let fwContent = "";
  //build the headers 
  fwContent += headers.map((h, i) => h.padEnd(columnWidths[i])).join("") + "\n";

  //build the content
  fwContent += columnWidths.map((w) => "-".repeat(w)).join("") + "\n";
  formattedRows.forEach((row) => {
    fwContent +=
      row.map((cell, i) => cell.padEnd(columnWidths[i])).join("") + "\n";
  });
  fwContent += "\n# END";
  return fwContent;
};
export default  generateFWContent