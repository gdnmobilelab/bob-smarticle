function evaluateWeighting(weighting) {
    if (weighting == 1) {
        return 0.75;
    } else if (weighting == 2) {
        return 0.5;
    } else if (weighting == 3) {
        return 0.25;
    } else {
        return 0;
    }
}

function weightingVsVisit(weighting, visit) {
    // relegate 3s and 4s on first visit
    if (visit == 1 && weighting > 2) {
        return -.5;

    // promote 3s and 4s on subsequent visits
    } else if (visit > 1 && weighting == 3) {
        return 0.4;
    } else if (visit > 1 && weighting == 4) {
        return 0.25;
    } else {
        return 0;
    }
}

function evaluateSeen(group, seen) {
    var numberOfAtoms = Object.keys(group.atoms).length;
    var numberOfSeenAtoms = 0;

    for (var i in group.atoms) {
        if (seen.includes(group.atoms[i].id)) {
            numberOfSeenAtoms++;
        }
    }

    if (numberOfAtoms === numberOfSeenAtoms) {
        var highestWeighting = group.highestWeighting;

        if (highestWeighting == 1) {
            return -.75;
        } else if (highestWeighting == 2) {
            return -.5;
        } else if (highestWeighting == 3) {
            return -.4;
        } else {
            return -1;
        }
    } else {
        return 0;
    }
}

function filterByRating(groups) {
    for (var i in groups) {
        if (groups[i].rating <= 0) {
            delete groups[i];
        }
    }

    return groups;
}

Number.prototype.clamp = function() {
    var min = -1;
    var max = 1;
    return Math.min(Math.max(this, min), max);
}

function rateAtoms(data, params) {
    for (var i in data.groups) {
        var group = data.groups[i];

        var rating = 0;
            rating += evaluateWeighting(group.highestWeighting).clamp();
            rating += weightingVsVisit(group.highestWeighting, params.visit).clamp();
            rating += evaluateSeen(group, params.seen).clamp();

        data.groups[i].rating = rating;
    }

    data.groups = filterByRating(data.groups);

    return data;
}

module.exports = function(data, params) {
    data = rateAtoms(data, params);

    return data;
};
