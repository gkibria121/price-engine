/**
 * Converts CSV string to JSON
 * @param {string} csv - The CSV string to convert
 * @param {Object} options - Configuration options
 * @param {string} options.delimiter - CSV delimiter (default: ',')
 * @param {boolean} options.headers - Whether the CSV contains headers (default: true)
 * @param {string[]} options.customHeaders - Custom headers to use instead of the first row
 * @returns {Object[] | null} Array of objects representing the CSV data or null if invalid
 */
export default function csvToJson(
  csv,
  options: {
    delimiter?: string;
    headers?: boolean;
    customHeaders?: string;
  } = {}
) {
  // Default options
  const delimiter = options.delimiter || ",";
  const hasHeaders = options.headers !== false;
  const customHeaders = options.customHeaders || null;
  const escapedDelimiter = delimiter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Create the regex pattern with the escaped delimiter
  const regPattern = new RegExp(
    `(${escapedDelimiter})(?=(?:[^"]|"[^"]*")*$)`,
    "g"
  );
  try {
    // Handle empty input
    if (!csv || typeof csv !== "string") {
      return null;
    }

    // Split the CSV into rows
    const rows = csv.split(/\r?\n/).filter((row) => row.trim() !== "");

    if (rows.length === 0) {
      return [];
    }

    // Extract headers
    let headers;
    let dataStartIndex = 0;

    if (customHeaders) {
      headers = customHeaders;
    } else if (hasHeaders) {
      headers = rows[0].split(regPattern).map((header) => header.trim());
      dataStartIndex = 1;
    } else {
      // If no headers, use numeric indices
      const firstRow = rows[0].split(delimiter);
      headers = Array.from({ length: firstRow.length }, (_, i) => `column${i}`);
    }

    // Convert each row to an object
    const jsonData: any[] = [];

    for (let i = dataStartIndex; i < rows.length; i++) {
      const row = rows[i].split(regPattern);
      const obj = {};

      // Skip rows with incorrect number of fields
      if (row.length !== headers.length) {
        console.warn(`Skipping row ${i + 1}: column count mismatch`, row);
        continue;
      }

      // Map each value to its header
      for (let j = 0; j < headers.length; j++) {
        const value = row[j].trim();

        // Try to parse numbers and booleans
        if (value === "true") {
          obj[headers[j]] = true;
        } else if (value === "false") {
          obj[headers[j]] = false;
        } else if (value === "") {
          obj[headers[j]] = null;
        } else if (!isNaN(Number(value)) && value !== "") {
          // Check if it's an integer or float
          obj[headers[j]] =
            Number(value) % 1 === 0 ? parseInt(value, 10) : parseFloat(value);
        } else if (value === delimiter) {
        } else {
          obj[headers[j]] = removeOuterQuotes(value);
        }
      }

      jsonData.push(obj);
    }

    return jsonData;
  } catch (error) {
    console.error("Error converting CSV to JSON:", error);
    return null;
  }
}

function removeOuterQuotes(str) {
  // Check if the string starts and ends with quotes
  if (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'"))
  ) {
    // Remove first and last character
    return str.substring(1, str.length - 1);
  }
  // If no matching quotes found, return original string
  return str;
}
