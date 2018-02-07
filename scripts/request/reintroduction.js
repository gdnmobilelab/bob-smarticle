function calculateReIntroductionParams(params) {
    var today = params.today ? new Date(params.today) : new Date()
    var msSinceVisit = today - new Date(params.lastVisited);
    params.timeSinceVisit = parseInt((msSinceVisit/(1000*60*60)));
}

function removeLowWeightingAtoms(groups) {
    for (var i in groups) {
        if (groups[i].highestWeighting < 3) {
            console.log(groups[i]);
            delete groups[i];
        }
    }
}

module.exports = function(data, params) {
    params = calculateReIntroductionParams(params);

    data.removeGrouped = removeLowWeightingAtoms(data.removeGrouped);
//    delete data.removedGroups;

    return data;
};
