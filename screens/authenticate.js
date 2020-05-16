import React, { Component } from 'react'
import { View, TextInput, StyleSheet, TouchableOpacity, Image, Dimensions, StatusBar, LayoutAnimation, Modal } from 'react-native'
import Text from "../components/apptext"

import LottieView from 'lottie-react-native'
import Feather from 'react-native-vector-icons/Feather'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const {height, width} = Dimensions.get("screen")

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setProfile } from '../redux/actions'

const InputBox = React.forwardRef((props, ref) => (
		<View style={{...styles.inputBox, borderWidth: props.active ? 2 : 0, borderColor: "#E94B3C", paddingHorizontal: props.active ? 18 : 20}}>
			{props.children}
			<TextInput style={{...styles.inputText, color: props.active ? "#E94B3C" : "black"}} 
				autoCapitalize="none"
				onChangeText={props.onChangeText}
				onSubmitEditing={props.onSubmitEditing} 
				autoCorrect={false} 
				keyboardType={props.keyboardType}
				returnKeyType={props.returnKeyType}
				placeholder={props.placeholder}
				placeholderTextColor="#A2A2A2"
				ref={ref}
				selectionColor="#E94B3C"
				onFocus={props.onFocus}
				multiline={false}
				value={props.value}
				secureTextEntry={props.secureTextEntry}
			/>
		</View>
	)
)

class Login extends Component {

	constructor (props) {
		super(props)
		this.state = {
			name: "",
			email: null,
			password: null,
			error: "",
			signUp: false,
			loadingModalVisible: false
		}
	}

