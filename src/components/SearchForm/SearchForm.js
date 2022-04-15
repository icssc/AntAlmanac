import React, { PureComponent } from 'react';
import TermSelector from './TermSelector';
import { withStyles } from '@material-ui/core/styles';
import PrivacyPolicyBanner from '../App/PrivacyPolicyBanner';
import { updateFormValue, resetFormValues } from '../../actions/RightPaneActions';
import FuzzySearch from './FuzzySearch';
import LegacySearch from './LegacySearch';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    margin: {
        borderTop: 'solid 8px transparent',
        display: 'inline-flex',
    },
};

class SearchForm extends PureComponent {
    onFormSubmit = (event) => {
        event.preventDefault();
        this.props.toggleSearch();
    };

    render() {
        const { classes } = this.props;

        return (
            <form onSubmit={this.onFormSubmit}>
                <div className={classes.container}>
                    <div className={classes.margin}>
                        <TermSelector changeState={updateFormValue} fieldName={'term'} />
                    </div>

                    <div className={classes.container}>
                        <FuzzySearch toggleSearch={this.props.toggleSearch} />
                    </div>

                    <LegacySearch onSubmit={() => this.props.toggleSearch()} onReset={resetFormValues} />

                    <PrivacyPolicyBanner />
                </div>
            </form>
        );
    }
}

export default withStyles(styles)(SearchForm);
