var Entities = require('html-entities').AllHtmlEntities;

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


function getFirstUpdated(atoms) {
    var firstUpdated = atoms[0].timeStamp;

    for (var i in atoms) {
        if (atoms[i].timeStamp < firstUpdated) {
            firstUpdated = atoms[i].timeStamp;
        }
    }

    return firstUpdated;
}

function calculateTimeUntilRead(atoms) {
    for (var i in atoms) {
        atoms[i].timeUntilRead = evaluate(atoms[i]);

        function evaluate(atom) {
            switch (atom.type) {
                case 'text':
                    var estimate = (atom.copy.length * 10) / 2;
                    return (estimate > 1250) ? 1250 : estimate;
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
                    return 750;
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

function getPreviewRelevantDate(data, preview) {
    var baseDate = new Date(data.lastUpdated - (60*60*24*7*1000));

    if (data.firstUpdated > baseDate) {
        baseDate = data.firstUpdated
    }

    var difference = baseDate - data.lastUpdated;

    return baseDate;
}

function getSeenAtoms(data, preview) {
    var seenArray = [];
    var date = getPreviewRelevantDate(data, preview);

    for (var i in data.groups) {
        if (data.groups[i].timeStamp < date) {
            seenArray.push({
                id: data.groups[i].id,
                date: date,
                seen: 1
            })
        }
    }

    return seenArray;
}

function generatePreviewData(data, i) {
    return {
        id: data.id,
        visit: i > 1 ? 2 : 1,
        seen: getSeenAtoms(data, i)
    }
}

function getPreviewData(data) {
    var preview = {};

    for (var i = 0; i < 4; i++) {
        preview[i] = generatePreviewData(data, i);
    }

    return preview;
}

module.exports = function(data) {
    data.groups = createTimeStamps(data.groups);
    data.groups = calculateTimeUntilRead(data.groups);
    data.lastUpdated = getLastUpdated(data.groups);
    data.firstUpdated = getFirstUpdated(data.groups);
    data.preview = getPreviewData(data);
    data.groups = cleanCopy(data.groups);
    data.groups = addDynamicCharacters(data.groups, data.characters);
    data.groups = showWeighting(data.groups);
    data.groups = orderByGroup(data.groups);
    data.groups = highestWeighting(data.groups);

    return data;
};
