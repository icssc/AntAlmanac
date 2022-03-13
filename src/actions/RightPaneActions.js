import dispatcher from '../dispatcher';
import AppStore from '../stores/RightPaneStore';
import ReactGA from 'react-ga';

export const updateFormValue = (field, value) => {
    const formData = { ...AppStore.getFormData(), [field]: value };

    dispatcher.dispatch({
        type: 'UPDATE_FORM_FIELD',
        formData,
    });
};

export const resetFormValues = () => {
    dispatcher.dispatch({
        type: 'RESET_FORM_FIELDS',
    });
};

export const handleTabChange = (event, value) => {
    switch (
        value // 0 is Class Search Tab, 1 is Added Classes Tab, 2 is Map Tab
    ) {
        case 1:
            ReactGA.event({
                category: 'antalmanac-rewrite',
                action: `Switch tab to Added Classes`,
            });
            break;
        case 2:
            ReactGA.event({
                category: 'antalmanac-rewrite',
                action: `Switch tab to Map`,
            });
            break;
        default:
        // do nothing
    }

    dispatcher.dispatch({
        type: 'TAB_CHANGE',
        activeTab: value,
    });
};
