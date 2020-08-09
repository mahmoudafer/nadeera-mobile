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
	ScrollView,
	TouchableWithoutFeedback,
	Image
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

class Profile extends React.Component {

	constructor (props) {
		super(props)

		this.state = {
			users: []
		}
	}
	fetchUsers = async () => {
		if (!this.props.profile.access_token) return
		let users = await fetch(`${this.props.url}/api/auth/users`, {
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + this.props.profile.access_token
			}
		})
		users = await users.json()
		
		this.setState({users})
	}

	componentDidMount() {
		this.fetchUsers()
	}

	render () {
		return (
			<View style={styles.container}>
				<Header title="Users" onPress={() => this.props.navigation.toggleDrawer()}/>
				{
					this.props.profile.access_token ? 
						<FlatList
							showsVerticalScrollIndicator={false}
							data={this.state.users}
							renderItem={({item: {firstname, lastname}, index}) => <Text style={styles.userItem}>{firstname} {lastname}</Text>}
							style={styles.historyList}
							keyExtractor={(item, key) => item.id}
							contentContainerStyle={{paddingBottom: width * 0.015}}
						/>
					:
						<View style={{alignItems: 'center', justifyContent: "center", flex: 1}}>
							<Text>You must be signed in to view users</Text>
							<TouchableOpacity onPress={() => this.props.navigation.navigate("Login")}>
								<Text style={{backgroundColor: "#E94B3C", padding: 10, marginTop: height * 0.02, borderRadius: 100, color: "white", width: width * 0.3, textAlign: "center", fontSize: 17}}>Login</Text>
							</TouchableOpacity>
						</View>
				}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor:'whitesmoke'
	},

	historyList: {
		width: width * 0.97,
		alignSelf: 'center'
	},
	
	userItem: {
		fontSize: 20,
		marginVertical: height * 0.02,
		borderBottomWidth: 1,
		padding: 7,
		paddingLeft: 20
	}
})

const mapDispatchToProps = dispatch => (
	bindActionCreators({
		setProfile,
		logout
	}, dispatch)
)

const mapStateToProps = (state) => {
	const { profile, url } = state
	return { profile, url }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
