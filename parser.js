"use strict";

const fs = require("fs");
const babelParser = require("@babel/parser");

const headerEndMarker = "\\\\";

let inputFile = "";
let outputFile = "OUTPUT.MD";

const rowOpenDelimiter = "#--";
const rowCloseDelimiter = "--#";

const codeOpenDelimiter = "$--";
const codeCloseDelimiter = "--$";

const codeCaptionDelimiter = ";";

const propsTableHeader = `| Property | Default Value | Type | Supported Values | Description |\n| --- | --- | --- | --- | --- |\n`;

{
  function canParse(stringValue) {
    // TODO
    return true;
  }

  function parseAtom(atom) {
    let retVal = "";

    for (let i = 0; i < atom.length; i++) {
      if (Array.isArray(atom[i])) {
        for (let j = 0; j < atom[i].length; j++) {
          retVal += `| ${atom[i][j]} `;
        }
        retVal += "|\n";
      } else if (typeof atom[i] === "object") {
        let key = Object.keys(atom[i])[0];
        let value = atom[i][key];

        retVal += `### ${key}\n\`\`\`axml\n${value}\n\`\`\`\n`;
      } else {
        retVal += atom[i] + "\n";
      }
    }

    return retVal;
  }

  function makeAtomArray(atom) {
    let retVal = [];

    if (atom.includes(rowOpenDelimiter)) {
      // is row type
      let firstBreakIndex = atom.indexOf(rowOpenDelimiter);

      let prefix = atom.substring(0, firstBreakIndex);
      if (prefix.trim() !== "") {
        retVal.push(prefix);
      }

      let workingString = atom.substring(firstBreakIndex);
      let atoms = workingString.split(rowCloseDelimiter);

      for (let i = 0; i < atoms.length; i++) {
        let worker = atoms[i].trim();

        if (worker !== "") {
          if (worker.startsWith(",")) {
            worker = worker.substring(1);
          }

          worker = worker.split(rowOpenDelimiter).join("").trim();
          let elems = worker.split(", ");

          retVal.push(elems);
        }
      }
    } else if (atom.includes(codeOpenDelimiter)) {
      // is code block type
      let firstBreakIndex = atom.indexOf(codeOpenDelimiter);

      let prefix = atom.substring(0, firstBreakIndex);
      if (prefix.trim() !== "") {
        retVal.push(prefix + "\n");
      }

      let workingString = atom.substring(firstBreakIndex);
      let atoms = workingString.split(codeCloseDelimiter);

      for (let i = 0; i < atoms.length; i++) {
        let worker = atoms[i].trim();

        if (worker !== "") {
          if (worker.startsWith(codeCaptionDelimiter)) {
            worker = worker.substring(1);
          }

          worker = worker.split(codeOpenDelimiter).join("").trim();
          let elems = worker.split(codeCaptionDelimiter);

          let obj = {};

          if (elems.length === 2) {
            obj[elems[0]] = elems[1].trim();
          }

          retVal.push(obj);
        }
      }
    } else {
      // is plain text type
      retVal.push(atom);
    }

    return retVal;
  }

  function splitLinesExceptForCodeBlocks(str) {
    let retVal = [];
    let lines = str.split("\r\n");
    let code = false;

    for (let i = 0; i < lines.length; i++) {
      let val = lines[i];

      if (val.startsWith(codeOpenDelimiter)) code = true;
      else if (val.endsWith(codeCloseDelimiter)) code = false;

      if (code) {
        retVal.push(val + "\r\n");
      } else {
        retVal.push(val);
      }
    }

    return retVal.join("");
  }

  function parse(stringValue) {
    let domObject = {};
    stringValue = splitLinesExceptForCodeBlocks(stringValue);

    stringValue = stringValue.split(headerEndMarker);
    for (let i = 0; i < stringValue.length; i++) {
      stringValue[i] = stringValue[i].trim();
      let splitElem = stringValue[i].split(":");

      if (splitElem.length === 2) {
        let key = splitElem[0];
        let value = splitElem[1];

        let atomized = makeAtomArray(value);
        domObject[key] = parseAtom(atomized);
      }
    }

    return domObject;
  }

  // MAGIC STRINGS
  function domToMarkDown(dom) {
    let markdown = "";

    for (const key in dom) {
      let value = dom[key];
      if (key.toUpperCase() === "NAME") {
        markdown += `# ${value}\n`;
      } else if (key.toUpperCase() === "PROPERTIES") {
        markdown += `## ${key}\n\n`;
        markdown += propsTableHeader;
        markdown += `${value}\n`;
      } else {
        markdown += `## ${key}\n\n${value}\n`;
      }
    }

    return markdown;
  }

  function generateMD_File(markdown, file) {
    fs.writeFile(file, markdown, (err) => {
      if (err) {
        console.error(err);
        return false;
      }
    });

    return true;
  }

  function attemptParse(file) {
    const fileContent = fs.readFileSync(file).toString();
    const { comments } = babelParser.parse(fileContent);

    if (comments.length >= 1) {
      let { value } = comments.find((elem) => elem["type"] === "CommentBlock");

      if (value !== undefined) {
        if (canParse(value)) {
          console.log(`Opening ${inputFile}...`);
          let dom = parse(value);

          if (generateMD_File(domToMarkDown(dom), outputFile)) {
            console.log(`Documentation successfully written to ${file} in Markdown format.`);
          } else {
            console.log(`Some sort of error occurred. Please try again later.`);
          }
        }
      }
    }
  }

  function getArgs() {
    const args = process.argv.slice(2);

    if (args.length > 0) {
      inputFile = args[0];
    }
    if (args.length === 2) {
      outputFile = args[1];
    }
  }

  // execution begins here
  getArgs();
  if (inputFile !== "") {
    attemptParse(inputFile);
  }
}
