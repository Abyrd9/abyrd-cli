import React, { Component } from 'react';
const Theme = React.createContext('theme');
import produce from 'immer';

class ContextTheme extends Component {
  constructor() {
    super();
    this.state = {
      value: ''
    }
  }

  changeValue = (payload) => {
    this.setState(
      produce(draft => {
        draft.value = payload;
      })
    )
  }

  render() {
    return (
      <Theme.Provider value={{
        value: this.state.value,
        changeValue: this.changeValue,
      }}>
        {this.props.children}
      </Theme.Provider>
    );
  }
}

export default ContextTheme;