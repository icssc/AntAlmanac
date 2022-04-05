import React, { PureComponent } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link } from '@material-ui/core';
import { Info } from '@material-ui/icons';
import ReactGA from 'react-ga';

class AboutPage extends PureComponent {
    state = {
        isOpen: false,
    };
    render() {
        return (
            <>
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
                        <DialogContentText>
                            AntAlmanac is a schedule planning tool for UCI students.
                            <br />
                            <br />
                            The website is maintained by the{' '}
                            <Link target="_blank" href="https://studentcouncil.ics.uci.edu/">
                                ICS Student Council
                            </Link>{' '}
                            Projects Committee.
                            <br />
                            <br />
                            Interested in helping out? Join our{' '}
                            <Link target="_blank" href="https://discord.gg/GzF76D7UhY">
                                Discord
                            </Link>{' '}
                            or checkout the{' '}
                            <Link target="_blank" href="https://github.com/icssc/AntAlmanac">
                                code on GitHub
                            </Link>
                            .<br />
                            <br />
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ isOpen: false })} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}

export default AboutPage;
