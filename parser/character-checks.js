const {
    markers,
    valuesKeys,
  } = require("./constants");

function getValueType(first, second, third) {
  if (first + second === markers.end) return valuesKeys.break;
  if (first + second + third === markers.rowBegin) return valuesKeys.table;
  if (first + second + third === markers.codeBegin) return valuesKeys.code;

  return valuesKeys.text;
}

function getRowDecision(first, second, third) {
  if (first + second + third === markers.rowEnd) return markers.rowEnd;
  if (first === markers.rowDelimiter) return markers.rowDelimiter;

  return markers.text;
}

function isCodeEnd(first, second, third) {
  if (first + second + third === markers.codeEnd) return true;

  return false;
}

function isCaptionMarker(first, second) {
  if (first + second === markers.captionBegin) return true;

  return false;
}

module.exports = {
    getValueType,
    getRowDecision,
    isCodeEnd,
    isCaptionMarker
};
