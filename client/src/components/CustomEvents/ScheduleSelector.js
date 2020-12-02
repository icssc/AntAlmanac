import React, { PureComponent } from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

class ScheduleSelector extends PureComponent {
    state = {
        scheduleIndices: this.props.customEvent ? this.props.customEvent.scheduleIndices : [],
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
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={this.state.scheduleIndices.includes(0)}
                            onChange={this.handleChange(0)}
                            value="1"
                            color="primary"
                        />
                    }
                    label="Schedule 1"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={this.state.scheduleIndices.includes(1)}
                            onChange={this.handleChange(1)}
                            value="2"
                            color="primary"
                        />
                    }
                    label="Schedule 2"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={this.state.scheduleIndices.includes(2)}
                            onChange={this.handleChange(2)}
                            value="3"
                            color="primary"
                        />
                    }
                    label="Schedule 3"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={this.state.scheduleIndices.includes(3)}
                            onChange={this.handleChange(3)}
                            value="4"
                            color="primary"
                        />
                    }
                    label="Schedule 4"
                />
            </FormGroup>
        );
    }
}

export default ScheduleSelector;
