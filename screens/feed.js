'use strict'
import React from 'react'
import {
	View,
	StyleSheet,
	FlatList,
	Dimensions,
	Animated,
	Text,
	TouchableOpacity,
	LayoutAnimation,
	Modal,
	TouchableNativeFeedback,
	Clipboard
} from 'react-native'

import io from "socket.io-client"
import Header from '../components/header'
import FeedCard from '../components/feedcard'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

import search from "../util/search"
import share from "../util/share"

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addScan } from '../redux/actions'

const {width, height} = Dimensions.get('screen')


function NewScansPopup (props) {
	return (
		<Animated.View
			style={{
				position: "absolute",
				top: props.top,
				zIndex: 100,
				width: width,
				alignItems: "center",
				justifyContent: "center"
			}}
		>
			<TouchableOpacity
				onPress={props.onPress}
				style={{
					backgroundColor: "white",
					elevation: 4,
					borderRadius: 50
				}}
			>
				<Text
					style={{
						color: "#E94B3C",
						fontWeight: "bold",
						fontSize: 14,
						paddingHorizontal: 15,
						paddingVertical: 5
					}}
				>new scans</Text>
			</TouchableOpacity>
		</Animated.View>
	)
}

class Discover extends React.Component {

	constructor (props) {
		super(props)
		this.loadingScans = false,
		this.state = {
			scans: [],
			newScans: false,
			newScansPopupTop: new Animated.Value(0),
			errorModalVisible: false
		}
		this.loadScans()
		this.loadedTimes = 0
		this.scansWaiting = []
	}

	componentDidMount() {
		this.socket = io("http://35.182.114.166:3000/live-scans")
		this.socket.on("new", this.pushToFeed)
	}

	toggleNewScansPopopTop = (show) => {
		Animated.timing(this.state.newScansPopupTop, {
			toValue: show ? height * 0.1 : 0,
			duration: 150
		}).start()
	}

	pushToFeed = (scan) => {
		if (this.state.scans[0])
			scan = scan.filter(item => item.time > this.state.scans[0].time)	

		this.scansWaiting = scan.concat(this.scansWaiting)
		this.toggleNewScansPopopTop(true)
	}

