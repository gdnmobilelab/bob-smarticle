function cleanParams(params) {
    params.seen = params.seen.split(',');
    for (var i in params.seen) {
        params.seen[i] = parseInt(params.seen[i]);
    }

    params.visit = parseInt(params.visit);

    return params;
}

module.exports = function(params) {
    params = cleanParams(params);

    return params;
};
