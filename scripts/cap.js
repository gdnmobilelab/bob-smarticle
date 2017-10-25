var cap = 10;

module.exports = function(data) {
    var sortedData = Object.keys(data.groups).sort( function(keyA, keyB) {
        return data.groups[keyB].rating - data.groups[keyA].rating || parseInt(keyA) - parseInt(keyB);
    });

    var capped = sortedData.splice(0, cap);

    for (var i in data.groups) {
        if (!capped.includes(i)) {
            delete data.groups[i];
        }
    }

    return data;
};
