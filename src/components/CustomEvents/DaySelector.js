import React from "react";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

class CheckboxLabels extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
        };
    }

    handleChange = name => event => {
        this.setState({[name]: event.target.checked}, () => {
            this.props.onSelectDay(this.state);
        });
    };

    render() {
        return (
            <FormGroup row onChange={this.update}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={this.state.monday}
                            onChange={this.handleChange("monday")}
                            value="1"
                            color="primary"
                        />
                    }
                    label="Monday"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={this.state.tuesday}
                            onChange={this.handleChange("tuesday")}
                            value="2"
                            color="primary"
                        />
                    }
                    label="Tuesday"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={this.state.wednesday}
                            onChange={this.handleChange("wednesday")}
                            value="3"
                            color="primary"
                        />
                    }
                    label="Wednesday"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={this.state.thursday}
                            onChange={this.handleChange("thursday")}
                            value="4"
                            color="primary"
                        />
                    }
                    label="Thursday"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={this.state.friday}
                            onChange={this.handleChange("friday")}
                            value="5"
                            color="primary"
                        />
                    }
                    label="Friday"
                />
            </FormGroup>
        );
    }
}

export default CheckboxLabels;
