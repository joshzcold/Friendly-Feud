function format(value, format, lng) {
  if (format === "date") {
    return formatDate(value, format, lng);
  } else if (format === "number") {
    return formatNumber(value, format, lng);
  }
  return value;
}

function formatNumber(value, format, lng) {
  const options = toOptions(format, "number");
  return options === null
    ? value
    : new Intl.NumberFormat(lng, options).format(value);
}

function formatDate(value, format, lng) {
  return new Intl.DateTimeFormat(lng).format(value);
}

function toOptions(format) {
  // Handle case with no options, e.g. {{today, date}}
  if (format.trim() === "date") {
    return {};
  } else if (format.trim() === "number") {
    return {};
  } else {
    try {
      return JSON.parse(toJsonString(format));
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
export default format;
