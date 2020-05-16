'use strict'
import React from 'react'
import {
	View,
	StyleSheet,
	FlatList,
	LayoutAnimation,
	Dimensions,
	TouchableOpacity,
	TouchableNativeFeedback,
	Share,
	ScrollView,
	Image,
	TouchableWithoutFeedback
} from 'react-native'
import Entypo from 'react-native-vector-icons/Entypo'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Header from '../components/header'
import Text from "../components/apptext"

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setProfile, logout, toggleFavorite, removeScan } from '../redux/actions'

const {width, height} = Dimensions.get('screen')

let url

const share = async (data) => {
	try {
		const result = await Share.share({
			title: 'zolz testing',
			message: `Go check out ${data.name} by ${data.companyName} at ${url}/products/${data.ID}`
		})

		if (result.action === Share.sharedAction) {
			if (result.activityType) {

			}
		}
	} catch (error) {
		alert(error.message)
	}
}

function HistoryListItem (props) {
	return (
		<View style={{borderRadius: 10, overflow: "hidden", marginTop: width * 0.015,}}>
		<TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('rgba(0, 0, 0, 0.2)', false)} onPress={props.onPress} useForeground={true} disabled={props.item.generic}>
			<View style={styles.historyListItem}>
				<Image source={{uri: props.item.primaryImage}} style={{width: height * 0.12, height: height * 0.12, borderRadius: 10, marginTop: - width * 0.01, marginLeft: - width * 0.01}}/>
				<View>
					<Text style={styles.historyItemName}>{props.item.name}</Text>
					<Text style={styles.historyItemCompany}>{props.item.companyName}</Text>
				</View>
				<View
					style={{
						position: 'absolute',
						bottom: width * 0.02,
						right: width * 0.03,
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						width: '24%'
					}}	
				>
					<TouchableOpacity onPress={props.favorite}>
						<AntDesign name={props.item.favorite ? "heart" : "hearto"} color={props.item.favorite ? "#E94B3C" : "black"} size={21}/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => share(props.item, props.url)}>
						<Entypo name="share" size={24}/>
					</TouchableOpacity>
					<TouchableOpacity onPress={props.remove}>
						<Ionicons name="md-trash" size={26}/>
					</TouchableOpacity>
				</View>
			</View>
		</TouchableNativeFeedback>
		</View>
	)
}

class Profile extends React.Component {
	constructor(props) {
		super(props)
		this.state={
			activeList: 'Scans'
		}
		url = props.url
	}

	activeSelectorDesign = name => {
		return {
			backgroundColor: this.state.activeList === name ? "#E94B3C" : "whitesmoke",
			borderWidth: this.state.activeList === name ? 0 : 2,
			borderColor: "#E94B3C",
			width: "50%",
			height: "100%",
			justifyContent: "center",
			borderRadius: 30,
			paddingLeft: name === "Scans" && this.state.activeList === name ? 2 : 0,
			paddingRight: name === "Favorites" && this.state.activeList === name ? 2 : 0,
		}
	}

	ActivateList = name => {
		LayoutAnimation.configureNext(LayoutAnimation.create(
			300,
			LayoutAnimation.Types.easeOut,
			LayoutAnimation.Properties.scaleXY,
		))
		this.setState({activeList: name})
	}

	render () {
		return (
			<View style={styles.container}>
				<Header title="History" onPress={() => this.props.navigation.toggleDrawer()}/>
				{/* {
					this.props.profile.authToken ?  */}
				<ScrollView showsVerticalScrollIndicator={false}>
					<View style={styles.activeSelector}>
						<TouchableWithoutFeedback
							onPress={() => this.ActivateList("Scans")}
						>
							<View style={{...this.activeSelectorDesign("Scans"), borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0}}>
								<Text
									style={{...styles.activeSelectorText, color: this.state.activeList === "Scans" ? "white" : "#E94B3C",}}
								>
									Scans
								</Text>
							</View>
						</TouchableWithoutFeedback>
						<TouchableWithoutFeedback
							onPress={() => this.ActivateList("Favorites")}
						>
							<View style={{...this.activeSelectorDesign("Favorites"), borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeftWidth: 0}}>
								<Text
									style={{...styles.activeSelectorText, color: this.state.activeList === "Favorites" ? "white" : "#E94B3C",}}
								>
									Favorites
								</Text>
							</View>
						</TouchableWithoutFeedback>
					</View>
					<FlatList
						showsVerticalScrollIndicator={false}
						data={this.state.activeList === "Scans" ? this.props.scans.filter(shi => !shi.hiddenFromHistory) : this.props.scans.filter(shi => shi.favorite)}
						renderItem={({item, index}) => (
							<HistoryListItem
								item={item}
								favorite={() => this.props.toggleFavorite(item.ID)}
								remove={() => this.props.removeScan(item.ID)}
								onPress={() => this.props.navigation.navigate("Preview", {data: item})}
							/>
						)}
						style={styles.historyList}
						keyExtractor={(item, key) => item.id}
						contentContainerStyle={{paddingBottom: width * 0.015}}
					/>
				</ScrollView>
					{/* :
						<View style={{alignItems: 'center', justifyContent: "center", flex: 1}}>
							<Text>You must be signed in to view history</Text>
							<TouchableOpacity onPress={() => this.props.navigation.navigate("Login")}>
								<Text style={{backgroundColor: "#E94B3C", padding: 10, marginTop: height * 0.02, borderRadius: 100, color: "white", width: width * 0.3, textAlign: "center", fontSize: 17}}>Login</Text>
							</TouchableOpacity>
						</View>
				} */}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor:'whitesmoke'
	},

	historyListItem: {
		backgroundColor: 'white',
		height: height * 0.12,
		borderRadius: 10,
		padding: width * 0.01,
		flexDirection: 'row'
	},

	historyList: {
		width: width * 0.97,
		alignSelf: 'center'
	},

	activeSelector: {
		borderRadius: 30,
		flexDirection: "row",
		alignItems: 'center',
		justifyContent: "center",
		marginTop: height * 0.015,
		marginBottom: height * 0.01,
		width: width * 0.7,
		height: 37,
		alignSelf:'center',
		backgroundColor: 'whitesmoke',
		overflow:'hidden',
	},

	activeSelectorText: {
		fontSize: 18,
		alignSelf: "center",
		textAlign: 'center',
		borderRadius: 30,
		paddingBottom: 3
	},
	
	historyItemName: {
		fontFamily: 'sans-serif-light',
		fontSize: 25,
		fontWeight: 'bold',
		marginLeft: width * 0.02
	},

	historyItemCompany: {
		fontSize: 17,
		marginLeft: width * 0.02
	}
})

const mapDispatchToProps = dispatch => (
	bindActionCreators({
		setProfile,
		logout,
		toggleFavorite,
		removeScan
	}, dispatch)
)

const mapStateToProps = (state) => {
	const { scans, profile, url } = state
	return { scans, profile, url }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)