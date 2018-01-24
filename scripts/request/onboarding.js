function addOnboardingAtom(data) {
    data.onboarding = {
        groupName: 'Welcome to this experiment',
        groupType: 'onboarding',
        atoms: {
            0: {
                copy: 'The Guardian Mobile Innovation Lab is trying out a new mobile story format. This page will update as ' + data.furniture.title + ' progresses over the next few days with key developments. When you return, you will only see the developments that are new or relevant to you, based on signals such as when you last visited and the importance of each development. Enjoy!',
                type: 'text'
            }
        }
    }

    return data;
}

module.exports = function(data, params) {
    if (params.onboarding == 'true') {
        data = addOnboardingAtom(data);
    }

    return data;
};
