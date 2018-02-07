function calculateReintroductionParams(params) {
    var today = params.today ? new Date(params.today) : new Date()
    var msSinceVisit = today - new Date(params.lastVisited);
    params.timeSinceVisit = parseInt((msSinceVisit/(1000*60*60)));

    var allowedWeightings = [];
    var cap = 0;

    if (params.timeSinceVisit > 24) {
        allowedWeightings.push(2);
        cap = 2;
    }

    if (params.timeSinceVisit > 36) {
        allowedWeightings.push(3);
        cap = 3;
    }

    if (params.timeSinceVisit > 168) {
        allowedWeightings.push(1);
        cap = 4;
    }

    params.reintroductionCap = cap;
    params.allowedWeightings = allowedWeightings;

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

module.exports = function(data, params) {
    params = calculateReintroductionParams(params);
    console.log(params);
    data.removedGroups = removeLowWeightingAtoms(data.removedGroups, params);
//    delete data.removedGroups;

    return data;
};
