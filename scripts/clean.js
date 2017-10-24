function removeEmptyGroups(data) {
    for (var i in data.groups) {
        if (Object.keys(data.groups[i].atoms).length === 0) {
            delete data.groups[i];
        }
    }

    return data;
}

module.exports = function(data) {
    data = removeEmptyGroups(data);

    return data;
};
