const { parse } = require("querystring");

{
  // parser 2.0

  ("use strict");

  const fs = require("fs");
  const babelParser = require("@babel/parser");

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

  let inFile,
    outFile = "output.MD";

  function parseArgs() {
    const args = process.argv.slice(2);

    if (args.length === 0) return false;

    inFile = args[0];

    if (args.length === 2) {
      outFile = args[1];
    } else {
      outFile = inFile.replace(".js", ".MD");
    }

    return true;
  }

  function getCommentBlock(fileName) {
    try {
      const fileContent = fs.readFileSync(fileName).toString();
      const { comments } = babelParser.parse(fileContent);

      if (comments.length >= 1) {
        let { value } = comments.find(
          (elem) => elem["type"] === MAGIC.commentBlock
        );
        return value;
      }
    } catch (error) {
      console.error(`Error reading ${fileName}: ${error.message}`);
    }
  }

  function getValueType(first, second, third) {
    if (first + second === markers.end) return valuesKeys.break;
    if (first + second + third === markers.rowBegin) return valuesKeys.table;
    if (first + second + third === markers.codeBegin) return valuesKeys.code;
    else return valuesKeys.text;
  }

  function getRowDecision(first, second, third) {
    if (first + second + third === markers.rowEnd) return markers.rowEnd;
    if (first === markers.rowDelimiter) return markers.rowDelimiter;

    return markers.text;
  }

  function isCaptionMarker(first, second) {
    if (first + second === markers.captionBegin) return true;

    return false;
  }

  function isCodeEnd(first, second, third) {
    if (first + second + third === markers.codeEnd) return true;

    return false;
  }

  function tokenize(commentBlock) {
    let state = STATES.start_end;
    let fileObject = {
      keys: [],
      values: [],
    };
    let currentIndex = 0;
    let rowIndex = 0;

    for (let i = 0; i < commentBlock.length; i++) {
      let current = commentBlock[i];
      let second =
        commentBlock.length > i + 1 ? commentBlock[i + 1] : undefined;
      let third = commentBlock.length > i + 2 ? commentBlock[i + 2] : undefined;

      switch (state) {
        case STATES.start_end:
          // create key, add letter to it and go to STATE key.
          fileObject.keys.push(String(current));
          state = STATES.key;

          break;
        case STATES.key:
          // if colon read, go to STATE value, else build key
          if (current === markers.colon) {
            state = STATES.value;
          } else {
            fileObject.keys[currentIndex] += String(current);
          }

          break;
        case STATES.value:
          if (current == "\r" || current == "\n") {
            break;
          }

          if (fileObject.values.length <= currentIndex) {
            fileObject.values.push([]);
          }

          let type = getValueType(current, second, third);

          // Case 1: go to STATE start_end
          if (type === valuesKeys.break) {
            i += markers.end.length - 1;
            state = STATES.start_end;
            currentIndex++;

            break;
          }

          if (type === valuesKeys.text) {
            if (fileObject.values[currentIndex].length === 0) {
              fileObject.values[currentIndex].push({
                type: type,
                value: String(current),
              });
            } else {
              let len = fileObject.values[currentIndex].length;

              if (type !== fileObject.values[currentIndex][len - 1]["type"]) {
                fileObject.values[currentIndex].push({ type: type, value: "" });
                len = fileObject.values[currentIndex].length;
              }

              fileObject.values[currentIndex][len - 1]["value"] +=
                String(current);
            }

            break;
          }

          let val = undefined;

          // case 3 and 4: reading tables or code
          if (type === valuesKeys.table) {
            i += markers.rowBegin.length - 1;
            state = STATES.row;
            val = [];
          } else if (type === valuesKeys.code) {
            i += markers.codeBegin.length - 1;
            state = STATES.block;
            val = {};
          }

          fileObject.values[currentIndex].push({ type: type, value: val });

          break;
        case STATES.row:
          let len = fileObject.values[currentIndex].length;
          let value = fileObject.values[currentIndex][len - 1].value;

          let decision = getRowDecision(current, second, third);

          if (decision === markers.rowEnd) {
            i += markers.rowEnd.length - 1;
            state = STATES.value;
            rowIndex = 0;
          } else if (decision === markers.rowDelimiter) {
            rowIndex++;
            value.push("");
          } else if (decision === markers.text) {
            if (value.length <= rowIndex) {
              value.push(String(current));
            } else {
              value[rowIndex] += String(current);
            }
          }

          break;
        case STATES.block:
          if (current !== "\r" && current !== "\n") {
            let len = fileObject.values[currentIndex].length;

            fileObject.values[currentIndex][len - 1].value = {
              caption: undefined,
              code: undefined,
            };

            if (isCaptionMarker(current, second)) {
              state = STATES.caption;
            } else {
              state = STATES.code;
            }
          }

          break;
        case STATES.caption:
          if (current === markers.captionEnd) {
            state = STATES.code;
          } else {
            let len = fileObject.values[currentIndex].length;
            let value = fileObject.values[currentIndex][len - 1].value;

            if (value.caption === undefined) {
              value.caption = String(current === "@" ? "" : current);
            } else {
              value.caption += String(current);
            }

            fileObject.values[currentIndex][len - 1].value = value;
          }

          break;
        case STATES.code:
          if (isCodeEnd(current, second, third)) {
            i += markers.codeEnd.length - 1;
            state = STATES.value;
          } else {
            let len = fileObject.values[currentIndex].length;
            let { code } = fileObject.values[currentIndex][len - 1].value;

            if (code === undefined) {
              code = String(current);
            } else {
              code += String(current);
            }

            fileObject.values[currentIndex][len - 1].value.code = code;
          }

          break;
        default:
          console.error("> Error: reached an invalid state in parse");
      }
    }

    // console.log("> fileObject: \n", JSON.stringify(fileObject));

    let status;

    if (state === STATES.start_end) {
      console.log("> Tokenized successfully ...");

      status = statuses.SUCCESS;
    } else {
      let errorMessage = endErrorMessages[state];

      console.log("> Error: Did not terminate Tokenization in terminal state.");
      if (errorMessage !== undefined) {
        console.log(`> ${errorMessage}`);
      }

      status = statuses.FAILURE;
    }

    return {
      status: status,
      fileTree: fileObject,
    };
  }

  function removeEscapesInKey(key) {
    while (key.includes("\n") || key.includes("\r")) {
      key = key.replace("\n", "");
      key = key.replace("\r", "");
    }

    return key;
  }

  function getKeyValueString(key, value) {
    // TODO
    let data = "";
    key = removeEscapesInKey(key);

    data += `## ${key}\n`;

    value.forEach((element, i, arr) => {
      switch (element.type) {
        case valuesKeys.text:
          data += `\n${element.value.trim()}\n\n`;
          break;
        case valuesKeys.table:
          let values = element.value;
          values.forEach((elem) => {
            data += `| ${elem.trim()} `;
          });
          data += `|\n`;
          break;
        case valuesKeys.code:
          let val = element.value;
          data += `### ${val.caption.trim()}\n\n`;
          data += `${MAGIC.threeBackticks}\n${val.code.trim()}\n${
            MAGIC.threeBackticks
          }\n`;
          break;
      }
    });

    return data;
  }

  function writeToFile(file, data) {
    fs.writeFile(file, data, (err) => {
      if (err) {
        console.error(`> ${err}`);
        return false;
      }
    });
  }

  function writeObject(file, tree) {
    let data = "";
    let { keys, values } = tree;

    keys.forEach((key, index) => {
      let value = values[index];
      key = removeEscapesInKey(key);

      if (key.toUpperCase() === MAGIC.name) {
        data += `# ${removeEscapesInKey(value[0].value)}\n\n`;
      } else if (key.toUpperCase() === MAGIC.properties) {
        let index = value.findIndex(
          (elem) => elem["type"] === valuesKeys.table
        );

        let temp = { type: valuesKeys.table };

        value.splice(index, 0, { ...temp, value: propertiesTableHeader[0] });
        value.splice(index + 1, 0, {
          ...temp,
          value: propertiesTableHeader[1],
        });

        data += getKeyValueString(key, value);
      } else {
        data += getKeyValueString(key, value);
      }

      writeToFile(file, data);
    });
  }

  function main() {
    console.log();

    if (parseArgs()) {
      let block = getCommentBlock(inFile);

      if (block !== undefined) {
        console.log(`> tokenizing ${inFile}...`);
        let { status, fileTree } = tokenize(block.trim());

        if (status === statuses.SUCCESS) {
          console.log(`> writing to ${outFile}...`);
          // write to markdown
          writeObject(outFile, fileTree);

          console.log(`> write complete.`);
        }
      } else {
        console.error(`> Error: no comment block found in ${inFile}.`);
      }
    } else {
      console.log("> No Arguments provided. Format: infile outfile");
    }

    console.log();
  }

  // Begin execution
  main();
}
