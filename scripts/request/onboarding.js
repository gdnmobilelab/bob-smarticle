function addOnboardingAtom(data) {
    data.onboarding = {
        groupName: 'Welcome to this experiment',
        groupType: 'onboarding',
        atoms: {
            0: {
                copy: 'The Guardian Mobile Innovation Lab is trying out a new mobile story format. This page will update with key developments about ' + data.furniture.title + ' over the next few days. When you return, you will see the developments that are new or relevant to you, based on things such as when you last visited and the importance of each detail. We will also bring back certain elements of the story that you read previously to jog your memory and add context. Enjoy!',
                type: 'text'
            }
        }
    }

    return data;
}

module.exports = function(data, params) {
    if (params.onboarding == 'true' || params.onboarding == true) {
        data = addOnboardingAtom(data);
    }

    return data;
};
