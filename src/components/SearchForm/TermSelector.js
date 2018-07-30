import React, {Component} from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

class TermSelector extends Component {
    constructor(props) {
        super(props);

        this.state = {
            term: '2018-92',
        };

        this.handleChange = this.handleChange.bind(this);
    }

  handleChange(event) {
      this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    return (
       <FormControl>
           <InputLabel htmlFor="term-select">ijk</InputLabel>
          <Select
            value={this.state.term}
            onChange={this.handleChange}
            inputProps={{name:"term", id:"term-select"}}
            autoWidth
          >
            <MenuItem value={"2018-92"}>2018  Fall Quarter</MenuItem>
  			    <MenuItem value={"2018-76"}>2018  Summer Session 2</MenuItem>
  			    <MenuItem value={"2018-51"}>2018  Summer Qtr (COM)</MenuItem>
  			    <MenuItem value={"2018-39"}>2018  10-wk Summer</MenuItem>
  			    <MenuItem value={"2018-25"}>2018  Summer Session 1</MenuItem>
  			    <MenuItem value={"2018-14"}>2018  Spring Quarter</MenuItem>
  			    <MenuItem value={"2018-03"}>2018  Winter Quarter</MenuItem>
  			    <MenuItem value={"2017-92"}>2017  Fall Quarter</MenuItem>
  			    <MenuItem value={"2017-76"}>2017  Summer Session 2</MenuItem>
  			    <MenuItem value={"2017-51"}>2017  Summer Qtr (COM)</MenuItem>
  			    <MenuItem value={"2017-39"}>2017  10-wk Summer</MenuItem>
  			    <MenuItem value={"2017-25"}>2017  Summer Session 1</MenuItem>
  			    <MenuItem value={"2017-14"}>2017  Spring Quarter</MenuItem>
  			    <MenuItem value={"2017-03"}>2017  Winter Quarter</MenuItem>
  			    <MenuItem value={"2016-92"}>2016  Fall Quarter</MenuItem>
  			    <MenuItem value={"2016-76"}>2016  Summer Session 2</MenuItem>
  			    <MenuItem value={"2016-51"}>2016  Summer Qtr (COM)</MenuItem>
  			    <MenuItem value={"2016-39"}>2016  10-wk Summer</MenuItem>
  			    <MenuItem value={"2016-25"}>2016  Summer Session 1</MenuItem>
  			    <MenuItem value={"2016-14"}>2016  Spring Quarter</MenuItem>
  			    <MenuItem value={"2016-03"}>2016  Winter Quarter</MenuItem>
  			    <MenuItem value={"2015-92"}>2015  Fall Quarter</MenuItem>
  			    <MenuItem value={"2015-76"}>2015  Summer Session 2</MenuItem>
  			    <MenuItem value={"2015-51"}>2015  Summer Qtr (COM)</MenuItem>
  			    <MenuItem value={"2015-39"}>2015  10-wk Summer</MenuItem>
  			    <MenuItem value={"2015-25"}>2015  Summer Session 1</MenuItem>
  			    <MenuItem value={"2015-14"}>2015  Spring Quarter</MenuItem>
  			    <MenuItem value={"2015-03"}>2015  Winter Quarter</MenuItem>
  			    <MenuItem value={"2014-92"}>2014  Fall Quarter</MenuItem>
  			    <MenuItem value={"2014-76"}>2014  Summer Session 2</MenuItem>
  			    <MenuItem value={"2014-51"}>2014  Summer Qtr (COM)</MenuItem>
  			    <MenuItem value={"2014-39"}>2014  10-wk Summer</MenuItem>
  			    <MenuItem value={"2014-25"}>2014  Summer Session 1</MenuItem>
  			    <MenuItem value={"2014-14"}>2014  Spring Quarter</MenuItem>
  			    <MenuItem value={"2014-03"}>2014  Winter Quarter</MenuItem>
  			    <MenuItem value={"2013-92"}>2013  Fall Quarter</MenuItem>
  			    <MenuItem value={"2013-76"}>2013  Summer Session 2</MenuItem>
  			    <MenuItem value={"2013-51"}>2013  Summer Qtr (COM)</MenuItem>
  			    <MenuItem value={"2013-39"}>2013  10-wk Summer</MenuItem>
  			    <MenuItem value={"2013-25"}>2013  Summer Session 1</MenuItem>
  			    <MenuItem value={"2013-14"}>2013  Spring Quarter</MenuItem>
  			    <MenuItem value={"2013-03"}>2013  Winter Quarter</MenuItem>
          </Select>
       </FormControl>
    );
  }
}

export default TermSelector;
