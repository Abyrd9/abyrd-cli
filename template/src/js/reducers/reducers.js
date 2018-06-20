import produce from 'immer';

const INITIAL_STATE = {
  value: ''
}

export default (state = INITIAL_STATE, action) => {
  produce(state, draft => {
    switch(action.type) {
      case 'VALUE':
          draft.value = action.payload;
    }
  })
}