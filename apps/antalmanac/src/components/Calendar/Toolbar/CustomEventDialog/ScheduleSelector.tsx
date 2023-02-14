import React, { PureComponent } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import { RepeatingCustomEvent } from './CustomEventDialog';

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
        );
    }
}

export default ScheduleSelector;
