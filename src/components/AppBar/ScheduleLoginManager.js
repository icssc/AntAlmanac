import React, { PureComponent } from 'react';
import { checkUser, loadUser, loadSchedule } from '../../actions/AppStoreActions';
import { LoadSchedule, SaveSchedule } from './LoadSaveFunctionality';
import AccountBase from './AccountBase';

class ScheduleLoginManager extends PureComponent {
    state = {
        user: null,
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
                <AccountBase user={this.state.user}></AccountBase>
                {this.state.user ? (
                    <LoadSchedule></LoadSchedule>
                ) : (
                    <>
                        <SaveSchedule></SaveSchedule> <LoadSchedule></LoadSchedule>
                    </>
                )}
            </>
        );
    }
}

export default ScheduleLoginManager;
