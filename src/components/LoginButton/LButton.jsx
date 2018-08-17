import React, { Component } from "react";
import "./CusLoginBtn.css";
class LoginBtn extends Component {
  state = {
    name: this.props.nName
  };

  render() {
    return (
      <React.Fragment>
        <button className="btnUp " onClick={this.props.onPopup}>
          Log In!
        </button>
        <div className="popup" id="myPopup">
          <form onSubmit={this.props.onSubmit}>
            <input
              type="text"
              value={this.state.value}
              onChange={this.props.onName}
            />
            <button type="submit">Submit</button>
          </form>
        </div>
      </React.Fragment>
    );
  }
}

export default LoginBtn;
