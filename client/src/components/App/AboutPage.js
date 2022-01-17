import React, { Fragment, PureComponent } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link } from '@material-ui/core';
import { Info } from '@material-ui/icons';
import ReactGA from 'react-ga';

class AboutPage extends PureComponent {
    state = {
        isOpen: false,
    };
    render() {
        return (
            <Fragment>
                <Button
                    onClick={(event) => {
                        this.setState({ isOpen: true });
                        ReactGA.event({
                            category: 'antalmanac-rewrite',
                            action: 'Click "About"',
                        });
                    }}
                    color="inherit"
                    startIcon={<Info />}
                >
                    About
                </Button>
                <Dialog open={this.state.isOpen}>
                    <DialogTitle>About</DialogTitle>
                    <DialogContent>
                        <DialogContentText>This is the about page.</DialogContentText>

                        <Link
                            href="#"
                            onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
                            color="primary"
                        >
                            Check out the ICSSC Website!
                        </Link>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ isOpen: false })} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Fragment>
        );
    }
}

export default AboutPage;
