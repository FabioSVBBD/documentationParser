const colors = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",

  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",
};

const markers = {
  text: "abc",
  colon: ":",
  rowBegin: "#--",
  rowDelimiter: ",",
  rowEnd: "--#",
  codeBegin: "$--",
  captionBegin: "@@",
  captionEnd: ";",
  codeEnd: "--$",
  end: "\\\\",
};

const STATES = {
  start_end: "START/END",
  key: "READING_KEY",
  value: "READING_VALUE",
  row: "READING_ROW",
  block: "READING_BLOCK",
  caption: "READING_CAPTION",
  code: "READING_CODE",
};

const endErrorMessages = {
  endErrorDefault: "Execution terminated in non - final state.",
  key: "Colon Parse Error: Failed to read colon following key.",
  value: "Escape Marker Error: Failed to read escape marker following value.",
  row: "Row End Marker Error: Failed to read end of row marker.",
  block: "Null Block Error: Failed to read code block. Code block is empty.",
  caption: "Block End Marker Error: Failed to read end of code block.",
  code: "Caption Marker Error: Failed to read end of code caption. Missing semi-colon.",
};

const valuesKeys = {
  text: "text",
  table: "table",
  code: "code",
  break: "break",
};

const MAGIC = {
  commentBlock: "CommentBlock",
  newline: "\r\n",
  name: "NAME",
  properties: "PROPERTIES",
  threeBackticks: "```",
};

const statuses = {
  SUCCESS: true,
  FAILURE: false,
};

const propertiesTableHeader = [
  ["Property", "Default Value", "Type", "Supported Values", "Description"],
  ["---", "---", "---", "---", "---"],
];

module.exports = {
  colors,
  markers,
  STATES,
  endErrorMessages,
  valuesKeys,
  MAGIC,
  statuses,
  propertiesTableHeader,
};
