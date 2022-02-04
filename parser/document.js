"use strict";

const fs = require("fs");
const { beginParser, colors } = require("./parse.js");

const componentsDirectory = "src/components";

const extensions = {
  axml: ".axml",
  acss: ".acss",
  js: ".js",
};

{
  try {
    console.log(
      `\n${colors.FgBlue}Searching for components to document ...${colors.FgWhite}\n`
    );
    const folders = fs.readdirSync(componentsDirectory);

    folders.forEach((folder) => {
      if (fs.lstatSync(`${componentsDirectory}/${folder}`).isDirectory()) {
        const files = fs.readdirSync(`${componentsDirectory}/${folder}`);
        let axml = false,
          acss = false,
          js = false;

        files.forEach((file) => {
          if (file.replace(extensions.axml, "") === folder) {
            axml = true;
          } else if (file.replace(extensions.acss, "") === folder) {
            acss = true;
          } else if (file.replace(extensions.js, "") === folder) {
            js = true;
          }
        });

        if (axml && acss && js) {
          console.log(
            `$ Found Component ${colors.FgMagenta}${folder}${colors.FgWhite}.`
          );
          console.log(
            `$ Attemping parse on ${componentsDirectory}/${folder}/${folder}.js...`
          );

          beginParser(`${componentsDirectory}/${folder}/${folder}.js`);
        }
      }
    });

    console.log(
      `${colors.FgBlue}Components documentation Complete.${colors.FgWhite}\n`
    );
  } catch (error) {
    console.error(`$ Error: ${error}`);
  }
}

module.exports = {
  colors,
};
