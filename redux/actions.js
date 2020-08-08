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