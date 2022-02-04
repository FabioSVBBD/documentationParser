const {
  valuesKeys,
  propertiesTableHeader,
  MAGIC,
} = require("./constants");

const fs = require("fs");

function removeEscapesInKey(key) {
  while (key.includes("\n") || key.includes("\r")) {
    key = key.replace("\n", "");
    key = key.replace("\r", "");
  }

  return key;
}

function getKeyValueString(key, value) {
  let data = "";

  key = removeEscapesInKey(key);

  data += `## ${key}\n`;

  value.forEach((element) => {
    switch (element.type) {
      case valuesKeys.text:
        data += `\n${element.value.trim()}\n\n`;
        break;
      case valuesKeys.table:
        element.value.forEach((elem) => {
          data += `| ${elem.trim()} `;
        });
        data += "|\n";
        break;
      case valuesKeys.code:
        data += `### ${element.value.caption.trim()}\n\n`;
        data += `${MAGIC.threeBackticks}\n${element.value.code.trim()}\n${
          MAGIC.threeBackticks
        }\n`;
        break;
      default:
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

  const { keys, values } = tree;

  keys.forEach((key, index) => {
    const value = values[index];

    key = removeEscapesInKey(key);

    if (key.toUpperCase() === MAGIC.name) {
      data += `# ${removeEscapesInKey(value[0].value)}\n\n`;
    } else if (key.toUpperCase() === MAGIC.properties) {
      const idx = value.findIndex((elem) => elem.type === valuesKeys.table);

      const temp = { type: valuesKeys.table };

      value.splice(idx, 0, { ...temp, value: propertiesTableHeader[0] });
      value.splice(idx + 1, 0, {
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

module.exports = {
  writeObject,
};
