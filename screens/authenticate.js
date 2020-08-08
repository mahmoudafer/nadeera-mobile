import React, { Component } from 'react'
import { View, TextInput, StyleSheet, TouchableOpacity, Image, Dimensions, StatusBar, LayoutAnimation } from 'react-native'
import Text from "../components/apptext"

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
			firstName: "",
			lastName: "",
			email: null,
			password: null,
			error: "",
			signUp: false,
		}
	}

	onSignup = () => {
		this.setState({error: ""})
		if (this.state.signUp) {
			if (this.state.email && this.state.password && this.state.firstName && this.state.lastName) {
				fetch(`${this.props.url}/api/auth/register`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					},
					body: JSON.stringify({
						email: this.state.email,
						password: this.state.password,
						firstname: this.state.firstName,
						lastname: this.state.lastName
					})
				}).then(res => res.json()).then(res => {
					if (res.access_token) {
						this.props.setProfile({access_token: res.access_token, ...res.user})
						return this.props.navigation.replace("Home")
					}
					else {
						console.log(res)
						res = JSON.parse(res)
						this.setState({error: typeof res.email === 'object' ? res.email[0] : typeof res.password === 'object' ? res.password[0] : 'signup failed' })
					}
				}).catch(error => {
					console.log(error)
					alert("failed to make request, make sure you have a working internet connection")
				})
			} else {
				this.setState({error: "Please fill all fields"})
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
				fetch(`${this.props.url}/api/auth/login`, {
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
					if (res.access_token) {
						this.props.setProfile({access_token: res.access_token, ...res.user})
						return this.props.navigation.replace("Home")
					}
					else {
						console.log(res)
						this.setState({error:
							res.email ?
								res.email[0] :
								res.password ?
									res.password[0] :
									res.error ?
										'wrong password' :
										'login failed'
							})
					}
				}).catch((error) => {
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
				<Text style={{color: "black", fontSize: 37, fontWeight: "bold", marginTop: height * 0.08}}>nadeera</Text>
				<View style={{alignItems: 'center'}}>
					<Text style={{alignSelf: "center", marginBottom: height * 0.03, color: "#E94B3C", fontSize: 18}}>{this.state.error}</Text>
					{
						this.state.signUp &&
						<>
							<InputBox
								placeholder="First Name"
								active={this.state.activeBox === "firstname"}
								onFocus={() => this.setState({activeBox: "firstname"})}
								onChangeText={val => this.setState({firstName: val})}
								value={this.state.firstName}
								returnKeyType="next"
								onSubmitEditing={() => this.lastName.focus()}
								ref={input => this.firstName = input} 
							>
								<Feather name="user" size={25} color={this.state.activeBox === "firstname" ? "#E94B3C" : "#A2A2A2"}/>
							</InputBox>

							<InputBox
								placeholder="Last Name"
								active={this.state.activeBox === "lastname"}
								onFocus={() => this.setState({activeBox: "lastname"})}
								onChangeText={val => this.setState({lastName: val})}
								value={this.state.lastName}
								returnKeyType="next"
								onSubmitEditing={() => this.emailInput.focus()}
								ref={input => this.lastName = input} 
							>
								<Feather name="user" size={25} color={this.state.activeBox === "lastname" ? "#E94B3C" : "#A2A2A2"}/>
							</InputBox>
						</>
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
					<TouchableOpacity style={styles.loginButton} onPress={() => !this.state.signUp ? this.onLogin() : this.onSignup()}>
						<Text style={{color: "white", fontSize: 18}}>{!this.state.signUp ? "Login" : "Sign Up"}</Text>
					</TouchableOpacity>
				</View>
				<View style={{flexDirection: "row", marginBottom: height * 0.05, alignItems: 'center'}}>
					<Text style={{color: "black", fontSize: 16}}>{this.state.signUp ? "Already have an account?" : "Don't have an account?"}</Text>
					<TouchableOpacity onPress={() => this.state.signUp ? this.onLogin() : this.onSignup()} style={{padding: 10}}>
						<Text style={{color: "#E94B3C", fontSize: 16}}>{this.state.signUp ? "Login" : "Sign Up"}</Text>
					</TouchableOpacity>
				</View>
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
		paddingTop: height * 0.08,
		justifyContent: 'space-between'
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