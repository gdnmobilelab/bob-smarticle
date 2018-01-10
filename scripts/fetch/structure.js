function getFurniture(furniture) {
    var organisedFurniture = {}

    for (var i in furniture) {
        organisedFurniture[furniture[i].option] = furniture[i].value;
    }

    return organisedFurniture;
}

module.exports = function(spreadsheet, id) {
    return data = {
        groups: spreadsheet[0],
        furniture: getFurniture(spreadsheet[1]),
        characters: spreadsheet[2],
        id: id,
        lastUpdated: new Date()
    }
};
