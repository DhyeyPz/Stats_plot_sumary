// funtion to generate the csv file

const  generateCSVContent = (data, headers) => {
  let csv = "\uFEFF" + headers.join(",") + "\r\n";
  //sort the data accn to windspeed
  const sortedData = data.sort(
    (a, b) => (a["WindSpeed(ms)"] || 0) - (b["WindSpeed(ms)"] || 0),
  );

  sortedData.forEach((row) => {
    const values = headers.map((h) => {
      const val = row[h];
      // Replace null or undefined with empty string
      if (val === null || val === undefined) return "";

      if (typeof val === "number" && !isFinite(val)) return "0";
      
      // Round numbers to 3 decimal places if finite
      return typeof val === "number" ? val.toFixed(3) : String(val);
    });
    csv += values.join(",") + "\r\n";
  });
  return csv;
};

export default generateCSVContent