import Grid from "@material-ui/core/Grid";
import DeptSearchBar from "./DeptSearchBar/DeptSearchBar";
import GESelector from "./GESelector/GESelector";
import TermSelector from "./TermSelector";
import React, {Component} from "react";
import Button from "@material-ui/core/Button";

class SearchForm extends Component {
    constructor(props) {
        super(props);
        this.state = {dept: null, ge: 'ANY', term: '2018 Fall'};
        this.setDept = this.setDept.bind(this);
        this.setGE = this.setGE.bind(this);
        this.setTerm = this.setTerm.bind(this);

    }

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

    }

    render() {
        return (
            <form style={{margin: '15px 10px 0px 10px'}}>
                <Grid container spacing={8} alignItems='center'>
                    <Grid item lg={3}>
                        <DeptSearchBar setDept={this.setDept}/>
                    </Grid>

                    <Grid item lg={3}>
                        <GESelector setGE={this.setGE}/>
                    </Grid>

                    <Grid item lg={3}>
                        <TermSelector setTerm={this.setTerm}/>
                    </Grid>

                    <Grid item lg={3}>
                        <Button
                            color='primary'
                            variant='contained'
                            onClick={() => this.props.updateFormData(this.state)}>Search</Button>
                    </Grid>
                </Grid>
            </form>
        )
    }
}

export default SearchForm;