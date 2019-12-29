import dispatcher from '../dispatcher';
import AppStore from '../stores/RightPaneStore';

export const updateFormValue = (field, value) => {
    const formData = { ...AppStore.getFormData(), [field]: value };

    dispatcher.dispatch({
        type: 'UPDATE_FORM_FIELD',
        formData,
    });
};
