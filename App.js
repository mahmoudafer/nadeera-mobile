'use strict'
console.disableYellowBox = true
import 'react-native-gesture-handler'
import React from 'react'
import {StatusBar, Image, I18nManager, Platform, UIManager} from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer'
import MaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import AsyncStorage from '@react-native-community/async-storage'
import Scan from './screens/scan'
import Profile from './screens/profile'
import Authentication from './screens/authenticate'
import Preview from './screens/preview'
import Feed from './screens/feed'
import DrawerContent from './components/drawercontent'

import { persistStore, persistReducer } from 'redux-persist'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { PersistGate } from 'redux-persist/integration/react'
import ScansReducer from './redux/reducer'

I18nManager.allowRTL(false)
if (
	Platform.OS === 'android' &&
	UIManager.setLayoutAnimationEnabledExperimental
) {
	UIManager.setLayoutAnimationEnabledExperimental(true)
}

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()
const Drawer = createDrawerNavigator()

const persistConfig = {
	key: 'root',
	storage: AsyncStorage
}

const persistedReducer = persistReducer(persistConfig, ScansReducer)
const store = createStore(persistedReducer)
const persistor = persistStore(store)

function ModalRootStack (props) {
	return (
		<Stack.Navigator
			initialRouteName="Scan"
			screenOptions={{ gestureEnabled: false, headerShown: false }}
			mode="modal"
		>
			<Stack.Screen
				name="Root"
				component={RootStack}
			/>
			<Stack.Screen
				name="Preview"
				component={Preview}
			/>
		</Stack.Navigator>
	)
}

function HomeStack (props) {
	return (
		<Tab.Navigator
			backBehavior="initialRoute"
			initialRouteName="Scan"
			tabBarOptions={{
				showLabel: false,
				activeTintColor: "#E94B3C",
				// activeBackgroundColor: "#E94B3C",
				inactiveTintColor: "black"
			}}
		>
			<Tab.Screen
				name="Profile"
				component={Profile}
				options={{
					tabBarIcon: ({color}) => <MaterialCommunity name="history" size={35} color={color} />
				}}
			/>
			<Tab.Screen
				name="Scan"
				component={Scan}
				options={{
					tabBarIcon: ({color}) => <Image style={{width: 28}} resizeMode="contain" source={require('./assets/bottom_scan_icon.png')} tintColor={color} />
				}}
			/>
			<Tab.Screen
				name="Feed"
				component={Feed}
				options={{
					tabBarIcon: ({color}) => <Image style={{width: 28}} resizeMode="contain" source={require('./assets/discover.png')} tintColor={color} />
				}}
			/>
		</Tab.Navigator>
	)
}

function myDrawer () {
	return (
		<Drawer.Navigator drawerContent={(props) => <DrawerContent {...props}/>}>
			<Drawer.Screen component={HomeStack} name="home"/>
		</Drawer.Navigator>
	)
}

function RootStack (props) {
	return (
		<Stack.Navigator
			initialRouteName="Home"
			screenOptions={{ gestureEnabled: false, headerShown: false }}
		>
			<Stack.Screen
				name="Home"
				component={myDrawer}
			/>
			<Stack.Screen
				name="Login"
				component={Authentication}
			/>
		</Stack.Navigator>
	)
}

export default function App (props) {
	return (
		<Provider store={ store }>
			<PersistGate loading={null} persistor={persistor}>
				<StatusBar backgroundColor="white" barStyle="dark-content"/>
				<NavigationContainer>
					<ModalRootStack/>
				</NavigationContainer>
			</PersistGate>
		</Provider>
	)
}