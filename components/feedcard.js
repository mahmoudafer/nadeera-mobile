import React from 'react'
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
} from 'react-native'
import epochToTime from '../util/epochtotime'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Text from "../components/apptext"

const {width, height} = Dimensions.get('screen')

const FeedCard = props => {
	return (
		<View style={styles.container}>
			<Image source={{uri: props.item.img}} style={{width: width * 0.45, height: width * 0.45, borderTopLeftRadius: 15, borderTopRightRadius: 15}}/>
            <View style={styles.data}>
                <Text style={styles.title}>{props.item.name}</Text>
                <Text style={styles.price}>LBP {props.item.price}</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text style={styles.time}>{epochToTime(props.item.time)}</Text>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Text style={styles.rating}>{props.item.rating}</Text>
                        <FontAwesome name="star" size={11} color="#777" style={{paddingTop: "1.5%", marginLeft: width * 0.008}}/>
                    </View>
                </View>
            </View>
		</View>
	)
}

export default FeedCard 

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        borderRadius: 15,
        width: width * 0.45,
		zIndex: -1,
		elevation: -1
    },

    title: {
        fontSize: 17,
    },

    data: {
        padding: width * 0.03,
        paddingTop: width * 0.015,
        justifyContent: 'space-between'
    },

    price: {
        color: "#E94B3C",
        fontSize: 17,
    },

    rating: {
        color: "#777"
    },

    time: {
        color: "#777"
    }
})