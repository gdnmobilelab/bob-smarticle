function collapseHalfSeenGroups(groups, seen) {
    for (var i in groups) {
        if (groups[i].groupType === 'expanded') {
            var totalAtomsInGroup = Object.keys(groups[i].atoms).length;
            var seenAtomsInGroup = 0;

            for (var a in groups[i].atoms) {
                if (seen.includes(groups[i].atoms[a].id)) {
                    seenAtomsInGroup++;
                }
            }

            // TODO: Make it so if an atom has been published since your last visit, never collapse
            if (seenAtomsInGroup > totalAtomsInGroup / 2) {
                groups[i].groupType = 'collapsed';
            }
        }
    }

    return groups;
}


module.exports = function(data, params) {
    data.groups = collapseHalfSeenGroups(data.groups, params.seen);

    return data;
};
