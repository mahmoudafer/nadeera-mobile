'use strict'
import React from 'react'
import {
	Text,
} from 'react-native'

export default function AppText ({children, ...props}) {
    return <Text {...props} allowFontScaling={false}>{children}</Text>
}