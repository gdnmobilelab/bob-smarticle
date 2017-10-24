function cleanParams(params) {
    params.seen = params.seen.split(',');
    for (var i in params.seen) {
        params.seen[i] = parseInt(params.seen[i]);
    }

    return params;
}

function removeSeen(data, atomsSeen) {
    for (var i in data.groups) {
        for (var atomId in data.groups[i].atoms) {
            var atom = data.groups[i].atoms[atomId];
            if (atomsSeen.includes(atom.id)) {
                delete data.groups[i].atoms[atomId];
            }
        }
    }

    return data;
}

module.exports = function(data, params) {
    params = cleanParams(params);
    data = removeSeen(data, params.seen);

    return data;
};
