module.exports = {
	"env": {
		"browser": true,
		"es6": true,
		"node": true
	},
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended"
	],
	"globals": {
		"Atomics": "readonly",
		"SharedArrayBuffer": "readonly"
	},
	"parser":"@typescript-eslint/parser",
	"parserOptions": {
		"ecmaFeatures": {
			"jsx": true
		},
		"ecmaVersion": 2018,
		"sourceType": "module"
	},
	"plugins": [
		"react",
		"@typescript-eslint"
	],
	"rules": {
		"indent": [
			"warn",
			4,
			{"SwitchCase":1}
		],
		"linebreak-style": [
			"warn",
			"unix"
		],
		"quotes": [
			"warn",
			"double"
		],
		"semi": [
			"warn",
			"never"
		],
		"@typescript-eslint/no-explicit-any": [
			"off"
		],
		"@typescript-eslint/explicit-function-return-type": [
			"off"
		]
	}
}