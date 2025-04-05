// Helper function to convert i18next options string part to valid JSON string
// e.g., "{ style: 'currency', currency: 'USD' }" -> "{ \"style\": \"currency\", \"currency\": \"USD\" }"
function toJsonString(optionsStr: string): string {
  try {
    // Find the start and end of the object literal
    const startIndex = optionsStr.indexOf("{");
    const endIndex = optionsStr.lastIndexOf("}");
    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
      let objectLiteral = optionsStr.substring(startIndex, endIndex + 1);
      // Basic conversion: replace single quotes with double, quote keys if unquoted
      objectLiteral = objectLiteral.replace(/'/g, '"');
      objectLiteral = objectLiteral.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
      // Validate structure before returning
      JSON.parse(objectLiteral);
      return objectLiteral;
    }
  } catch (e) {
    console.error("Failed to convert options string to JSON string:", optionsStr, e);
  }
  return "{}";
}

function format(value: unknown, formatString?: string, lng?: string): string {
  // If no formatString is provided, return the value as a string
  if (!formatString) {
    return String(value);
  }

  const formatKey = formatString.split(",")[0].trim();

  if (formatKey === "date") {
    if (value instanceof Date || typeof value === "number") {
      return formatDate(value, lng);
    } else {
      console.warn(`Value for date formatting was not a Date or number:`, value);
      return String(value);
    }
  } else if (formatKey === "number") {
    if (typeof value === "number") {
      return String(formatNumber(value, formatString, lng));
    } else {
      console.warn(`Value for number formatting was not a number:`, value);
      return String(value);
    }
  }

  // Fallback for unknown format keys, ensure string return
  return String(value);
}

type NumberFormatOptions = Intl.NumberFormatOptions;

function formatNumber(value: number, formatKeyWithOptions: string, lng: string | undefined): string {
  const options = toOptions(formatKeyWithOptions);
  const validOptions: NumberFormatOptions = options ?? {};
  try {
    return new Intl.NumberFormat(lng, validOptions).format(value);
  } catch (error) {
    console.error("Error formatting number:", error);
    return String(value);
  }
}

function formatDate(value: Date | number, lng: string | undefined): string {
  try {
    return new Intl.DateTimeFormat(lng).format(value);
  } catch (error) {
    console.error("Error formatting date:", error);
    return String(value);
  }
}

function toOptions(formatKeyWithOptions?: string): NumberFormatOptions | null {
  if (!formatKeyWithOptions) {
    return {}; // Default options if no format string provided
  }
  const formatKey = formatKeyWithOptions.split(",")[0].trim();
  const optionsString = formatKeyWithOptions.substring(formatKeyWithOptions.indexOf(",") + 1).trim();

  if (formatKey === "date") {
    return {};
  } else if (formatKey === "number") {
    if (!optionsString || !optionsString.startsWith("{")) {
      return {};
    }
    try {
      const jsonOptionsString = toJsonString(optionsString);
      return JSON.parse(jsonOptionsString) as NumberFormatOptions;
    } catch (error) {
      console.error(`Error parsing number options string: "${optionsString}"`, error);
      return null;
    }
  } else {
    try {
      const jsonString = toJsonString(formatKeyWithOptions);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error(`Error parsing options string: "${formatKeyWithOptions}"`, error);
      return null;
    }
  }
}
export default format;
