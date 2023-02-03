import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import React, { PureComponent } from 'react';

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
        scheduleIndices: this.props.customEvent?.scheduleIndices || this.props.scheduleIndices,
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
