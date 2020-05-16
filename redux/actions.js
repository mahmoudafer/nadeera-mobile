export const addScan = scanObj => (
	{
		type: 'ADD_SCAN',
		payload: scanObj,
	}
)

export const removeScan = index => (
	{
		type: 'REMOVE_SCAN',
		payload: index,
	}
)

export const toggleFavorite = index => (
	{
		type: 'TOGGLE_FAVORITE_SCAN',
		payload: index
	}
)

export const setProfile = profile => (
	{
		type: 'SET_PROFILE',
		payload: profile
	}
)

export const logout = () => (
	{
		type: 'LOGOUT',
	}
)

export const addRating = rating => (
	{
		type: 'ADD_RATING',
		payload: rating
	}
)

export const deleteReview = ID => (
	{
		type: "DELETE_REVIEW",
		payload: ID
	}
)