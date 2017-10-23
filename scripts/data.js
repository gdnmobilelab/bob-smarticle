var fs = require('fs-extra');
var gsjson = require('google-spreadsheet-to-json');
var deasync = require('deasync');
var Entities = require('html-entities').AllHtmlEntities;

var keys = require('../keys.json');

var isDone = false,
    data;

function getFurniture(furniture) {
    var organisedFurniture = {}

    for (var i in furniture) {
        organisedFurniture[furniture[i].option] = furniture[i].value;
    }

    return organisedFurniture;
}

function createTimeStamps(atoms) {
    for (var i in atoms) {
        var date = atoms[i].date.split('/');
        atoms[i].timeStamp = new Date(date[1] + '/' + date[0] + '/' + date[2] + ' ' + atoms[i].time);
    }

    return atoms;
}

function getLastUpdated(atoms) {
    var lastUpdated = atoms[0].timeStamp;

    for (var i in atoms) {
        if (atoms[i].timeStamp > lastUpdated) {
            lastUpdated = atoms[i].timeStamp;
        }
    }

    return lastUpdated;
}

function returnDynamicCharacterHtml(i, character, isEndOfSentence) {
    return '<span class=\'character character--' + i + '\'><span class=\'character__short\'>' + character.shortName + '</span><span class=\'character__long\'>' + character.longName + '</span></span>';
}

function addDynamicCharacters(atoms, characters) {
    for (var i in characters) {
        var characterPattern = new RegExp('character.' + characters[i].id , 'g');

        var hasSubClause = characters[i].longName.indexOf(',') !== -1 ? true : false;

        for (var atom in atoms) {
            if (!hasSubClause && atoms[atom].copy) {
                atoms[atom].copy = atoms[atom].copy.replace(characterPattern, returnDynamicCharacterHtml(i, characters[i], false));
            } else {
                while((match = characterPattern.exec(atoms[atom].copy))) {
                    var start = match.index;
                    var end = characterPattern.lastIndex;
                    var endOfSentence = atoms[atom].copy.substring(end, end + 2).match(/[\,\.]/) ? true : false;

                    atoms[atom].copy = atoms[atom].copy.substring(0, start) + returnDynamicCharacterHtml(i, characters[i], endOfSentence) + atoms[atom].copy.substring(end, atoms[atom].copy.length);
                }
            }
        }
    }

    return atoms;
}

function orderByGroup(atoms) {
    // put all atoms into objects
    var groupedAtoms = {};
    var nonGroupedKey = 0;

    for (var i in atoms) {
        var groupName = atoms[i].group;

        if (atoms[i].group) {
            if (groupedAtoms[groupName]) {
                groupedAtoms[groupName].atoms[Object.keys(groupedAtoms[groupName].atoms).length + 1] = atoms[i];
            } else {
                groupedAtoms[groupName] = {
                    groupName: groupName,
                    groupType: atoms[i].groupType,
                    isFaq: atoms[i].isFaq,
                    atoms: {
                        0: atoms[i]
                    }
                };
            }
        } else {
            groupedAtoms['group' + nonGroupedKey] = {
                isFaq: atoms[i].isFaq,
                atoms: {
                    0: atoms[i]
                }
            };
            nonGroupedKey++;
        }
    }

    return groupedAtoms;
}

function cleanCopy(atoms) {
    var entities = new Entities();

    for (var i in atoms) {
        atoms[i].title = entities.encode(atoms[i].title);
        atoms[i].copy = entities.encode(atoms[i].copy);
        if (atoms[i].quoteByline) {
            atoms[i].quoteByline = entities.encode(atoms[i].quoteByline);
        }
    }

    return atoms;
}

function showWeighting(atoms) {
    if (data.furniture.showWeighting) {
        for (var i in atoms) {
            atoms[i].showWeighting = true;
        }
    }

    return atoms;
}

function fetchData(id, callback) {
    gsjson({
        spreadsheetId: id,
        allWorksheets: true,
        credentials: keys
    })
    .then(function(result) {
        callback(result);
    })
    .then(function(err) {
        if (err) {
            console.log(err);
        }
    });
}

module.exports = function(id) {
    // TODO: look at old data

    // fetch data
    fetchData(id, function(spreadsheet) {
        // data structure
        data = {
            groups: spreadsheet[0],
            furniture: getFurniture(spreadsheet[1]),
            characters: spreadsheet[2],
            lastUpdated: new Date()
        }

        // manipulate and clean data
        data.groups = createTimeStamps(data.groups);
        data.lastUpdated = getLastUpdated(data.groups);
        data.groups = cleanCopy(data.groups);
        data.groups = addDynamicCharacters(data.groups, data.characters);
        data.groups = showWeighting(data.groups);
        data.groups = orderByGroup(data.groups);

        isDone = true;
    });

    deasync.loopWhile(function() {
        return !isDone;
    });

    return data;
};