	// Refactor: merge onSignup with onLogin with 1 param
	onSignup = () => {
		this.setState({error: ""})
		if (this.state.signUp) {
			this.setState({loadingModalVisible: true})
			if (this.state.email && this.state.password && this.state.name) {
				fetch(`${this.props.url}/signup`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					},
					body: JSON.stringify({
						email: this.state.email,
						password: this.state.password,
						name: this.state.name
					})
				}).then(res => res.json()).then(res => {
					this.setState({loadingModalVisible: false})
					if (res.authToken) {
						this.props.setProfile({authToken: res.authToken, ...res.profile})
						return this.props.navigation.replace("Home")
					}
					if (res.message) {
						this.setState({error: res.message})
					}
				}).catch((error) => {
					this.setState({loadingModalVisible: false})
					console.error(error)
					alert("failed to make request, make sure you have a working internet connection")
				})
			} else {
				this.setState({error: "Please fill all fields", loadingModalVisible: false})
			}
		} else {
			LayoutAnimation.configureNext(LayoutAnimation.create(
				200,
				LayoutAnimation.Types.easeOut,
				LayoutAnimation.Properties.scaleXY,
			))
			this.setState({signUp: true})
		}
			
	}

	onLogin = () => {
		this.setState({error: ""})
		if (!this.state.signUp) {
			if (this.state.email && this.state.password) {
				this.setState({loadingModalVisible: true})
				fetch(`${this.props.url}/login`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
					},
					body: JSON.stringify({
						email: this.state.email,
						password: this.state.password
					})
				}).then(res => res.json()).then(res => {
					this.setState({loadingModalVisible: false})
					if (res.authToken) {
						this.props.setProfile({authToken: res.authToken, ...res.profile})
						return this.props.navigation.replace("Home")
					}
					if (res.message) {
						this.setState({error: res.message})
					}
				}).catch((error) => {
					this.setState({loadingModalVisible: false})
					console.error(error)
					alert("failed to make request, make sure you have a working internet connection")
				})
			} else {
				this.setState({error: "Please fill all fields", loadingModalVisible: false})
			}
		} else {
			LayoutAnimation.configureNext(LayoutAnimation.create(
				200,
				LayoutAnimation.Types.easeOut,
				LayoutAnimation.Properties.scaleXY,
			))
			this.setState({signUp: false})
		}
	}

	render () {
		return (
			<View style={{...styles.container, paddingTop: 0}}>
				<StatusBar backgroundColor="whitesmoke" barStyle="dark-content"/>
				<View style={{...styles.container, paddingBottom: 0}}>
					<View style={{flexDirection: "row", justifyContent: "center", alignItems: 'center',}}>
						<Image source={require('../assets/prechase.png')} style={{width: width * 0.15, height: width * 0.15}} resizeMode="contain"/>
						<Text style={{color: "black", fontSize: 37, fontWeight: "bold", marginLeft: 10}}>Prechase</Text>
					</View>
					<View>
						<Text style={{alignSelf: "center", marginVertical: height * 0.03, color: "#E94B3C", fontSize: 18}}>{this.state.error}</Text>
						{
							this.state.signUp &&
							<InputBox
								placeholder="Name"
								active={this.state.activeBox === "name"}
								onFocus={() => this.setState({activeBox: "name"})}
								onChangeText={val => this.setState({name: val})}
								value={this.state.name}
								returnKeyType="next"
								onSubmitEditing={() => this.emailInput.focus()}
								ref={input => this.nameInput = input} 
							>
								<Feather name="user" size={25} color={this.state.activeBox === "name" ? "#E94B3C" : "#A2A2A2"}/>
							</InputBox>
						}
						<InputBox
							placeholder="Email"
							active={this.state.activeBox === "email"}
							onFocus={() => this.setState({activeBox: "email"})}
							onChangeText={val => this.setState({email: val})}
							value={this.state.email}
							returnKeyType="next"
							onSubmitEditing={() => this.passwordInput.focus()}
							ref={input => this.emailInput = input} 
						>
							<MaterialCommunityIcons name="email-outline" size={25} color={this.state.activeBox === "email" ? "#E94B3C" : "#A2A2A2"}/>
						</InputBox>
						<InputBox
							placeholder="Password"
							active={this.state.activeBox === "password"}
							onFocus={() => this.setState({activeBox: "password"})}
							onChangeText={val => this.setState({password: val})}
							value={this.state.password}
							returnKeyType="go"
							onSubmitEditing={() => !this.state.signUp ? this.onLogin() : this.onSignup()}
							ref={input => this.passwordInput = input}
							secureTextEntry={true}
						>
							<Feather name="unlock" size={25} color={this.state.activeBox === "password" ? "#E94B3C" : "#A2A2A2"}/>
						</InputBox>
					</View>
				</View>
				<TouchableOpacity style={styles.loginButton} onPress={() => !this.state.signUp ? this.onLogin() : this.onSignup()}>
					<Text style={{color: "white", fontSize: 18}}>{!this.state.signUp ? "Login" : "Sign Up"}</Text>
				</TouchableOpacity>
				<View style={{flexDirection: "row", marginTop: height * 0.2, alignItems: 'center'}}>
					<Text style={{color: "black", fontSize: 16}}>{this.state.signUp ? "Already have an account?" : "Don't have an account?"}</Text>
					<TouchableOpacity onPress={() => this.state.signUp ? this.onLogin() : this.onSignup()} style={{padding: 10}}>
						<Text style={{color: "#E94B3C", fontSize: 16}}>{this.state.signUp ? "Login" : "Sign Up"}</Text>
					</TouchableOpacity>
				</View>
				<Modal
					animationType="fade"
					transparent={true}
					visible={this.state.loadingModalVisible}
					hardwareAccelerated
					statusBarTranslucent
				>
					<View style={{flex: 1, backgroundColor: "rgba(0,0,0,0.2)", alignItems: 'center', justifyContent: "center"}}>
						<View style={{borderRadius: 3, backgroundColor: 'whitesmoke', elevation: 10, width: width * 0.85, alignItems: "center", justifyContent: "center", overflow: 'hidden', marginBottom: height * 0.05}}>
							<LottieView imageAssetsFolder="lottie/loading" source={require('../assets/loading.json')} autoPlay loop />
						</View>
					</View>
				</Modal>
			</View>
		)
	}
}

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        setProfile,
    }, dispatch)
)

const mapStateToProps = (state) => {
    const { profile, url } = state
    return { profile, url }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "whitesmoke",
		alignItems: 'center',
		justifyContent: 'space-around',
		paddingTop: height * 0.08,
		paddingBottom: height * 0.05
 	},
	inputBox: {
		height: 55,
		width: width * 0.8,
		backgroundColor: 'white',
		borderRadius: 100,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: "center",
		overflow: 'hidden',
		marginBottom: height * 0.03
	},
	inputText: {
		backgroundColor: "white",
		padding: 10,
		paddingLeft: width * 0.03,
		flex: 1,
		paddingVertical: 10,
		fontSize: 16
	},
	ButtonContainer: {
		borderRadius: 100,
		borderColor: "#FBBF12",
		borderWidth: 1,
	},
	buttonText: {
		color: '#fff',
		textAlign: 'center',
	},
	loginButton: {
		backgroundColor: "#E94B3C",
		borderRadius: 100,
		height: 50,
		width: 150,
		elevation: 3,
		justifyContent: 'center',
		alignItems: 'center',
	}
})