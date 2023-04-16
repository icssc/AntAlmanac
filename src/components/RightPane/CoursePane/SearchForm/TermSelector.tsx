import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { ChangeEvent, PureComponent } from 'react';

import RightPaneStore from '../../RightPaneStore';
import { termData } from '$lib/termData';

interface TermSelectorProps {
    changeState: (field: string, value: string) => void;
    fieldName: string;
}

class TermSelector extends PureComponent<TermSelectorProps> {
    updateTermAndGetFormData() {
        RightPaneStore.updateFormValue('term', RightPaneStore.getUrlTermValue());
        return RightPaneStore.getFormData().term;
    }

    getTerm() {
        const urlTermValue = RightPaneStore.getUrlTermValue();
        if (urlTermValue != 'null' && urlTermValue.trim() != '') {
            return this.updateTermAndGetFormData();
        } else {
            return RightPaneStore.getFormData().term;
        }
    }

    state = {
        term: this.getTerm(),
    };

    resetField = () => {
        this.setState({ term: RightPaneStore.getFormData().term });
    };

    componentDidMount = () => {
        RightPaneStore.on('formReset', this.resetField);
    };

    componentWillUnmount() {
        RightPaneStore.removeListener('formReset', this.resetField);
    }

    handleChange = (event: ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
        this.setState({ term: event.target.value });
        this.props.changeState(this.props.fieldName, event.target.value as string);

        const stateObj = { url: 'url' };
        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);
        urlParam.delete('term');
        urlParam.append('term', event.target.value as string);
        const param = urlParam.toString();
        const new_url = `${param && param !== 'null' ? '?' : ''}${param}`;
        history.replaceState(stateObj, 'url', '/' + new_url);
    };

    render() {
        return (
            <FormControl fullWidth>
                <InputLabel>Term</InputLabel>
                <Select value={this.state.term} onChange={this.handleChange}>
                    {termData.map((term, index) => (
                        <MenuItem key={index} value={term.shortName}>
                            {term.longName}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }
}

export default TermSelector;
