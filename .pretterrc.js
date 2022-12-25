module.exports = {
    "prettier.arrowParens": "avoid",
    tabWidth: 4,
    importOrder: [
        "^config$",
        "^helpers$",
        "^components/.*$",
        "^data.*$",
        "^.*css$",
    ],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
};
