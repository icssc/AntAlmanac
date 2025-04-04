import { Button, Collapse, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { PureComponent } from 'react';

import RightPaneStore from '../../../RightPaneStore';

import { AdvancedSearchTextFields } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchTextFields';
import { getLocalStorageAdvanced, setLocalStorageAdvanced } from '$lib/localStorage';

const parentStyles = {
    container: {
        display: 'inline-flex',
        marginTop: 10,
        marginBottom: 10,
        cursor: 'pointer',

        '& > div': {
            marginRight: 5,
        },
    },
};

interface AdvancedSearchProps {
    classes: ClassNameMap;
}

interface AdvancedSearchState {
    expandAdvanced: boolean;
}

class AdvancedSearch extends PureComponent<AdvancedSearchProps, AdvancedSearchState> {
    constructor(props: AdvancedSearchProps) {
        super(props);

        let advanced = true;

        if (typeof Storage !== 'undefined') {
            advanced = getLocalStorageAdvanced() === 'expanded';
        }

        const formData = RightPaneStore.getFormData();
        const defaultFormData = RightPaneStore.getDefaultFormData();
        for (const [key, value] of Object.entries(formData)) {
            if (key === 'deptLabel' || key === 'deptValue') {
                continue;
            }

            if (defaultFormData[key] != value) {
                advanced = true;
                break;
            }
        }
    }

    componentDidMount() {
        RightPaneStore.on('formReset', this.resetParams);
    }

    resetParams() {
        const stateObj = { url: 'url' };
        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);

        const formData = RightPaneStore.getFormData();
        for (const key of Object.keys(formData)) {
            if (key === 'deptLabel' || key === 'deptValue') {
                continue;
            }

            urlParam.delete(key);
        }

        const param = urlParam.toString();
        const new_url = `${param.trim() ? '?' : ''}${param}`;
        history.replaceState(stateObj, 'url', '/' + new_url);
    }

    render() {
        return (
            <>
                <div style={{ textTransform: 'none', width: 'auto', display: 'flex', justifyContent: 'start' }}>
                    <Typography noWrap variant="body1">
                        Advanced Search Options
                    </Typography>
                </div>
                <AdvancedSearchTextFields />
            </>
        );
    }
}

export default withStyles(parentStyles)(AdvancedSearch);
