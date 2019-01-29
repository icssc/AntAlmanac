import DeptSearchBar from "./DeptSearchBar/DeptSearchBar";
import GESelector from "./GESelector/GESelector";
import TermSelector from "./TermSelector";
import React, {Component} from "react";
import Button from "@material-ui/core/Button";
import {withStyles} from '@material-ui/core/styles';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    search: {
        display: 'flex',
        justifyContent: 'center',
        borderTop: 'solid 8px transparent',
        boxSizing: 'border-box'
    },
    margin: {
        borderTop: 'solid 8px transparent',
        boxSizing: 'border-box'
    }
};

class SearchForm extends Component {
    constructor(props) {
        super(props);
        this.state = {dept: null, ge: "ANY", term: "2019 Winter"};
        this.setDept = this.setDept.bind(this);
        this.setGE = this.setGE.bind(this);
        this.setTerm = this.setTerm.bind(this);
    }

    componentDidMount() {
        document.addEventListener("keydown", this.enterEvent, false);
    }

    componentWillUnmount() {
        document.addEventListener("keydown", this.enterEvent, false);
    }

    enterEvent = event => {
        const charCode = event.which ? event.which : event.keyCode;
        if (
            (charCode === 13 || charCode === 10) &&
            document.activeElement.id === "downshift-0-input"
        ) {
            this.props.updateFormData(this.state);
            event.preventDefault();

            return false;
        }
    };

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return this.state !== nextState;
    }

    setDept(dept) {
        this.setState({dept: dept === null ? null : dept.value});
    }

    setGE(ge) {
        this.setState({ge: ge});
    }

    setTerm(term) {
        this.setState({term: term});
    }

    render() {
        const {classes} = this.props;

        return (
            <div className={classes.container}>
                <div className={classes.margin}>
                    <DeptSearchBar setDept={this.setDept}/>
                </div>

                <div className={classes.margin}>
                    <GESelector setGE={this.setGE}/>
                </div>

                <div className={classes.margin}>
                    <TermSelector setTerm={this.setTerm}/>
                </div>

                <div className={classes.search}>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => this.props.updateFormData(this.state)}
                    >
                        Search
                    </Button>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(SearchForm);
