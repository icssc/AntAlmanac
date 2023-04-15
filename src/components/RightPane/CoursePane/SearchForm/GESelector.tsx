import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { ChangeEvent, PureComponent } from 'react';

import RightPaneStore from '../../RightPaneStore';

const geList: { value: string; label: string }[] = [
    { value: 'ANY', label: "All: Don't filter for GE" },
    { value: 'GE-1A', label: 'GE Ia (1a): Lower Division Writing' },
    { value: 'GE-1B', label: 'GE Ib (1b): Upper Division Writing' },
    { value: 'GE-2', label: 'GE II (2): Science and Technology' },
    { value: 'GE-3', label: 'GE III (3): Social and Behavioral Sciences' },
    { value: 'GE-4', label: 'GE IV (4): Arts and Humanities' },
    { value: 'GE-5A', label: 'GE Va (5a): Quantitative Literacy' },
    { value: 'GE-5B', label: 'GE Vb (5b): Formal Reasoning' },
    { value: 'GE-6', label: 'GE VI (6): Language other than English' },
    { value: 'GE-7', label: 'GE VII (7): Multicultural Studies' },
    { value: 'GE-8', label: 'GE VIII (8): International/Global Issues' },
];

const styles = {
    formControl: {
        flexGrow: 1,
        marginRight: 15,
        width: '50%',
    },
};

interface GESelectorProps {
    classes: ClassNameMap;
}
interface GESelectorState {
    ge: string;
}

class GESelector extends PureComponent<GESelectorProps, GESelectorState> {
    
    updateGEAndGetFormData(){
        RightPaneStore.updateFormValue("ge", RightPaneStore.getUrlGEValue()) 
        return RightPaneStore.getFormData().ge
    };

    getGe(){
        if(RightPaneStore.getUrlGEValue() != "null" && RightPaneStore.getUrlGEValue() != "" && RightPaneStore.getUrlGEValue() != " "){
            return this.updateGEAndGetFormData()
        }else{
            return RightPaneStore.getFormData().ge
        }
    };
    
    state = {
        ge: this.getGe(),
    };

    handleChange = (event: ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
        this.setState({ ge: event.target.value as string });
        RightPaneStore.updateFormValue('ge', event.target.value as string);
    
        let stateObj = { url: "url" };
        const url = new URL(window.location.href)
        const urlParam = new URLSearchParams(url.search);
        urlParam.delete('GE');
        if (event.target.value as string != "" && event.target.value as string != null && event.target.value as string != "ANY"){
            urlParam.append('GE', event.target.value as string);
            const new_url = `?${urlParam.toString()}`;
            history.replaceState(stateObj, "url", "/" + new_url);
        }else{
            if (urlParam.toString() == "" || urlParam.toString() == null){
                const new_url = `${urlParam.toString()}`;
                history.replaceState(stateObj, "url", "/" + new_url);
            }else{
                const new_url = `?${urlParam.toString()}`;
                history.replaceState(stateObj, "url", "/" + new_url);
            }
        }
    };

    componentDidMount() {
        RightPaneStore.on('formReset', this.resetField);
    }

    componentWillUnmount() {
        RightPaneStore.removeListener('formReset', this.resetField);
    }

    resetField = () => {
        this.setState({ ge: RightPaneStore.getFormData().ge });
    };

    render() {
        const { classes } = this.props;

        return (
            <FormControl className={classes.formControl}>
                <InputLabel>General Education</InputLabel>
                <Select value={this.state.ge} onChange={this.handleChange} fullWidth>
                    {geList.map((category) => {
                        return (
                            <MenuItem key={category.value} value={category.value}>
                                {category.label}
                            </MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
        );
    }
}

export default withStyles(styles)(GESelector);
