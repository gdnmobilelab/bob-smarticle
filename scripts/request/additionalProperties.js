function hasFaqsFlag(groups) {
    for (var i in groups) {
        if (groups[i].isFaq) {
            return true;
        }
    }

    return false;
}

module.exports = function(data) {
    data.hasFaqs = hasFaqsFlag(data.groups);

    return data;
};
