import React from 'react'
import { View, Dimensions, StyleSheet, TouchableOpacity } from 'react-native'
const { height, width } = Dimensions.get('screen')
import Text from "../components/apptext"
import Entypo from 'react-native-vector-icons/Entypo'

export default function Header(props) {
	return (
		<View style={{...styles.container, ...props.style}}>
			<TouchableOpacity onPress={props.onPress} style={{position: 'absolute', top: height * 0.05 - 27.5, left: width * 0.1}}>
				<Entypo name="menu" size={30}/>
			</TouchableOpacity>
            <Text style={styles.title}>{props.title}</Text>
			{props.right}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
		height: height * 0.08,
		width: width,
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
        elevation: 5,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
		paddingBottom: height * 0.015,
		zIndex: 100
    },
    
    title: {
        fontSize: 25,
        fontWeight: "bold",
		color: "#E94B3C",
		fontFamily: 'notoserif',
    }
})