import React, { PureComponent } from 'react';
import { AssignmentReturn, AssignmentReturned, SaveAlt } from '@material-ui/icons';
import { Button, Avatar, Box } from '@material-ui/core';
import { login, logout, checkUser, loadUser, saveUser, loadSchedule } from '../../actions/AppStoreActions';

import { AUTH_ENDPOINT } from '../../api/endpoints';

class AccountBase extends PureComponent {
    state = {
        user: null,
    };

    handleOpen = () => {
        window.location.href = AUTH_ENDPOINT + '/google';
    };
    async componentDidMount() {
        const user = await checkUser();
        this.setState({ user: user });
        if (!user || !(await loadUser(user))) {
            if (typeof Storage !== 'undefined') {
                const savedUserID = window.localStorage.getItem('userID');
                if (savedUserID != null) {
                    loadSchedule(savedUserID, true);
                }
            }
        }
    }

    render() {
        return (
            <>
                {this.state.user ? (
                    <>
                        <Avatar
                            alt={this.state.user.passport.user.name}
                            src={this.state.user.passport.user.picture}
                            style={{ marginRight: 5, width: 25, height: 25 }}
                        ></Avatar>
                        <Box style={{ fontSize: '0.9rem', fontWeight: 500, marginRight: 5 }}>
                            {this.state.user.passport.user.name.toLocaleUpperCase()}
                        </Box>
                        <Button onClick={logout} color="inherit" startIcon={<AssignmentReturn />}>
                            Logout
                        </Button>
                        <Button onClick={() => saveUser(this.state.user)} color="inherit" startIcon={<SaveAlt />}>
                            Save User
                        </Button>
                    </>
                ) : (
                    <Button onClick={login} color="inherit" startIcon={<AssignmentReturned />}>
                        Login
                    </Button>
                )}
            </>
        );
    }
}
export default AccountBase;
