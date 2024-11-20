import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
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

    handleChange = (dayIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;

        this.setState(
            (prevState) => {
                const newScheduleIndices = checked
                    ? [...prevState.scheduleIndices, dayIndex]
                    : prevState.scheduleIndices.filter((scheduleIndex) => {
                          return scheduleIndex !== dayIndex;
                      });

                return { scheduleIndices: newScheduleIndices };
            },
            () => this.props.onSelectScheduleIndices(this.state.scheduleIndices)
        );
    };

    render() {
        return (
            <FormControl style={{ marginTop: 10 }}>
                <FormLabel component="legend" style={{ marginTop: 10 }}>
                    Select schedules
                </FormLabel>
                <FormGroup row>
                    {this.props.scheduleNames.map((name, index) => {
                        return (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={this.state.scheduleIndices.includes(index)}
                                        onChange={this.handleChange(index)}
                                        value={index + 1}
                                        color="primary"
                                    />
                                }
                                label={name}
                                key={name}
                            />
                        );
                    })}
                </FormGroup>
            </FormControl>
        );
    }
}

export default ScheduleSelector;
