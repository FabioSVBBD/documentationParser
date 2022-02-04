const {
  markers,
  valuesKeys,
  STATES,
} = require("./constants");

const {
  getValueType,
  getRowDecision,
  isCodeEnd,
  isCaptionMarker,
} = require("./character-checks");

function handleStartEndState(fullState, current) {
  fullState.fileObject.keys.push(current);
  fullState.state = STATES.key;
}

function handleKeyState(fullState, current) {
  if (current === markers.colon) {
    fullState.state = STATES.value;
  } else {
    let index = fullState.currentIndex;
    fullState.fileObject.keys[index] += current;
  }
}

// returns index [changed]
function handleValueState(fullState, current, second, third, index) {
  if (current === "\r" || current === "\n") return index;

  if (fullState.fileObject.values.length <= fullState.currentIndex) {
    fullState.fileObject.values.push([]);
  }

  const type = getValueType(current, second, third);

  // Case 1: end of value
  if (type === valuesKeys.break) {
    fullState.state = STATES.start_end;
    fullState.currentIndex++;

    index += markers.end.length - 1;
    return index;
  }

  // Case 2: reading textual value
  if ((type === valuesKeys.text)) {
    if (fullState.fileObject.values[fullState.currentIndex].length === 0) {
      fullState.fileObject.values[fullState.currentIndex].push({
        type: type,
        value: current,
      });
    } else {
      let length = fullState.fileObject.values[fullState.currentIndex].length;

      if (type !== fullState.fileObject.values[fullState.currentIndex][length - 1].type) {
        fullState.fileObject.values[fullState.currentIndex].push({
          type: type,
          value: "",
        });
        length = fullState.fileObject.values[fullState.currentIndex].length;
      }

      fullState.fileObject.values[fullState.currentIndex][length - 1].value +=
        current;
    }

    return index;
  }

  let value = undefined;

  // Case 3: reading table, and 4: reading code
  if (type === valuesKeys.table) {
    index += markers.rowBegin.length - 1;
    fullState.state = STATES.row;
    value = [];
  } else if (type === valuesKeys.code) {
    index += markers.codeBegin.length - 1;
    fullState.state = STATES.block;
    value = {};
  }

  fullState.fileObject.values[fullState.currentIndex].push({ type: type, value: value });
  return index;
}

// returns index
function handleRowState(fullState, current, second, third, index) {
  const length = fullState.fileObject.values[fullState.currentIndex].length;
  const value =
    fullState.fileObject.values[fullState.currentIndex][length - 1].value;
  const decision = getRowDecision(current, second, third);

  if (decision === markers.rowEnd) {
    fullState.state = STATES.value;
    fullState.rowIndex = 0;
    index += markers.rowEnd.length - 1;
  } else if (decision === markers.rowDelimiter) {
    fullState.rowIndex++;
    value.push("");
  } else if (decision === markers.text) {
    if (value.length <= fullState.rowIndex) {
      value.push(current);
    } else {
      value[fullState.rowIndex] += current;
    }
  }

  return index;
}

function handleBlockState(fullState, current, second) {
  if (current === "\r" || current === "\n") return;

  const length = fullState.fileObject.values[fullState.currentIndex].length;

  fullState.fileObject.values[fullState.currentIndex][length - 1].value = {
    caption: undefined,
    code: undefined,
  };

  isCaptionMarker(current, second)
    ? (fullState.state = STATES.caption)
    : (fullState.state = STATES.code);
}

function handleCaptionState(fullState, current) {
    if (current === markers.captionEnd) {
        fullState.state = STATES.code;
    } else {
        const length = fullState.fileObject.values[fullState.currentIndex].length;
        const value = fullState.fileObject.values[fullState.currentIndex][length - 1].value;

        if (value.caption === undefined) {
            value.caption = (current === '@' ? '' : current);
        } else {
            value.caption += current;
        }

        // fullState.fileObject.values[fullState.currentIndex][length - 1].value = value;
    }
}

// returns index
function handleCodeState(fullState, current, second, third, index) {
    if (isCodeEnd(current, second, third)) {
        index += markers.codeEnd.length - 1;
        fullState.state = STATES.value;
    } else {
        const length = fullState.fileObject.values[fullState.currentIndex].length;
        const value = fullState.fileObject.values[fullState.currentIndex][length - 1].value;

        if (value.code === undefined) {
            value.code = current;
        } else {
            value.code += current;
        }

        // fullState.fileObject.values[fullState.currentIndex][length - 1].value = value;
    }

    return index;
}

module.exports = {
  handleStartEndState,
  handleKeyState,
  handleValueState,
  handleRowState,
  handleBlockState,
  handleCaptionState,
  handleCodeState,
};
