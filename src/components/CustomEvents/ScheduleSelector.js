import React, { PureComponent } from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

class ScheduleSelector extends PureComponent {
    state = {
        scheduleIndices: this.props.customEvent ? this.props.customEvent.scheduleIndices : this.props.scheduleIndices,
    };

    handleChange = (dayIndex) => (event) => {
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
                        />
                    );
                })}
            </FormGroup>
        );
    }
}

export default ScheduleSelector;
