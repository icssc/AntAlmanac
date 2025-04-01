import { Button, Collapse, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
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

        let advanced = false;

        if (typeof Storage !== 'undefined') {
            advanced = getLocalStorageAdvanced() === 'expanded';
        }

        const formData = RightPaneStore.getFormData();
        const defaultFormData = RightPaneStore.getDefaultFormData();
        for (const [key, value] of Object.entries(formData)) {
            if (key === 'deptValue') {
                continue;
            }

            if (defaultFormData[key] != value) {
                advanced = true;
                break;
            }
        }

        this.state = {
            expandAdvanced: advanced,
        };
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
            if (key === 'deptValue') {
                continue;
            }

            urlParam.delete(key);
        }

        const param = urlParam.toString();
        const new_url = `${param.trim() ? '?' : ''}${param}`;
        history.replaceState(stateObj, 'url', '/' + new_url);
    }

    handleExpand = () => {
        const nextExpansionState = !this.state.expandAdvanced;
        setLocalStorageAdvanced(nextExpansionState ? 'expanded' : 'notexpanded');
        this.setState({ expandAdvanced: nextExpansionState });
    };

    render() {
        return (
            <>
                <Button
                    onClick={this.handleExpand}
                    style={{ textTransform: 'none', width: 'auto', display: 'flex', justifyContent: 'start' }}
                >
                    <div>
                        <Typography noWrap variant="body1">
                            Advanced Search Options
                        </Typography>
                    </div>
                    {this.state.expandAdvanced ? <ExpandLess /> : <ExpandMore />}
                </Button>
                <Collapse in={this.state.expandAdvanced}>
                    <AdvancedSearchTextFields />
                </Collapse>
            </>
        );
    }
}

export default withStyles(parentStyles)(AdvancedSearch);
