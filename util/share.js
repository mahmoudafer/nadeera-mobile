import React from 'react'
import {Share} from 'react-native'

const share = async (data) => {
	try {
        const message = data.generic ? `${data.name}\n\nscanned with Prechase` : `Go check out ${data.name} by ${data.companyName} at https://scanprechase/products/${data.ID}`
		const result = await Share.share({
			title: 'Prechase Share',
			message
		})

		if (result.action === Share.sharedAction) {
			if (result.activityType) {

			}
		}
	} catch (error) {
		alert(error.message)
	}
}

export default share