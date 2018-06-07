module.exports = {
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaVersion": 7
    },
    "extends": "eslint:recommended",
    "env": {
        "browser": true
    },
    "rules": {
        "indent": ["error", 4, { "SwitchCase": 1 }],
        "no-console": 0,
        "semi": ["error", "always"]
    }
};
