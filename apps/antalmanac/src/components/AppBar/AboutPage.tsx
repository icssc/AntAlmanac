import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link } from '@material-ui/core';
import { Info } from '@material-ui/icons';
import { PureComponent } from 'react';

import analyticsEnum, { logAnalytics } from '$lib/analytics';

class AboutPage extends PureComponent {
    state: { isOpen: boolean } = {
        isOpen: false,
    };

    // handleClose = () => {
    //     this.setState({ isOpen: false })
    // }

    render() {
        return (
            <>
                <Button
                    onClick={() => {
                        this.setState({ isOpen: true });
                        logAnalytics({
                            category: analyticsEnum.nav.title,
                            action: analyticsEnum.nav.actions.CLICK_ABOUT,
                        });
                    }}
                    color="inherit"
                    startIcon={<Info />}
                >
                    About
                </Button>
                <Dialog open={this.state.isOpen} onClose={() => this.setState({ isOpen: false })}>
                    <DialogTitle>About</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            AntAlmanac is a schedule planning tool for UCI students.
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
                            .
                            <br />
                            <br />
                            This website is maintained by the{' '}
                            <Link target="_blank" href="https://studentcouncil.ics.uci.edu/">
                                ICS Student Council
                            </Link>{' '}
                            Projects Committee and built by students from the UCI community.
                            <br />
                            <br />
                            <Link target="_blank" href="https://github.com/icssc/AntAlmanac/contributors">
                                <img
                                    src="https://contrib.rocks/image?repo=icssc/antalmanac"
                                    width={'100%'}
                                    alt="AntAlmanac Contributors"
                                />
                            </Link>
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
