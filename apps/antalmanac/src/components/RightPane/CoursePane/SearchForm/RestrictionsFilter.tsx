// @eslint-disable-next-line
import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { ChangeEvent, PureComponent } from 'react';

import RightPaneStore from '../../RightPaneStore';

const restrictionList = [
    // { value: 'ALL', label: 'ALL: Include All Restrictions' },
    // { value: 'A', label: 'A: Prerequisite required' },
    // { value: 'B', label: 'B: Authorization code required' },
    // { value: 'C', label: 'C: Fee required' },
    // { value: 'D', label: 'D: Pass/Not Pass option only' },
    // { value: 'E', label: 'E: Freshmen only' },
    // { value: 'F', label: 'F: Sophomores only' },
    // { value: 'G', label: 'G: Lower-division only' },
    // { value: 'H', label: 'H: Juniors only' },
    // { value: 'I', label: 'I: Seniors only' },
    // { value: 'J', label: 'J: Upper-division only' },
    // { value: 'K', label: 'K: Graduate only' },
    // { value: 'L', label: 'L: Major only' },
    // { value: 'M', label: 'M: Non-major only' },
    // { value: 'N', label: 'N: School major only' },
    // { value: 'O', label: 'O: Non-school major only' },
    // { value: 'R', label: 'R: Biomedical Pass/Fail course (School of Medicine only' },
    // { value: 'S', label: 'S: Satisfactory/Unsatisfactory only' },
    // { value: 'X', label: 'X: Separate authorization codes required to add, drop, or change enrollment' },

    // "All: Include All Restrictions",
    // "NONE: Filter all restrictions",
    'A: Prerequisite required',
    'B: Authorization code required',
    'C: Fee required',
    'D: Pass/Not Pass option only',
    'E: Freshmen only',
    'F: Sophomores only',
    'G: Lower-division only',
    'H: Juniors only',
    'I: Seniors only',
    'J: Upper-division only',
    'K: Graduate only',
    'L: Major only',
    'M: Non-major only',
    'N: School major only',
    'O: Non-school major only',
    'R: Biomedical Pass/Fail course (School of Medicine only',
    'S: Satisfactory/Unsatisfactory only',
    'X: Separate authorization codes required to add, drop, or change enrollment',
];

const styles = {
    formControl: {
        flexGrow: 1,
        marginRight: 15,
        width: '50%',
    },
};

interface RestrictionFilterProps {
    classes: ClassNameMap;
}

interface RestrictionFilterState {
    restrictions: string[];
}

class RestrictionsFilter extends PureComponent<RestrictionFilterProps, RestrictionFilterState> {
    updateRestrictionsAndGetFormData() {
        RightPaneStore.updateFormValue('restrictions', RightPaneStore.getUrlRestrictionsValue());
        return RightPaneStore.getFormData().restrictions;
    }

    getRestrictions() {
        return RightPaneStore.getUrlRestrictionsValue().trim()
            ? this.updateRestrictionsAndGetFormData()
            : RightPaneStore.getFormData().restrictions;
    }

    state = {
        restrictions: (this.getRestrictions() + '').split(', '),
    };