	loadScans = () => {
		if (this.loadingScans || this.currentResultsEnded || this.loadedTimes > 3)
			return

		this.loadingScans = true
		this.loadedTimes++

		fetch(`${this.props.url}/products/scans?before=${encodeURIComponent(this.state.scans[this.state.scans.length - 1]?.time || Date.now())}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				Authorization: this.props.profile.authToken
			}
		}).then(response => response.json())
		.then((responseJson) => {
			this.setState({loadingMore: false})
			if (responseJson.data?.length > 0) {
				LayoutAnimation.configureNext(LayoutAnimation.create(
					200,
					LayoutAnimation.Types.easeOut,
					LayoutAnimation.Properties.opacity,
				))
				this.setState({scans: this.state.scans.concat(responseJson.data)})
			}
			else {
				this.currentResultsEnded = true
			}
			this.loadingScans = false
		})
		.catch((error) => {
			alert("Request failed, make sure you have a working internet connection")
			this.loadingScans = false
		})
	}

	onNewScansPopupPress = () => {
		this.setState({scans: this.scansWaiting.concat(this.state.scans)})
		this.scansWaiting = []
		this.list.scrollToOffset({ animated: true, offset: 0 })
		this.toggleNewScansPopopTop(0)
	}

	onScanPress = (item) => {
		if (!item.generic)
			try {
				fetch(`${this.props.url}/products/${item.ID}?n=5&jc=1`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						Authorization: this.props.profile.authToken
					}
				}).then(response => response.json())
				.then((responseJson) => {
					if (responseJson.status !== 200)
						return this.setState({qrErrorValue: item.name, errorModalVisible: true})
					this.props.addScan({...responseJson.data, ID: item.ID, hiddenFromHistory: true})
					let data
					setTimeout(() => {
						data = this.props.scans.find(scan => scan.ID == item.ID)
						this.props.navigation.navigate("Preview", {data, cantreview: true})
					}, 0)
				})
			} catch (error) {
				console.error(error)
				alert("Request failed, make sure you have a working internet connection")
				return this.setState({qrErrorValue: item.name, errorModalVisible: true})
			}
		else {
			this.props.addScan({name: item.name, generic: true, ID: Date.now()})
			this.setState({qrErrorValue: item.name, errorModalVisible: true})
		}
	}

	copyToClipboard = (val) => {
		Clipboard.setString(val)
	}

	render () {
		return (
			<View style={styles.container}>
				<NewScansPopup onPress={this.onNewScansPopupPress} top={this.state.newScansPopupTop}/>
				<Header title="Scans Feed" onPress={() => this.props.navigation.toggleDrawer()}/>
				<FlatList
					data={this.state.scans}
					renderItem={({item, index}) => (
						<View style={{borderRadius: 15, overflow: 'hidden', marginTop: width * 0.02}}>
						<TouchableNativeFeedback
							useForeground={true}
							background={TouchableNativeFeedback.Ripple('rgba(0, 0, 0, 0.2)', false)}
							onPress={() => this.onScanPress(item)}
							style={{borderRadius: 15}}
						>
							<View>
								<FeedCard item={item}/>
							</View>
						</TouchableNativeFeedback>
						</View>
					)}
					contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: width * 0.04}}
					onEndReached={this.loadScans}
					onEndReachedThreshold={0.15}
					ref={ref => this.list = ref}
					keyExtractor={item => item._id}
					maintainVisibleContentPosition
				/>
				<Modal
					animationType="slide"
					transparent={true}
					visible={this.state.errorModalVisible}
					onRequestClose={() => this.setState({errorModalVisible: false})}
					hardwareAccelerated
					statusBarTranslucent
				>
					<View style={{flex: 1, backgroundColor: "rgba(0,0,0,0.2)", alignItems: 'center', justifyContent: "center"}}>
						<View style={styles.modalContainer}>
							<TouchableOpacity style={{position: 'absolute', top: width * 0.0425, right: '5%'}} onPress={() => this.setState({errorModalVisible: false})}>
								<AntDesign name="closesquare" size={25}/>
							</TouchableOpacity>
							<Text style={styles.modalTitle}>Scan Result</Text>
							<Text style={styles.modalText}><Text style={{fontWeight: "bold"}}>Value:</Text> <Text style={{color: "#E94B3C"}}>{this.state.qrErrorValue}</Text></Text>
							<View style={[styles.row, styles.modalButtons]}>
								<TouchableOpacity style={[styles.row, styles.modalButton]} onPress={() => this.copyToClipboard(this.state.qrErrorValue)}>
									<Text style={styles.modalButtonText}>COPY </Text>
									<AntDesign name="copy1" size={23}/>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.row, styles.modalButton]} onPress={() => share({name: this.state.qrErrorValue, generic: true})}>
									<Text style={styles.modalButtonText}>SHARE </Text>
									<Entypo name="share" size={23}/>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.row, styles.modalButton]} onPress={() => search(this.state.qrErrorValue)}>
									<Text style={styles.modalButtonText}>OPEN </Text>
									<AntDesign name="link" size={23}/>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</Modal>
			</View>
		)
	}
}

const mapDispatchToProps = dispatch => (
	bindActionCreators({
		addScan
	}, dispatch)
)

const mapStateToProps = (state) => {
	const { scans, profile, url } = state
	return { scans, profile, url }
}

export default connect(mapStateToProps, mapDispatchToProps)(Discover)

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F1F1F1"
	},

	modalText: {
		fontSize: 18,
		padding: width * 0.1
	},

	modalTitle: {
		textAlign: 'left',
		alignSelf: 'flex-start',
		fontWeight: "bold",
		fontSize: 20,
		marginLeft: '5%'
	},

	modalButtons: {
		width: '100%',
		justifyContent: 'space-between',
		alignItems: 'center'
	},

	modalButton: {
		width: '33.33%',
		justifyContent: 'center',
		alignItems: 'center',
		padding: '5%'
	},

	row: {
		flexDirection: 'row'
	},

	modalButtonText: {
		fontSize: 16
	},

	modalContainer: {
		borderRadius: 3,
		backgroundColor: 'whitesmoke',
		elevation: 10,
		width: width * 0.85,
		height: height * 0.5,
		alignItems: "center",
		justifyContent: "space-between",
		overflow: 'hidden',
		marginBottom: height * 0.05,
		paddingTop: width * 0.0425
	}
})