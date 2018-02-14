function calculateReintroductionParams(params) {
    var today = params.today ? new Date(params.today) : new Date()
    var msSinceVisit = today - new Date(params.lastVisited);
    params.timeSinceVisit = parseInt((msSinceVisit/(1000*60*60)));

    var allowedWeightings = [];
    var cap = 0;

    if (params.timeSinceVisit >= 24) {
        allowedWeightings.push(2);
        cap = 2;
    }

    if (params.timeSinceVisit >= 36) {
        allowedWeightings.push(3);
        cap = 3;
    }

    if (params.timeSinceVisit >= 144) {
        allowedWeightings.push(1);
        cap = 4;
    }

    params.reintroductionCap = cap;
    params.allowedWeightings = allowedWeightings;

    return params;
}

function removeUnseenAtoms(groups, params) {
    for (var i in groups) {
        if (groups[i].timeInView < 1) {
            delete groups[i];
        }
    }

    return params;
}

function removeLowWeightingAtoms(groups, params) {
    for (var i in groups) {
        if (!params.allowedWeightings.includes(groups[i].highestWeighting)) {
            delete groups[i];
        }
    }

    return groups;
}

function addSeenDataToGroups(groups, params) {
    for (var i in groups) {
        for (var a in groups[i].atoms) {
            var atomId = groups[i].atoms[a].id;

            for (var s in params.seen) {
                if (params.seen[s].id == atomId) {
                    var seen = params.seen[s];
                }
            }

            if (seen) {
                if (!groups[i].minSeen && !groups[i].minTimeInView) {
                    groups[i].minSeen = seen.seen;
                    groups[i].minTimeInView = seen.timeInView
                } else {
                    groups[i].minSeen = groups[i].minSeen > seen.seen ? seen.seen : groups[i].minSeen;
                    groups[i].minTimeInView = groups[i].minTimeInView > seen.timeInView ? seen.timeInView : groups[i].minTimeInView
                }
            }
        }
    }
    return groups;
}

function removeHighlySeenGroups(groups, params) {
    for (var i in groups) {
        if (groups[i].minSeen > 1 && groups[i].minTimeInView > 1500) {
            delete groups[i];
        }
    }

    return groups;
}

function rateGroups(groups, params) {
    for (var i in groups) {
        var rating = 0;
            rating += -(groups[i].minTimeInView / 1000);
            rating += Math.min(Math.max(rating, -5), 0);
            rating += params.timeSinceVisit > 144 && groups[i].highestWeighting == 1 ? 3 : 0;
            rating += groups[i].highestWeighting == 2 ? 1 : 0;

        groups[i].rating = rating;
    }

    return groups;
}

function capGroups(groups, params) {
    var orderedGroups = Object.keys(groups).sort( function(keyA, keyB) {
        return groups[keyB].rating - groups[keyA].rating || parseInt(keyA) - parseInt(keyB);
    });

    orderedGroupsToBeRemoved = orderedGroups.splice(params.reintroductionCap, orderedGroups.length);

    for (var i in groups) {
        if (orderedGroupsToBeRemoved.includes(i)) {
            delete groups[i];
        }
    }

    return groups;
}

function collapseGroups(groups) {
    for (var i in groups) {
        if (Object.keys(groups[i].atoms).length >= 2) {
            groups[i].groupType = 'collapsed';
        }
    }

    return groups;
}

function addReintroducedTag(groups) {
    for (var i in groups) {
        groups[i].isReintroduced = true;
    }

    return groups;
}

module.exports = function(data, params) {
    if (params.visit !== 1) {
        params = calculateReintroductionParams(params);
        data.params = params;
        data.removedGroups = removeUnseenAtoms(data.removedGroups, params);
        data.removedGroups = removeLowWeightingAtoms(data.removedGroups, params);
        data.removedGroups = addSeenDataToGroups(data.removedGroups, params);
        data.removedGroups = removeHighlySeenGroups(data.removedGroups, params);
        data.removedGroups = rateGroups(data.removedGroups, params);
        data.removedGroups = capGroups(data.removedGroups, params);
        data.removedGroups = collapseGroups(data.removedGroups);
        data.removedGroups = addReintroducedTag(data.removedGroups);

        for (var i in data.removedGroups) {
            data.groups[i] = data.removedGroups[i];
        }
    }

    delete data.removedGroups;
    return data;
};
