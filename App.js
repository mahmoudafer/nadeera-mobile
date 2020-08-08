'use strict'
console.disableYellowBox = true
import 'react-native-gesture-handler'
import React from 'react'
import {StatusBar, Image, I18nManager, Platform, UIManager} from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createDrawerNavigator } from '@react-navigation/drawer'
import MaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import AsyncStorage from '@react-native-community/async-storage'
import Profile from './screens/profile'
import Authentication from './screens/authenticate'
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

const Stack = createStackNavigator()
const Drawer = createDrawerNavigator()

const persistConfig = {
	key: 'root',
	storage: AsyncStorage
}

const persistedReducer = persistReducer(persistConfig, ScansReducer)
const store = createStore(persistedReducer)
const persistor = persistStore(store)

function myDrawer () {
	return (
		<Drawer.Navigator drawerContent={(props) => <DrawerContent {...props}/>}>
			<Drawer.Screen component={Profile} name="home"/>
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
					<RootStack/>
				</NavigationContainer>
			</PersistGate>
		</Provider>
	)
}