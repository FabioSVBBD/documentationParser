const fs = require("fs");
const babelParser = require("@babel/parser");

const {
  colors,
  endErrorMessages,
  statuses,
  STATES,
  MAGIC,
} = require("./constants");

const {
  handleStartEndState,
  handleKeyState,
  handleValueState,
  handleRowState,
  handleBlockState,
  handleCaptionState,
  handleCodeState,
} = require("./state-handlers");

const { writeObject } = require("./write-functions");

let inFile = "";
let outFile = "output.MD";

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0) return false;

  inFile = args[0];

  if (args.length === 2) {
    outFile = args[1];
  } else {
    outFile = inFile.replace('.js', '.MD');
  }

  return true;
}

function getCommentBlock(fileName) {
  try {
    const fileContent = fs.readFileSync(fileName).toString();
    const { comments } = babelParser.parse(fileContent);

    if (comments.length >= 1) {
      const { value } = comments.find(
        (elem) => elem.type === MAGIC.commentBlock
      );
      return value;
    }
  } catch (error) {
    console.log(`${colors.FgRed}> Error reading ${fileName}: ${error.message}`);
  }
}

function tokenize(commentBlock) {
  const fullState = {
    state: STATES.start_end,
    fileObject: { keys: [], values: [] },
    currentIndex: 0,
    rowIndex: 0,
  };

  for (let i = 0; i < commentBlock.length; i++) {
    const current = commentBlock[i];
    const second = commentBlock[i + 1];
    const third = commentBlock[i + 2];

    if (fullState.state === STATES.start_end) {
      handleStartEndState(fullState, current);
    } else if (fullState.state === STATES.key) {
      handleKeyState(fullState, current);
    } else if (fullState.state === STATES.value) {
      i = handleValueState(fullState, current, second, third, i);
    } else if (fullState.state === STATES.row) {
      i = handleRowState(fullState, current, second, third, i);
    } else if (fullState.state === STATES.block) {
      handleBlockState(fullState, current, second);
    } else if (fullState.state === STATES.caption) {
      handleCaptionState(fullState, current);
    } else if (fullState.state === STATES.code) {
      i = handleCodeState(fullState, current, second, third, i);
    } else {
      console.error(
        `${colors.FgRed}> Error: reached an invalid state in parse.${colors.FgWhite}`
      );
    }

    // console.log("index", i, fullState.state);
  }

  let status;

  if (fullState.state === STATES.start_end) {
    status = statuses.SUCCESS;
  } else {
    const errorMessage = endErrorMessages[fullState.state];

    console.log(
      `${colors.FgRed}> Error: Did not terminate Tokenization in terminal state.${colors.FgWhite}`
    );

    if (errorMessage !== undefined) {
      console.log(`> ${errorMessage}`);
    }

    status = statuses.FAILURE;
  }

  return {
    status: status,
    fileTree: fullState.fileObject,
  };
}

function driver() {
  const block = getCommentBlock(inFile);

  if (block !== undefined) {
    const { status, fileTree } = tokenize(block.trim());

    if (status === statuses.SUCCESS) {
      console.log(
        `${colors.FgGreen}> tokenized ${inFile} successfully ...${colors.FgWhite}`
      );
      writeObject(outFile, fileTree);

      console.log(
        `${colors.FgGreen}> write to ${outFile} complete.${colors.FgWhite}`
      );
    }
  } else {
    console.error(
      `${colors.FgRed}> Error: no comment block found in ${inFile}.${colors.FgWhite}`
    );
  }
}

function beginParser(fileName) {
  console.log();

  inFile = fileName;
  outFile = fileName.replace(".js", ".MD");

  driver();

  console.log();
}

function main() {
  console.log();

  if (parseArgs()) {
    driver();
  } else {
    console.log(`${colors.FgRed}> No Arguments provided. Format: infile outfile${colors.FgRed}`);
  }

  console.log();
}

main();

module.exports = {
  beginParser,
  colors,
};
