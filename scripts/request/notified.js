function moveNotifiedGroup(data, notified) {
    for (var i in data.groups) {
        for (var atom in data.groups[i].atoms) {
            if (data.groups[i].atoms[atom].id === notified) {
                data.notified = data.groups[i];
                data.notified.isNotified = true;
                delete data.groups[i];
                break;
            }
        }
    }

    return data;
}

module.exports = function(data, notified) {
    if (notified) {
        data = moveNotifiedGroup(data, notified);
    }

    return data;
};
