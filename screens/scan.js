'use strict'
import React from 'react'
import {
    View,
	StyleSheet,
	Dimensions,
	Linking,
	Platform,
	Modal,
	TouchableOpacity,
	Image,
	StatusBar
} from 'react-native'
import Clipboard from "@react-native-community/clipboard"
import Text from "../components/apptext"

import QRCodeScanner from 'react-native-qrcode-scanner'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

import search from "../util/search"
import share from "../util/share"

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addScan } from '../redux/actions'
import Header from '../components/header'

const {width, height} = Dimensions.get('screen')

class Scan extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			errorModalVisible: false
		}
	}

	componentDidMount() {
		if (Platform.OS === 'android') {
			Linking.getInitialURL().then(url => {
				this.navigate(url)
			})
		} else {
			Linking.addEventListener('url', this.handleOpenURL)
		}
	}

	componentWillUnmount() {
		Linking.removeEventListener('url', this.handleOpenURL)
	}
	
	handleOpenURL = (event) => {
		if (event.url)
		this.navigate(event.url)
	}
	
	navigate = (url) => {
		if (!url) return
		const route = url.replace(/.*?:\/\//g, '')
		const id = route.match(/\/([^\/]+)\/?$/)[1]
		this.onSuccess({data: id})
	}

	copyToClipboard = (val) => {
		Clipboard.setString(val)
	}

	onSuccess = async (e) => {
		if (/^#[\w]+$/.test(e.data))
			try {
				const id = e.data.substring(1, e.data.length)
				fetch(`${this.props.url}/products/${id}?n=5`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						Authorization: this.props.profile.authToken
					}
				}).then(response => response.json())
				.then((responseJson) => {
					if (responseJson.status !== 200)
						return this.setState({qrErrorValue: id, errorModalVisible: true})
					this.props.addScan({...responseJson.data, ID: id, hiddenFromHistory: false})
					let data
					setTimeout(() => {
						data = this.props.scans.find(scan => scan.ID == id)
						this.props.navigation.navigate("Preview", {data})
					}, 0)
				})
			} catch (error) {
				console.error(error)
				alert("Request failed, make sure you have a working internet connection")
				return this.setState({qrErrorValue: e.data, errorModalVisible: true})
			}
		else {
			this.props.addScan({generic: true, name: e.data, ID: Date.now()})
			this.setState({qrErrorValue: e.data, errorModalVisible: true})
		}
	}

	onFocus = this.props.navigation.addListener('focus', () => {
		this.scanner && this.scanner.reactivate()
	})

	render () {
		return (
            <View style={styles.container}>
				<StatusBar backgroundColor="white" barStyle="dark-content"/>
				<Header title="Scan" onPress={() => this.props.navigation.toggleDrawer()}/>
                <QRCodeScanner
                    ref={ref => this.scanner = ref}
                    onRead={this.onSuccess}
                    reactivateTimeout={1000}
					showMarker
					customMarker={<Image source={require("../assets/scan_icon.png")} style={{position: 'absolute', ...StyleSheet.absoluteFill, top: height * 0.42 - width * 0.35, left: width * 0.225, width: width * 0.55, height: width * 0.55}}/>}
					cameraStyle={styles.scanner}
					containerStyle={styles.cameraContainer}
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
							<TouchableOpacity style={{position: 'absolute', top: width * 0.0425, right: '5%'}} onPress={() => {this.setState({errorModalVisible: false}); this.scanner.reactivate()}}>
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

const styles = StyleSheet.create({
    container: {
        flex: 1
	},
	
	scanner: {
		height: height * 0.9,
		width: width
	},

	cameraContainer: {
		position: 'absolute',
		top: height * 0.05,
		width: width
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

const mapDispatchToProps = dispatch => (
    bindActionCreators({
		addScan
    }, dispatch)
)

const mapStateToProps = (state) => {
    const { scans, url, profile } = state
    return { scans, url, profile }
}

export default connect(mapStateToProps, mapDispatchToProps)(Scan)