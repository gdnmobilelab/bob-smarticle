function cleanParams(params) {
    params.seen = params.seen.split(',');
    for (var i in params.seen) {
        params.seen[i] = parseInt(params.seen[i]);
    }

    params.visit = parseInt(params.visit);

    return params;
}

function resetIfDebug(params) {
    if (params.debug) {
        params.seen = ['0'];
        params.visit = 1
    }

    return params;
}

module.exports = function(params) {
    params = cleanParams(params);
    params = resetIfDebug(params);

    return params;
};
