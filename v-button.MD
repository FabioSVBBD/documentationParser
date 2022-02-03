# ```v-button```

## Description

```v-button``` is a wrapper component around a ```button```.```v-button``` applies the Vodapay styling to a button for ease of use.

## Properties

| Property | Default Value | Type | Supported Values | Description |
| --- | --- | --- | --- | --- |
| ```size``` | ```Large``` | ```string``` | ```Small``` ```Large``` | Size of Button |
| ```type``` | ```Primary``` | ```string``` | ```Primary``` ```PrimaryWhite``` ```Secondary``` ```TextOnly``` ```Warning``` | Type of Button |
| ```disabled``` | ```false``` | ```boolean``` | ```true``` ```false``` | If button is disabled the button cannot be tapped |

## Children

All Child Components passed into ```v-button``` will be slotted into the v-button text area. If images are passed in, no automatic sizing is performed.

