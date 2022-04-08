import React, { PureComponent } from 'react';
import { AssignmentReturn, AssignmentReturned, SaveAlt } from '@material-ui/icons';
import { Button } from '@material-ui/core';
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
        console.log(user);
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
