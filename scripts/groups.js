function expandCollapsedGroupsIfSeen(groups, seen) {
    for (var i in groups) {
        if (groups[i].groupType === 'collapsed') {
            var totalAtomsInGroup = Object.keys(groups[i].atoms).length;
            var seenAtomsInGroup = 0;

            for (var a in groups[i].atoms) {
                if (seen.includes(groups[i].atoms[a].id)) {
                    seenAtomsInGroup++;
                }
            }

            // TODO: Make it so if an atom has been published since your last visit, never collapse
            if (seenAtomsInGroup > 1) {
                groups[i].groupType = 'expanded';
            }
        }
    }

    return groups;
}

function expandGroupsOfTwo(groups) {
    for (var i in groups) {
        if (Object.keys(groups[i].atoms).length == 2 && groups[i].groupType == 'collapsed') {
            groups[i].groupType = 'expanded';
        }
    }

    return groups;
}

module.exports = function(data, params) {
    data.groups = expandCollapsedGroupsIfSeen(data.groups, params.seen);
    data.groups = expandGroupsOfTwo(data.groups);

    return data;
};
