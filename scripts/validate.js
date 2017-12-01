function discardIncompleteAtoms(atoms) {
    for (var i in atoms) {
        if (!atoms[i].type) {
            delete atoms[i];
        }
    }

    return atoms;
}

function validateDataTypes(atoms) {
    for (var i in atoms) {
        if (typeof atoms[i].id !== 'number') {
            throw 'Id in atom ' + atoms[i].id + ' isn\'t a number or doesn\'t exist';
        }

        if (typeof atoms[i].date !== 'string') {
            throw 'Date in atom ' + atoms[i].id + ' isn\'t a string';
        }

        if (typeof atoms[i].time !== 'string') {
            throw 'Time in atom ' + atoms[i].id + ' isn\'t a string';
        }
    }

    return atoms;
}


module.exports = function(data) {
    data.groups = discardIncompleteAtoms(data.groups);
    data.groups = validateDataTypes(data.groups);

    return data;
};
