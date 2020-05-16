import React from 'react'
import { View, Dimensions, StyleSheet, TouchableOpacity } from 'react-native'
const { height, width } = Dimensions.get('screen')
import Text from "../components/apptext"
import AntDesign from 'react-native-vector-icons/AntDesign'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { logout } from '../redux/actions'

class DrawerContent extends React.Component {
	render () {
        return (
            <View style={styles.container}>
                <View>

                </View>
                {
                    this.props.profile?.authToken ?
                    <View style={{flexDirection: "row"}}>
                        <Text>Logged in as {this.props.profile.name} </Text>
                        <TouchableOpacity onPress={this.props.logout}>
                            <Text style={{color: "#E94B3C"}}>Logout</Text>
                        </TouchableOpacity>
                    </View> :
                    <TouchableOpacity style={styles.loginButton} onPress={() => this.props.navigation.navigate("Login")}>
                        <AntDesign color="#E94B3C" name="user" size={23}/>
                        <Text>Login</Text>
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
	const { profile } = state
	return { profile }
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawerContent)

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
		flex: 1,
		alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: height * 0.03
    },

    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    }
})