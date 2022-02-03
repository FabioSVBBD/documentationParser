/*
Name:
```v-button``` \\

Description:
```v-button``` is a wrapper component around a ```button```.
```v-button``` applies the Vodapay styling to a button for ease of use. \\

Properties:
#-- ```size```, ```Large```, ```string```, ```Small``` ```Large```, Size of Button --#
#-- ```type```, ```Primary```, ```string```, ```Primary``` ```PrimaryWhite``` ```Secondary``` ```TextOnly``` ```Warning```, Type of Button --#
#-- ```disabled```, ```false```, ```boolean```, ```true``` ```false```, If button is disabled the button cannot be tapped --#

\\ 

Children:
All Child Components passed into ```v-button``` will be slotted into the v-button text area. 
If images are passed in, no automatic sizing is performed. 
\\
*/

import onTapMixin from "../mixins/onTapMixin/onTapMixin.js";

let sizes = {
  small: "Small",
  medium: "Medium",
  large: "Large",
}

let types = {
  primary: "Primary",
  primaryWhite: "PrimaryWhite",
  secondary: "Secondary",
  textOnly: "TextOnly",
  warning: "Warning"
}

let textClasses = {
  small: "text-large-30",
  medium: "heading-5",
  large: "heading-5",
}

Component({
  mixins: [
    onTapMixin
  ],
  data: {
    textClass: textClasses.large
  },
  props: {
    size: sizes.large,
    type: types.primary,
    disabled: false
  },
  didMount() {
    let { size } = this.props;
    let { textClass } = this.data;

    if (size === sizes.small) {
      textClass = textClasses.small;
    } else if (size === sizes.medium) {} // default, stays same

    this.setData({ textClass: textClass });
  }
});
