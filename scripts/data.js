var fs = require('fs-extra');
var gsjson = require('google-spreadsheet-to-json');
var deasync = require('deasync');
var Entities = require('html-entities').AllHtmlEntities;

var validate = require('../scripts/validate.js');

var keys = require('../keys.json');

var isDebug = true;
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

function calculateTimeUntilRead(atoms) {
    for (var i in atoms) {
        atoms[i].timeUntilRead = evaluate(atoms[i]);

        function evaluate(atom) {
            switch (atom.type) {
                case 'text':
                    return atom.copy.length * 10 / 2;
                    break;

                case 'quote':
                    return 500;
                    break;

                case 'tweet':
                    return 500;
                    break;

                case 'graphic':
                    return 500;
                    break;

                case 'image':
                    return 500;
                    break;

                case 'video':
                    return 1500;
                    break;
            }
        }
    }

    return atoms;
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

function findGroup(groups, groupName) {
    for (var i in groups) {
        if (groupName === groups[i].groupName) {
            return i;
        }
    }

    return false;
}

function orderByGroup(atoms) {
    // put all atoms into objects
    var groupedAtoms = {};
    var nonGroupedKey = 0;

    var groupCount = 0;

    for (var i in atoms) {
        var groupName = atoms[i].group;

        if (atoms[i].group) {
            groupNumber = findGroup(groupedAtoms, groupName);
            if (groupNumber) {
                groupedAtoms[groupNumber].atoms[Object.keys(groupedAtoms[groupNumber].atoms).length] = atoms[i];
            } else {
                groupedAtoms[groupCount] = {
                    groupName: groupName,
                    groupType: atoms[i].groupType,
                    isFaq: atoms[i].isFaq,
                    atoms: {
                        0: atoms[i]
                    }
                };

                groupCount++;
            }
        } else {
            groupedAtoms[groupCount] = {
                isFaq: atoms[i].isFaq,
                atoms: {
                    0: atoms[i]
                }
            };
            groupCount++;
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

function highestWeighting(groups) {
    for (var i in groups) {
        var highestWeighting = 4;

        for (var atom in groups[i].atoms) {
            if (groups[i].atoms[atom].weighting < highestWeighting) {
                highestWeighting = groups[i].atoms[atom].weighting;
            }
        }

        groups[i].highestWeighting = highestWeighting;
    }

    return groups;
}

function fetchData(id, callback) {
    gsjson({
        spreadsheetId: id,
        allWorksheets: true,
        credentials: keys
    })
    .then(function(result) {
        callback(result, id);
    })
    .then(function(err) {
        if (err) {
            console.log(err);
        }
    });
}

function updateOldData(data, id) {
    data.lastFetched = new Date();

    if (!fs.existsSync('./.data')) {
        fs.mkdirSync('./.data');
    }

    if (!fs.existsSync('./.data/smarticles')) {
        fs.mkdirSync('./.data/smarticles');
    }

    fs.writeJsonSync('./.data/smarticles/' + id + '.json', data);
}

fetchData(process.argv.slice(2)[0], function(spreadsheet, id) {
    console.log('Fetching data...');

    // data structure
    data = {
        groups: spreadsheet[0],
        furniture: getFurniture(spreadsheet[1]),
        characters: spreadsheet[2],
        lastUpdated: new Date(),
        id: id
    }

    data = validate(data);

    // manipulate and clean data
    data.groups = createTimeStamps(data.groups);
    data.groups = calculateTimeUntilRead(data.groups);
    data.lastUpdated = getLastUpdated(data.groups);
    data.groups = cleanCopy(data.groups);
    data.groups = addDynamicCharacters(data.groups, data.characters);
    data.groups = showWeighting(data.groups);
    data.groups = orderByGroup(data.groups);
    data.groups = highestWeighting(data.groups);

    updateOldData(data, id);

    isDone = true;

    console.log('Updated ' + data.furniture.title);

    deasync.loopWhile(function() {
        return !isDone;
    });

    return data;
});
