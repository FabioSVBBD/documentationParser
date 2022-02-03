const { markAsUntransferable } = require("worker_threads");

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

  //["text", "table", "code", "break"];
  const valuesKeys = {
    text: "text",
    table: "table",
    code: "code",
    break: "break",
  };

  const MAGIC = {
    commentBlock: "CommentBlock",
    newline: "\r\n",
  };

  let inFile, outFile;

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
    if (first + second === markers.end) return valuesKeys.break; //
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

  function parse(commentBlock) {
    let state = STATES.start_end;
    let fileObject = {
      keys: [],
      values: [],
    };
    let currentIndex = 0;
    let rowIndex = 0;
    // let valuesInnerIndex = -1;

    console.log("block:", commentBlock);

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
          if (current === "\r" || current == "\n") break;

          if (fileObject.values.length <= currentIndex) {
            fileObject.values.push([]);
            // valuesInnerIndex = 0;
          }

          let type = getValueType(current, second, third);

          // Case 1: go to STATE start_end
          if (type === valuesKeys.break) {
            i += markers.end.length - 1;
            state = STATES.start_end;
            currentIndex++;

            break;
          }

          // Case 2: reading text
          if (type === valuesKeys.text) {
            if (fileObject.values[currentIndex].length === 0) {
              fileObject.values[currentIndex].push({ type: type, value: "" });
            } else {
              let len = fileObject.values[currentIndex].length;

              if (type !== fileObject.values[currentIndex][len - 1]["type"]) {
                fileObject.values[currentIndex].push({ type: type, value: "" });
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

          fileObject.values[currentIndex][len - 1].value = value;

          break;
        case STATES.block:
          if (current !== "\r" && current !== "\n") {
            let len2 = fileObject.values[currentIndex].length;

            fileObject.values[currentIndex][len2 - 1].value = {
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
              value.caption = String(current);
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

            // console.log("value", value);

            if (code === undefined) {
              code = String(current);
            } else {
              code += String(current);
            }

            fileObject.values[currentIndex][len - 1].value.code = code;

            console.log("fileObj", fileObject.values[currentIndex][len - 1]['value']);
          }

          break;
        default:
          console.error("Error: reached an invalid state in parse");
      }
    }

    console.log("fileObject: ", JSON.stringify(fileObject));
    // console.log("code object", JSON.stringify(fileObject.values[3][3].value));

    if (state === STATES.start_end) {
      console.log("successful parse");
    } else {
      console.log("Error: Did not terminate parse in acceptable state");
    }
  }

  // Begin execution
  if (parseArgs()) {
    console.log(`input: ${inFile}, output: ${outFile}`);
    let block = getCommentBlock(inFile);

    if (block !== undefined) {
      parse(block.trim());
    } else {
      console.error(`Error: no comment block found in ${inFile}.`);
    }
  }
}
