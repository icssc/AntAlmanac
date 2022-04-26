import React, { PureComponent } from 'react';
import { AssignmentReturn, AssignmentReturned, SaveAlt } from '@material-ui/icons';
import { Button, Avatar, Box } from '@material-ui/core';
import { login, logout, saveUser } from '../../actions/AppStoreActions';

class AccountBase extends PureComponent {
    render() {
        const user = this.props.user;
        return (
            <>
                {user ? (
                    <>
                        <Avatar
                            alt={user.passport.user.name}
                            src={user.passport.user.picture}
                            style={{ marginRight: 5, width: 25, height: 25 }}
                        ></Avatar>
                        <Box style={{ fontSize: '0.9rem', fontWeight: 500, marginRight: 5 }}>
                            {user.passport.user.name.toLocaleUpperCase()}
                        </Box>
                        <Button onClick={logout} color="inherit" startIcon={<AssignmentReturn />}>
                            Logout
                        </Button>
                        <Button onClick={() => saveUser(user)} color="inherit" startIcon={<SaveAlt />}>
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
