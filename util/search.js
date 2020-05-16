import React from 'react'
import {Linking} from 'react-native'

const search = async (val) => {
    try {
        const supported = await Linking.canOpenURL(val)
        await Linking.openURL(supported ? val : "https://www.google.com/search?q=" + val)
    } catch (e) {
        alert("There was an error while trying to search for " + val)
    }
}

export default search