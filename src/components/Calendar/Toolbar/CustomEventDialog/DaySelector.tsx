import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import React, { PureComponent } from 'react';

interface DaySelectorProps {
    days?: boolean[];
    onSelectDay: (days: boolean[]) => void;
}

interface DaySelectorState {
    days: boolean[];
}

function detectMobile() {
    const isMobile = window.innerWidth <= 800 && window.innerHeight <= 600;
    return isMobile;
}

class DaySelector extends PureComponent<DaySelectorProps, DaySelectorState> {
    state: DaySelectorState = {
        days: this.props.days || [false, false, false, false, false, false, false],
    };

    handleChange = (dayIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;

        this.setState(
            (prevState) => {
                const newDays = [...prevState.days];
                newDays[dayIndex] = checked;
                return { days: newDays };
            },
            () => this.props.onSelectDay(this.state.days)
        );
    };

    render() {
        if (detectMobile() == false) {
            return (
                <FormGroup row>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.days[0]}
                                onChange={this.handleChange(0)}
                                value="0"
                                color="primary"
                            />
                        }
                        label="Sunday"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.days[1]}
                                onChange={this.handleChange(1)}
                                value="1"
                                color="primary"
                            />
                        }
                        label="Monday"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.days[2]}
                                onChange={this.handleChange(2)}
                                value="2"
                                color="primary"
                            />
                        }
                        label="Tuesday"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.days[3]}
                                onChange={this.handleChange(3)}
                                value="3"
                                color="primary"
                            />
                        }
                        label="Wednesday"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.days[4]}
                                onChange={this.handleChange(4)}
                                value="4"
                                color="primary"
                            />
                        }
                        label="Thursday"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.days[5]}
                                onChange={this.handleChange(5)}
                                value="5"
                                color="primary"
                            />
                        }
                        label="Friday"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.days[6]}
                                onChange={this.handleChange(6)}
                                value="6"
                                color="primary"
                            />
                        }
                        label="Saturday"
                    />
                </FormGroup>
            );
        } else {
            return (
                <FormGroup row>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.days[0]}
                                onChange={this.handleChange(0)}
                                value="0"
                                color="primary"
                            />
                        }
                        label="Sun"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.days[1]}
                                onChange={this.handleChange(1)}
                                value="1"
                                color="primary"
                            />
                        }
                        label="Mon"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.days[2]}
                                onChange={this.handleChange(2)}
                                value="2"
                                color="primary"
                            />
                        }
                        label="Tue"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.days[3]}
                                onChange={this.handleChange(3)}
                                value="3"
                                color="primary"
                            />
                        }
                        label="Wed"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.days[4]}
                                onChange={this.handleChange(4)}
                                value="4"
                                color="primary"
                            />
                        }
                        label="Thur"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.days[5]}
                                onChange={this.handleChange(5)}
                                value="5"
                                color="primary"
                            />
                        }
                        label="Fri"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.days[6]}
                                onChange={this.handleChange(6)}
                                value="6"
                                color="primary"
                            />
                        }
                        label="Sat"
                    />
                </FormGroup>
            );
        }
    }
}

export default DaySelector;
