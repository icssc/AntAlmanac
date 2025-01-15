import FormControl from '@material-ui/core/FormControl';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import type { RepeatingCustomEvent } from '@packages/antalmanac-types';
import { PureComponent } from 'react';

interface ScheduleSelectorProps {
    customEvent?: RepeatingCustomEvent;
    scheduleIndices: number[];
    onSelectScheduleIndices: (scheduleIndices: number[]) => void;
    scheduleNames: string[];
}

interface ScheduleSelectorState {
    scheduleIndices: number[];
}

class ScheduleSelector extends PureComponent<ScheduleSelectorProps, ScheduleSelectorState> {
    state = {
        scheduleIndices: this.props.scheduleIndices,
    };

    handleChange = (event: SelectChangeEvent<typeof this.state.scheduleIndices>) => {
        const value = event.target.value as number[];

        this.setState({ scheduleIndices: value }, () => this.props.onSelectScheduleIndices(this.state.scheduleIndices));
    };

    render() {
        return (
            <FormControl style={{ maxWidth: 400 }} fullWidth variant="outlined">
                <InputLabel id="schedule-select-label" htmlFor="select-multiple-chip">
                    Select schedules
                </InputLabel>
                <Select
                    labelId="schedule-select-label"
                    id="schedule-select"
                    size="small"
                    multiple
                    value={this.state.scheduleIndices}
                    defaultValue={this.state.scheduleIndices}
                    onChange={this.handleChange}
                    input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value: number) => {
                                return <Chip key={value} label={this.props.scheduleNames[value]} />;
                            })}
                        </Box>
                    )}
                >
                    {this.props.scheduleNames.map((name: string, index: number) => {
                        return (
                            <MenuItem key={index} value={index}>
                                {name}
                            </MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
        );
    }
}

export default ScheduleSelector;
