import { combineReducers } from 'redux'

const INITIAL_STATE = {
	scans: [],
	profile: {},
	url: "https://scanprechase.com"
}

const scansReducer = (state = INITIAL_STATE, action) => {
	let index
	try {
		index = state.findIndex(item => item.ID == (action.type !== 'TOGGLE_FAVORITE_SCAN' && action.type !== 'REMOVE_SCAN'? action.payload.ID : action.payload))
	} catch (err) {
		index = -1
	}
	switch (action.type) {
		case 'ADD_SCAN':
			if (index != -1)
				state[index] = {...action.payload, favorite: state[index].favorite}
			else
				state.push({...action.payload, favorite: false})
			return [...state]
		case 'TOGGLE_FAVORITE_SCAN':
			state[index].favorite = !state[index].favorite
			return [...state]
		case 'REMOVE_SCAN':
			state.splice(index, 1)
			return [...state]
		case 'ADD_RATING':
			if (!action.payload.existing) {
				state[index].reviews.unshift(action.payload)
				state[index].ratingsCount++
				state[index].ratings[["one", "two", "three", "four", "five"][action.payload.stars - 1]]++
			} else {
				const previous = state[index].reviews.find(r => r.email === action.payload.email)
				state[index].ratings[["one", "two", "three", "four", "five"][action.payload.stars - 1]]++
				state[index].ratings[["one", "two", "three", "four", "five"][previous.stars - 1]]--
				Object.assign(previous, {...action.payload, existing: undefined})
			}
			return [...state]
		case 'DELETE_REVIEW':
			state[index].ratingsCount--
			state[index].ratings[["one", "two", "three", "four", "five"][action.payload.stars - 1]]--
			const reviewIndex = state[index].reviews.findIndex(r => r.email == action.payload.email)
			state[index].reviews.splice(reviewIndex, 1)
			return [...state]
		default:
			return state
	}
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
	scans: scansReducer,
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