    handleChange = (event: ChangeEvent<{ restrictions?: string | undefined; value: unknown }>) => {
        this.setState({ restrictions: event.target.value as string[] });
        RightPaneStore.updateFormValue('restrictions', event.target.value as string);
        const stateObj = { url: 'url' };
        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);
        urlParam.delete('Restrictions');
        const changedValue = event.target.value as string;
        if (changedValue && changedValue != 'ALL') {
            urlParam.append('Restrictions', event.target.value as string);
        }
        const param = urlParam.toString();
        const new_url = `${param.trim() ? '?' : ''}${param}`;
        history.replaceState(stateObj, 'url', '/' + new_url);
    };

    componentDidMount() {
        RightPaneStore.on('formReset', this.resetField);
    }

    componentWillUnmount() {
        RightPaneStore.removeListener('formReset', this.resetField);
    }

    resetField = () => {
        this.setState({ restrictions: RightPaneStore.getFormData().restrictions.split(', ') });
    };

    render() {
        const { classes } = this.props;

        return (
            <div>
                <FormControl className={classes.formControl}>
                    <InputLabel>Restrictions</InputLabel>
                    <Select
                        multiple
                        value={restrictionList}
                        renderValue={(selected) =>
                            (selected as string[])
                                .map((value) => value.split(':')[0].trim())
                                .sort((a, b) => a.localeCompare(b))
                                .join(', ')
                        }
                        // MenuProps={MenuProps}
                    >
                        {restrictionList.map((restrictions) => (
                            <MenuItem key={restrictions} value={restrictions}>
                                <Checkbox checked={restrictionList.indexOf(restrictions) > -1} />
                                {/* <ListItemText primary={restrictions} /> */}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
        );
    }
}

export default withStyles(styles)(RestrictionsFilter);

// import React from "react";
// import {
//   createStyles,
//   makeStyles,
//   useTheme,
//   Theme
// } from "@material-ui/core/styles";
// import Input from "@material-ui/core/Input";
// import InputLabel from "@material-ui/core/InputLabel";
// import MenuItem from "@material-ui/core/MenuItem";
// import FormControl from "@material-ui/core/FormControl";
// import ListItemText from "@material-ui/core/ListItemText";
// import Select from "@material-ui/core/Select";
// import Checkbox from "@material-ui/core/Checkbox";
// import RightPaneStore from "$components/RightPane/RightPaneStore";

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     formControl: {
//         flexGrow: 1,
//         marginRight: 15,
//         width: 120,
//         overflow: 'ellipsis',
//     },
//   })
// );

// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;
// const MenuProps = {
//   PaperProps: {
//     style: {
//       maxHeight: ITEM_HEIGHT * 10 + ITEM_PADDING_TOP,
//       width: 250
//     }
//   }
// };

// const restrictionList = [
//         // 'ALL: Include All Restrictions',
//         // "NONE: Filter all restrictions",
//     'A: Prerequisite required',
//     'B: Authorization code required' ,
//     'C: Fee required',
//     'D: Pass/Not Pass option only',
//     'E: Freshmen only',
//     'F: Sophomores only',
//     'G: Lower-division only',
//     'H: Juniors only',
//     'I: Seniors only',
//     'J: Upper-division only',
//     'K: Graduate only',
//     'L: Major only',
//     'M: Non-major only',
//     'N: School major only',
//     'O: Non-school major only',
//     'R: Biomedical Pass/Fail course (School of Medicine only',
//     'S: Satisfactory/Unsatisfactory only',
//     'X: Separate authorization codes required to add, drop, or change enrollment',
// ];

// export default function RestrictionSelector() {
//   const classes = useStyles();
//   const [restriction, setRestriction] = React.useState<string[]>([
//         // "All: Include All Restrictions",
//         // "NONE: Filter all restrictions",
//         'A: Prerequisite required',
//         'B: Authorization code required' ,
//         'C: Fee required',
//         'D: Pass/Not Pass option only',
//         'E: Freshmen only',
//         'F: Sophomores only',
//         'G: Lower-division only',
//         'H: Juniors only',
//         'I: Seniors only',
//         'J: Upper-division only',
//         'K: Graduate only',
//         'L: Major only',
//         'M: Non-major only',
//         'N: School major only',
//         'O: Non-school major only',
//         'R: Biomedical Pass/Fail course (School of Medicine only',
//         'S: Satisfactory/Unsatisfactory only',
//         'X: Separate authorization codes required to add, drop, or change enrollment',
//     ]);

//   const [personName, setPersonName] = React.useState<string[]>([]);

//   const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
//     console.log(event.target.value)
//     // if(event.target.value.toString() == ['All: Include All Restrictions']){
//     //     console.log('all')
//     //     setRestriction(restrictionList)
//     //     console.log(restrictionList)
//     // }
//     // if(event.target.value == "NONE: Filter all restrictions"){
//     //     setRestriction([])
//     // }

//     setRestriction(event.target.value as string[]);
//   };

//   const updateGEAndGetFormData: any() => {
//     RightPaneStore.updateFormValue('ge', RightPaneStore.getUrlGEValue());
//     return RightPaneStore.getFormData().ge;
// }

// getGe() {
//     return RightPaneStore.getUrlGEValue().trim()
//       ? this.updateGEAndGetFormData()
//       : RightPaneStore.getFormData().ge
// }

// state = {
//     ge: this.getGe(),
// };
//   return (
//     <div>
//       <FormControl className={classes.formControl}>
//         <InputLabel>Restrictions</InputLabel>
//         <Select
//           multiple
//           value={restriction}
//           onChange={handleChange}
//           input={<Input />}
//           renderValue={
//             (selected) => (selected as string[])
//                 .map(value => value
//                 .split(':')[0]
//                 .trim())
//                 .sort((a, b) => a.localeCompare(b))
//                 .join(", ")}
//           MenuProps={MenuProps}
//         >
//           {restrictionList.map((restrictions) => (
//             <MenuItem key={restrictions} value={restrictions}>
//               <Checkbox checked={restriction.indexOf(restrictions) > -1} />
//               <ListItemText primary={restrictions} />
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>
//     </div>
//   );
// }
