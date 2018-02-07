var cap = 10;

function sortDataByRating(groups) {
    return Object.keys(groups).sort( function(keyA, keyB) {
        return groups[keyB].rating - groups[keyA].rating || parseInt(keyA) - parseInt(keyB);
    });
}

function removeNonFaqGroups(groupsToRemove, groups) {
    var list = [];

    groupsToRemove.map(function(group) {
        if (!groups[group].isFaq) {
            list.push(group);
        }
    });

    return list;
}

function removeGroupsPostCap(groupsToRemove) {
    return groupsToRemove.splice(cap, groupsToRemove.length);
}

module.exports = function(data) {
    var groupsToRemove = sortDataByRating(data.groups);
        groupsToRemove = removeNonFaqGroups(groupsToRemove, data.groups);
        groupsToRemove = removeGroupsPostCap(groupsToRemove);

    for (var i in data.groups) {
        if (groupsToRemove.includes(i)) {
            data.removedGroups[i] = data.groups[i];
            delete data.groups[i];
        }
    }

    return data;
};
