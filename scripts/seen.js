function evaluateSeen(group, seen) {
    var numberOfAtoms = Object.keys(group.atoms).length;
    var numberOfSeenAtoms = 0;

    for (var i in group.atoms) {
        if (seen.includes(parseInt(group.atoms[i].id))) {
            numberOfSeenAtoms++;
        }
    }

    group.seen = numberOfSeenAtoms;
    group.atomCount = numberOfAtoms;

    return group;
}

function removeSeenGroups(data) {
    for (var i in data.groups) {
        if (data.groups[i].atomCount === data.groups[i].seen) {
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
