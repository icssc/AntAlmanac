import React, { PureComponent } from 'react';
import ReactGA from 'react-ga';
import { withStyles } from '@material-ui/core/styles';
import { Image } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { Modal, Button, Typography } from '@material-ui/core';
import GraphModalContent from './GraphModalContent';

const styles = (theme) => ({
    flex: { flexGrow: 1 },
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
        ReactGA.event({
            category: 'antalmanac-rewrite',
            action: `Click Past Enrollment button`,
        });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    render() {
        return (
            <>
                <Typography className={this.props.classes.flex} />
                <Button
                    variant="contained"
                    onClick={this.handleOpen}
                    style={{ backgroundColor: '#f8f17c', boxShadow: 'none', marginRight: '4px' }}
                >
                    Past Enrollment
                    <Image fontSize="small" />
                </Button>

                <Modal open={this.state.open} onClose={this.handleClose}>
                    <GraphModalContent courseDetails={this.props.courseDetails} />
                </Modal>
            </>
        );
    }
}

EnrollmentGraph.propTypes = {
    courseDetails: PropTypes.object.isRequired,
};

export default withStyles(styles)(EnrollmentGraph);
