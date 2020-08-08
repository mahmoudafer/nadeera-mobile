import React from 'react'
import { View, Dimensions, StyleSheet, TouchableOpacity, TouchableNativeFeedback } from 'react-native'

const { height } = Dimensions.get('screen')
import Text from "../components/apptext"

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { logout } from '../redux/actions'

class DrawerContent extends React.Component {

	render () {
		return (
				<View style={styles.container}>
					<View>
						<View style={styles.logo}>
							{/* <Image source={require("../assets/nadeera.png")} style={{width: 40, height: 40, marginRight: "3%"}}/> */}
							<Text style={{fontSize: 30, color: "#2D2926", fontWeight: "bold"}}>Nadeera</Text>
						</View>
						<TouchableNativeFeedback onPress={this.props.navigation.closeDrawer}>
							<View style={styles.button}>
								<Entypo color="#E94B3C" name="users" size={28}/>
								<Text style={styles.buttonText}>Users</Text>
							</View>
						</TouchableNativeFeedback>
					</View>
					{
						this.props.profile?.access_token ?
						<View style={{flexDirection: "column", alignItems: 'center'}}>
							<Text>Logged in as {this.props.profile.firstname} {this.props.profile.lastname}</Text>
							<TouchableOpacity onPress={this.props.logout}>
								<Text style={{color: "#E94B3C"}}>LOGOUT</Text>
							</TouchableOpacity>
						</View> :
						<TouchableOpacity style={styles.loginButton} onPress={() => this.props.navigation.replace("Login")}>
							<AntDesign color="#E94B3C" name="user" size={23}/>
							<Text>LOGIN</Text>
						</TouchableOpacity>
					}
				</View>
		)
	}
}

const mapDispatchToProps = dispatch => (
	bindActionCreators({
		logout
	}, dispatch)
)

const mapStateToProps = (state) => {
	const { profile, url } = state
	return { profile, url }
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawerContent)

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
		flex: 1,
		justifyContent: 'space-between',
		paddingBottom: height * 0.03
	},

	loginButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},

	logo: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: "7%",
		marginBottom: "10%"
	},

	button: {
		paddingVertical: "3.5%",
		paddingLeft: "7%",
		flexDirection: "row",
		alignItems: "center"
	},

	buttonText: {
		fontSize: 16,
		marginLeft: "5%"
	}
})