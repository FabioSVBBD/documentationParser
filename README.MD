# Documentation Parser

## Format
Format for The Parser can be viewed in example.js
* The code block you want to be parsed should be the first code block in the file.
* Code block has to be of the form /* ... */
* General form is
    * key: value \\\\
    * value can contain text, tabular or code information
    * each row in a table should begin and end with #-- ... , ... --#
    * if not the properties key, then heading and table line have to be manually input
    * code blocks begin and with \$-- \<code\> --\$.
    * code blocks can optionally have a caption before the code, but line must end with a semi-colon (;).

## Running
* ```node parser.js inputFileName outputFileName```

### Example
You can run the below command in this directory
```node parser.js example.js example.MD```

