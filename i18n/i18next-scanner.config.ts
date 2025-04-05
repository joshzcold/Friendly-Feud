module.exports = {
  input: [
    "./src/components/**/*.jsx",
    "./src/pages/**/*.jsx",
    // Use ! to filter out files or directories
    "!locales/**",
    "!**/node_modules/**",
  ],
  output: "./",
  options: {
    debug: false,
    func: {
      list: ["t"],
    },
    trans: false,
    plural: false,
    lngs: ["en", "es", "et", "id", "fr"],
    ns: ["translation"],
    defaultNs: "translation",
    defaultValue: "__STRING_NOT_TRANSLATED__",
    resource: {
      loadPath: "./public/locales/{{lng}}/{{ns}}.json",
      savePath: "./public/locales/{{lng}}/{{ns}}.json",
    },
    nsSeparator: false, // namespace separator
    keySeparator: false, // key separator
    interpolation: {
      prefix: "{{",
      suffix: "}}",
    },
  },
};
