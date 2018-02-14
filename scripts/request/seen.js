function evaluateSeen(group, seen) {
    var numberOfAtoms = Object.keys(group.atoms).length;
    var numberOfSeenAtoms = 0;
    var timeInView = 0;

    var groupIds = [];

    for (var i in group.atoms) {
        groupIds.push(group.atoms[i].id);
    }

    for (var i in group.atoms) {
        for (var s in seen) {
            if (seen[s].id === parseInt(group.atoms[i].id)) {
                numberOfSeenAtoms++;
                timeInView += parseInt(seen[s].timeInView);
            }
        }
    }

    group.seen = numberOfSeenAtoms;
    group.timeInView = timeInView;
    group.atomCount = numberOfAtoms;

    return group;
}

function removeSeenGroups(data) {
    data.removedGroups = {};

    for (var i in data.groups) {
        if (data.groups[i].atomCount === data.groups[i].seen) {
            data.removedGroups[i] = data.groups[i];
            delete data.groups[i];
        }
    }

    return data;
}

module.exports = function(data, params) {
    for (var i in data.groups) {
        var group = data.groups[i];
            group = evaluateSeen(group, params.seen);

        data.groups[i] = group;
    }

    data = removeSeenGroups(data);

    return data;
};
