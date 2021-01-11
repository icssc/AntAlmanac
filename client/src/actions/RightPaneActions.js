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

export const handleTabChange = (event, value) => {
    ReactGA.event({
        category: 'antalmanac-rewrite',
        action: `Switched tab to ${value}`,
    });

    dispatcher.dispatch({
        type: 'TAB_CHANGE',
        activeTab: value,
    });
};
