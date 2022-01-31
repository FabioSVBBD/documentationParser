# Documentation Parser

## Description
The Documentation parser is built to parse the first comment block of a ```javascript``` file in a specific way, and parses the comments into a markdown file. This project should really be called Comments Parser. \
The Parser takes in key value pairs and outputs the information into a MD file depending on the content.

### Required Keys
* Name
* Description

All other keys are not required.

### Acceptable Values
* Plain text
* Table Information
* Code blocks

A mixture of the above atomic values is also an acceptable Value.

## Format
Format for The Parser can be viewed in example.js
* The code block you want to be parsed should be the first code block in the file.
* Code block has to begin with /* and end with */
* General form is
    * key: value \\\\
    * value can contain text, tabular or a code block
    * each row in a table should begin with #-- and end with --# (Subject to change)
    * When entering tabular information a heading and table line should be entered manually unless this table is the value of the ```Properties``` key.
    * code blocks begin with \$-- and end with --\$.
    * code blocks can optionally have a caption before the code, but line must end with a semi-colon (;).

## Running
After cloning, run ```npm i```, then to run the parser
* ```node parser.js inputFileName outputFileName```

## Example
You can run the below command in this directory
```node parser.js example.js example.MD```

### An Example comment block:
```
/*
Name:
component-name \\

Description:
description here \\

Properties:
#-- propName,  defaultValue, type, legalValues, description --#
#-- propName,  defaultValue, type, legalValues, description --#
\\

Examples:
optional text
$--
caption here;
<code block />
--$
$--
caption here;
<code block />
--$
\\

Generic Header:
children
\\

*/
```
