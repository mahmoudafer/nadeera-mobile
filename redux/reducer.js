import { combineReducers } from 'redux'

const INITIAL_STATE = {
	profile: {},
	url: "http://192.168.43.46:8000"
}

const profileReducer = (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case 'SET_PROFILE':
			state = {...state, ...action.payload}
			return {...state}
		default:
			return state
	}
}

const urlReducer = (state = INITIAL_STATE, action) => {
	return state
}

const appReducer = combineReducers({
	profile: profileReducer,
	url: urlReducer
})

const rootReducer = (state = INITIAL_STATE, action) => {
	if (action.type === 'LOGOUT') {
		state = {...INITIAL_STATE}
	}
	return appReducer(state, action)
}

export default rootReducer