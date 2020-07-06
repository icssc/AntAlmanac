import React, { PureComponent, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Help, Image } from '@material-ui/icons';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import {
    Modal,
    Button,
    Typography,
} from '@material-ui/core';
import GraphModalContent from './GraphModalContent';

const styles = (theme) => ({
    flex: { flexGrow: 1 }
});

class EnrollmentGraph extends PureComponent {
    state = {
        open: false,
    };

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    render() {
        return (
            <Fragment>
                <Typography className={this.props.classes.flex} />
                <Button
                    variant="contained"
                    onClick={this.handleOpen}
                    style={{ backgroundColor: '#f8f17c', boxShadow: 'none' }}
                >
                    Past Enrollment
                    <Image fontSize="small" />
                </Button>

                <Modal open={this.state.open} onClose={this.handleClose}>
                    <GraphModalContent courseDetails={this.props.courseDetails}/>
                </Modal>
            </Fragment>
        );
    }
}

EnrollmentGraph.propTypes = {
    courseDetails: PropTypes.object.isRequired
};

export default withStyles(styles)(EnrollmentGraph);
