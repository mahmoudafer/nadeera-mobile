'use strict'
import React from 'react'
import {
	View,
	StyleSheet,
	Image,
	Dimensions,
	FlatList,
	ScrollView,
	TouchableWithoutFeedback,
	TouchableNativeFeedback,
	TouchableOpacity,
	Modal,
	TextInput,
	Keyboard,
	LayoutAnimation,
	StatusBar
} from 'react-native'

import Text from "../components/apptext"

import { Rating, AirbnbRating } from 'react-native-ratings'

import Entypo from 'react-native-vector-icons/Entypo'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

import arrayToObj from '../util/arraytoobj'
import share from "../util/share"

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { toggleFavorite, addRating, deleteReview } from '../redux/actions'

const {width, height} = Dimensions.get('screen')

const epochToDate = millis => {
	const date = new Date(millis)
	return date.getDate() + ' ' + ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()] + ' ' + date.getFullYear()
}

function RatingColumn (props) {
	return (
		<TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('rgba(255, 0, 0, 0.2)', false)} disabled={props.disabled} onPress={props.selectRatingFilter}>
			<View style={{flexDirection: 'row', alignItems: "center", backgroundColor: props.chosen ? 'rgba(255, 0, 0, 0.1)' : undefined, ...props.style, paddingHorizontal: width * 0.03}}>
				<Text>{props.number}</Text>
				<View style={{marginLeft: width * 0.025, backgroundColor: props.chosen ? "white" : "#eee", borderRadius: 20, height: `${50 + props.extraHeight}%`, width: "100%"}}>
					<View style={{position: 'absolute', backgroundColor: "#E94B3C", height: '100%', borderRadius: 20, width: `${props.percent == 0 ? 0 : props.percent >= 5 ? props.percent : 5}%`}}></View>
				</View>
			</View>
		</TouchableNativeFeedback>
	)
}

function ReviewColumn (props) {
	return (
		<View style={styles.reviewColumnContainer}>
			<View style={{flexDirection: 'row', alignItems: 'center', width: "100%", justifyContent: 'space-between'}}>
				<Text style={{fontSize: 20, fontWeight: "bold", marginBottom: height * 0.005}}>{props.item.name}</Text>
				<Text style={{color: '#999'}}>{epochToDate(props.item.time)}</Text>
			</View>
			<Rating
				type="custom"
				showRating={false}
				ratingCount={5}
				readonly
				startingValue={Number(props.item.stars)}
				imageSize={16}
				ratingColor="#E94B3C"
				tintColor='white'
				ratingBackgroundColor="#dedddd"
			/>
			<Text style={{marginTop: height * 0.01, fontSize: 17}}>{props.item.review}</Text>
		</View>
	)
}

const calculateRatingAverage = ({ratings, ratingsCount}) => {
	const total = ratingsCount ? (ratings.one + ratings.two * 2 + ratings.three * 3 + ratings.four * 4 + ratings.five * 5) / ratingsCount : 0
	return total.toFixed(1)
}

const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
	const paddingToBottom = height * 0.25
	return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
}

class Preview extends React.Component {
	constructor(props) {
		super(props)
		this.existingReview = props.route.params.data.reviews.find(item => item.email === props.profile.email)
		this.index = props.scans.findIndex(scan => scan.ID == props.route.params.data.ID)
		this.currentResultsEnded = false
		this.state = {
			// widths: this.props.route.params.data.images.map(async uri => {
			// 	const result = await new Promise((resolve, reject) => {
			// 		Image.getSize(uri, (w, h) => {
			// 			resolve(height * 0.25 * w / h)
			// 		}, reject)
			// 	})
			// 	return result
			// }),
			activeList: 'info',
			ratingModalVisible: false,
			stars: this.existingReview?.stars || 5,
			review: this.existingReview?.review || "",
			ratingHidden: false,
			selectedRatingFilter: 1,
			infoModalVisible: false,
			flatlistEnabled: false,
			activeChooserLayout: {
				height: 40,
				y: 500
			},
			allowMaxHeight: true,
			activeChooserMagnetEnabled: false,
			reviews: arrayToObj({arr: [...props.scans[this.index].reviews] || [], key: "email", obj: {}})
		}
		// Promise.all(this.state.widths).then((data) => {
		// 	this.setState({widths: data})
		// })
	}

	loadMoreReviews = () => {
		if (this.state.loadingMore || this.currentResultsEnded)
			return

		this.setState({loadingMore: true})
		const data = this.props.scans[this.index]
		console.log(Object.values(this.state.reviews).length)
		fetch(`${this.props.url}/products/reviews?id=${data.ID}&cname=${encodeURIComponent(data.companyName)}&i=${encodeURIComponent(!this.state.ratingHidden ? Object.values(this.state.reviews).length : Object.values(this.state.reviews).reduce((acc, val) => acc.stars == 6 - this.state.selectedRatingFilter ? acc + 1 : acc, 0))}${this.state.ratingHidden ? `&f=${6 - this.state.selectedRatingFilter}` : ""}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				Authorization: this.props.profile.authToken
			}
		}).then(response => response.json())
		.then((responseJson) => {
			this.setState({loadingMore: false})
			console.info(responseJson)
			if (responseJson.length > 0)
				this.setState({reviews: arrayToObj({obj: this.state.reviews, arr: responseJson, key: "email"})})
			else
				this.currentResultsEnded = true
		})
		.catch((error) => {
			console.log(error)
			alert("Request failed, make sure you have a working internet connection")
		})
	}
	
	ActivateList = (name, skip) => {
		this.state.activeChooserMagnetEnabled && this.mainScrollView.scrollTo({x: 0, y: this.state.activeChooserLayout.y, animated: true})
		this.setState({activeList: name, ratingHidden: false})
		if (name === "reviews") {
			!skip && this.horizontalScrollView.scrollToEnd()
			LayoutAnimation.configureNext(LayoutAnimation.create(
				200,
				LayoutAnimation.Types.easeOut,
				LayoutAnimation.Properties.scaleXY,
			))
			this.setState({allowMaxHeight: false})
		}
		else {
			!skip && this.horizontalScrollView.scrollTo({x:0, y: 0, animated: true})
			this.setState({allowMaxHeight: true})
		}
		setTimeout(() => this.setState({scrollLock: false}), 400)
		this.currentResultsEnded = false
	}

	writeReview = (productID, stars, review) => {
		fetch(`${this.props.url}/products/review`, {
			method: this.existingReview ? 'PUT' : 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				Authorization: this.props.profile.authToken
			},
			body: JSON.stringify({
				productID: productID,
				stars,
				review
			})
		}).then(response => response.json())
		.then((responseJson) => {
			if (responseJson.status === (this.existingReview ? 201 : 201)) {
				this.props.addRating({existing: !!this.existingReview, ID: productID, stars, review, name: this.props.profile.name, time: new Date().getTime(), email: this.props.profile.email})
			}
		})
		.catch((error) => {
            alert("could not add review, make sure you have a working internet connection")
			console.error(error)
		})
		this.setState({ratingModalVisible: false})
	}

	deleteReview = (stars) => {
		fetch(`http:${this.props.url}/products/review`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				Authorization: this.props.profile.authToken
			},
			body: JSON.stringify({
				productID: this.props.route.params.data.ID
			})
		}).then(response => response.json())
		.then((responseJson) => {
			if (responseJson.status === 200) {
				this.props.deleteReview({ID: this.props.route.params.data.ID, email: this.props.profile.email, stars})
			}
		})
		.catch((error) => {
            alert("could not add review, make sure you have a working internet connection")
			console.error(error)
		})
		this.setState({ratingModalVisible: false})
	}

	toggleReviewsFilters = () => {
		LayoutAnimation.configureNext(LayoutAnimation.create(
			200,
			LayoutAnimation.Types.easeOut,
			LayoutAnimation.Properties.scaleX,
		))
		this.setState({ratingHidden: !this.state.ratingHidden})
		this.currentResultsEnded = false
	}

	selectRatingFilter = (i) => {
		LayoutAnimation.configureNext(LayoutAnimation.create(
			300,
			LayoutAnimation.Types.easeOut,
			LayoutAnimation.Properties.scaleXY,
		))
		this.setState({selectedRatingFilter: i + 1})
		this.currentResultsEnded = false
	}

	ratingFilteredViewState = (flag, heightOffset = 0) => {
		return flag ? {
			width:  width,
			height: height - heightOffset,
			opacity: 1
		} : {
			width: 0,
			height: 0,
			opacity: 0.001
		}
	}

	render() {
		let data = this.props.scans[this.index]
		data.rating = calculateRatingAverage(data)
		this.existingReview = Object.values(this.state.reviews).find(item => item.email === this.props.profile.email)
		return (
			<ScrollView
				contentContainerStyle={styles.container}
				showsVerticalScrollIndicator={false}
				stickyHeaderIndices={[4]}
				ref={ref => this.mainScrollView = ref}
				scrollEventThrottle={200}
				onScroll={({nativeEvent}) => {
					if (this.state.activeList === "reviews" && isCloseToBottom(nativeEvent)) {
						this.loadMoreReviews()
					}
					if (nativeEvent.contentOffset.y < this.state.activeChooserLayout.y && this.state.activeChooserMagnetEnabled)
						this.setState({activeChooserMagnetEnabled: false})
					else if (nativeEvent.contentOffset.y > this.state.activeChooserLayout.y && !this.state.activeChooserMagnetEnabled)
						this.setState({activeChooserMagnetEnabled: true})
					
				}}
			>
				<StatusBar backgroundColor="white" barStyle="dark-content"/>
				{/* <StatusBar backgroundColor="whitesmoke" barStyle="dark-content"/> */}
				<TouchableNativeFeedback onPress={this.props.navigation.goBack}>
					<Ionicons name="ios-close" size={30} color="white" style={{zIndex: 1, backgroundColor: "#E94B3C", elevation: 10, position: 'absolute', right: width * 0.03, top: width * 0.03, paddingVertical: 1, paddingHorizontal: 10, borderRadius: 7}}/>
				</TouchableNativeFeedback>
				<Image
					source={{uri: data.primaryImage, cache: 'force-cache'}}
					style={styles.primaryImage}
					resizeMode="cover"
					fadeDuration={0}
				/>
				<View style={styles.header}>
					<View style={styles.headerTopBar}>
						<View style={styles.headerTopBar}>
							<Text style={{color: "#444", fontSize: 14, marginRight: width * 0.018}}>{data.rating}</Text>
							<Rating
								type="custom"
								showRating={false}
								onFinishRating={this.ratingCompleted}
								ratingCount={5}
								readonly
								startingValue={Number(data.rating)}
								imageSize={16}
								ratingColor="#E94B3C"
								tintColor='white'
								ratingBackgroundColor="#dedddd"
							/>
							<View style={{marginHorizontal: width * 0.02, width: 1, height: 15, backgroundColor: "#bbb"}}/>
							<Text style={{color: "#444", fontSize: 14}}>{data.ratingsCount} review{data.ratingsCount > 1 && 's'}</Text>
						</View>
						<View style={{...styles.headerTopBar, width: width * 0.17}}>
							<TouchableOpacity onPress={() => share(data)}>
								<Entypo name="share" size={24}/>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => this.props.toggleFavorite(data.ID)}>
								<AntDesign name={data && data.favorite ? "heart" : "hearto"} color={data && data.favorite ? "#E94B3C" : "black"} size={22}/>
							</TouchableOpacity>
						</View>
					</View>
					<Text style={styles.title}>{data.name}</Text>
					<Text style={styles.company}>{data.companyName}</Text>
					{ data.price && 
						<View style={{flexDirection: "row", justifyContent: 'space-between', width: "100%", alignItems: "flex-end"}}>
							<View style={{flexDirection: 'row', alignItems: "flex-end"}}>
								<Text style={styles.price}>LBP {data.price}</Text>
								<TouchableOpacity style={{marginLeft: width * 0.015, flexDirection: 'row', alignItems: "flex-start", paddingBottom: 1}} onPress={() => this.setState({infoModalVisible: true})}>
									<Text style={{color: '#aaa', marginRight: 2, fontSize: 14}}>MSRP</Text>
									<FontAwesome5 name="info-circle" color="#999" size={13}/>
								</TouchableOpacity>
							</View>
							{/* <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
								<Text style={{color: "#E94B3C", marginRight: width * 0.01, paddingBottom: 2}}>Report price</Text>
								<Ionicons name="ios-warning" color="#E94B3C" size={25}/>
							</TouchableOpacity> */}
						</View>	
					}
				</View>
				{/* <View style={{height: height * 0.25 + 15}}>
					<ScrollView
						showsHorizontalScrollIndicator={false}
						horizontal
					>
						<FlatList
							data={data.images}
							renderItem={({item, index}) => (
								<View style={{...styles.imagesViews, width: !isNaN(this.state.widths[index]) ? this.state.widths[index] : 200}}>
									<Image
										source={{uri: item, cache: 'force-cache'}}
										style={{...styles.images, width: !isNaN(this.state.widths[index]) ? this.state.widths[index] : 200}}
										resizeMode="contain"
										fadeDuration={0}
									/>
								</View>
							)}
							showsHorizontalScrollIndicator={false}
							horizontal
							style={{paddingHorizontal: width * 0.03}}
						/>
					</ScrollView>
				</View> */}
				<View onLayout={(event) => {this.setState({activeChooserLayout: event.nativeEvent.layout})}}>
					<View style={styles.activeSelector}>
						<TouchableWithoutFeedback
							onPress={() => {this.setState({scrollLock: true}); this.ActivateList("info")}}
						>
							<Text
								style={{
									...styles.activeSelectorText,
									color: this.state.activeList === "info" ? "#E94B3C" : "#999",
									borderColor: this.state.activeList === "info" ? "#E94B3C" : "whitesmoke",
									borderBottomWidth: this.state.activeList === "info" ? 2 : 1.5
								}}
							>
								Info
							</Text>
						</TouchableWithoutFeedback>
						<TouchableWithoutFeedback
							onPress={() => {this.setState({scrollLock: true}); this.ActivateList("reviews")}}
						>
							<Text
								style={{
									...styles.activeSelectorText,
									color: this.state.activeList === "reviews" ? "#E94B3C" : "#999",
									borderColor: this.state.activeList === "reviews" ? "#E94B3C" : "whitesmoke",
									borderBottomWidth: this.state.activeList === "reviews" ? 2 : 1.5
								}}
							>
								Reviews
							</Text>
						</TouchableWithoutFeedback>
					</View>
				</View>
				
				<ScrollView
					horizontal
					pagingEnabled
					ref={ref => this.horizontalScrollView = ref}
					scrollEventThrottle={100}
					onScroll={({nativeEvent}) => {
						if (this.state.scrollLock)
							return
						if (this.state.activeList === "info") {
							if (nativeEvent.contentOffset.x > width / 2) {
								this.ActivateList("reviews", true)
							}
						}
						else if (nativeEvent.contentOffset.x <= width / 2) {
							this.ActivateList("info", true)
						}
					}}
					onMomentumScrollEnd={() => this.setState({scrollLock: false})}
					style={{maxHeight: this.state.allowMaxHeight ? height - this.state.activeChooserLayout.height - width * 0.12 : undefined}}
					showsHorizontalScrollIndicator={false}
					decelerationRate="fast"
					scrollEnabled={!this.state.scrollLock}
				>
					<View style={styles.infoContainer}>
						<View onLayout={(event) => this.setState({maxHeight: event.nativeEvent.layout.height})}>
							<Text style={{fontWeight: "bold", fontSize: 20, marginBottom: height * 0.013}}>Description</Text>
							<Text style={{fontSize: 17, marginBottom: height * 0.025}}>{data.description || "No description"}</Text>
							{
								data.howToUse &&
								<>
									<Text style={{fontWeight: "bold", fontSize: 20, marginBottom: height * 0.013}}>How to use</Text>
									<Text style={{fontSize: 17}}>{data.howToUse}</Text>
								</>
							}
						</View>
					</View>
					<View style={styles.reviewsContainer}>
						<View style={styles.ratingsContainer}>
							{
								!this.state.ratingHidden &&
								<View style={{alignItems: "center", width: width * 0.5, height: 150, justifyContent: "center"}}>
									<Text style={{fontSize: 60, textAlign: 'center', marginTop: -10, marginBottom: - 3}}>{data.rating}</Text>
									<Rating
										type="custom"
										showRating={false}
										onFinishRating={this.ratingCompleted}
										ratingCount={5}
										readonly
										startingValue={data.rating}
										imageSize={16}
										ratingColor="#E94B3C"
										tintColor='white'
										ratingBackgroundColor="#dedddd"
									/>
									<Text style={{color: "#444", fontSize: 16, marginTop: 3}}>{data.ratingsCount}</Text>
								</View>
							}
							<TouchableOpacity onPress={this.toggleReviewsFilters} disabled={this.state.ratingHidden}>
								<View style={{
									justifyContent: 'space-between',
									alignItems: "center",
									width: this.state.ratingHidden ? width : width * 0.5,
									paddingRight: this.state.ratingHidden ? width * 0.05 : width * 0.1,
									paddingLeft: this.state.ratingHidden ? width * 0.05 : 0,
								}}>
									{
										["five", "four", "three", "two", "one"].map((stars, i) =>
											<RatingColumn
												key={i}
												percent={data.ratings && data.ratingsCount && data.ratings[stars] / data.ratingsCount * 100}
												number={4 - i + 1}
												style={{
													paddingVertical: this.state.ratingHidden ? height * 0.016 : 0,
												}}
												extraHeight={
													this.state.ratingHidden ? 40 : 0
												}
												chosen={this.state.ratingHidden && this.state.selectedRatingFilter === i + 1}
												selectRatingFilter={() => this.selectRatingFilter(i)}
												disabled={!this.state.ratingHidden}
											/>
										)
									}
								</View>
							</TouchableOpacity>
						</View>
						{
							!this.props.route.params.cantreview &&
							<TouchableOpacity onPress={() => this.props.profile.authToken ? this.setState({ratingModalVisible: true}) : this.props.navigation.navigate("Login")} style={{flexDirection: 'row', alignItems:"center", justifyContent: "center"}}>
								{this.props.profile.authToken ? <MaterialCommunityIcons color="#E94B3C" name="pencil-outline" size={23}/> : <AntDesign color="#E94B3C" name="user" size={23}/>}
								<Text style={{marginLeft: 3, color: "#E94B3C", fontSize: 20, alignSelf: "center"}}>{this.props.profile.authToken ? !this.existingReview ? "Write" : "Update Your": "Login to Add"} Review</Text>
							</TouchableOpacity>
						}
						<FlatList
							data={this.state.ratingHidden ? Object.values(this.state.reviews).filter(review => review.stars == 6 - this.state.selectedRatingFilter) : Object.values(this.state.reviews)}
							renderItem={({item}) => <ReviewColumn item={item}/>}
							keyExtractor={item => item.review + item.ID + item.time}
							scrollEnabled={false}
						/>
					</View>
				</ScrollView>

				<Modal
					animationType="fade"
					transparent={true}
					visible={this.state.infoModalVisible}
					onRequestClose={() => this.setState({infoModalVisible: false})}
					hardwareAccelerated
					statusBarTranslucent
				>
					<View style={{flex: 1, backgroundColor: "rgba(0,0,0,0.2)", alignItems: 'center', justifyContent: "center"}}>
						<View style={{borderRadius: 3, backgroundColor: 'whitesmoke', elevation: 10, width: width * 0.85, alignItems: "center", justifyContent: "center", overflow: 'hidden', marginBottom: height * 0.05}}>
							<TouchableOpacity style={{position: 'absolute', top: 10, right: 10}} onPress={() => this.setState({infoModalVisible: false})}>
								<AntDesign name="closesquare" size={25}/>
							</TouchableOpacity>
							<Text style={{...styles.modalTitle, marginVertical: 10, alignSelf: "flex-start", marginLeft: width * 0.06}}>MSRP</Text>
							<View style={{paddingTop: 10, paddingHorizontal: width * 0.06}}>
								<Text style={{fontSize: 18}}><Text style={{color: "#E94B3C"}}>{data.price} LBP</Text> is the retail price suggested by <Text style={{fontWeight: "bold"}}>{data.companyName + "\n"}</Text></Text>
								<Text style={{fontSize: 13, color: "#666", paddingBottom: 20}}>*Actual retail price might slightly vary</Text>
							</View>
						</View>
					</View>
				</Modal>

				{/* Review Modal */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={this.state.ratingModalVisible}
					onRequestClose={() => this.setState({ratingModalVisible: false})}
					hardwareAccelerated
				>
					<View style={{flex: 1, backgroundColor: "rgba(0,0,0,0.2)", alignItems: 'center', justifyContent: "center"}}>
						<View style={{borderRadius: 3, backgroundColor: 'whitesmoke', elevation: 10, width: width * 0.85, height: height * 0.48, alignItems: "center", justifyContent: "center", overflow: 'hidden', marginBottom: height * 0.05}}>
							<TouchableOpacity style={{position: 'absolute', top: 10, right: 10}} onPress={() => this.setState({ratingModalVisible: false})}>
								<AntDesign name="closesquare" size={25}/>
							</TouchableOpacity>
							<Text style={styles.modalTitle}>{data.name}</Text>
							<AirbnbRating
								count={5}
								reviews={["🤢", "😐", "🙂", "😁", "😍"]}
								defaultRating={this.existingReview?.stars || this.state.stars || 5}
								size={35}
								style={{elevation: 10}}
								selectedColor="#E94B3C"
								reviewColor="#E94B3C"
								onFinishRating={(stars) => this.setState({stars})}
							/>
							<Text style={styles.modalText}>Write a review (optional)</Text>
							<TextInput style={{...styles.input, width: '80%', maxHeight: "30%"}}
								onChangeText={(val) => this.setState({review: val})}
								onSubmitEditing={Keyboard.dismiss}
								placeholder={"write review"} 
								placeholderTextColor='rgba(0,0,0,0.3)' 
								selectionColor="#FB4239"
								textAlignVertical="center"
								multiline
								defaultValue={this.existingReview?.review || ""}
							/>
							<TouchableOpacity onPress={() => this.writeReview(data.ID, this.state.stars, this.state.review)}>
								<Text style={{fontSize: 15, textAlign: 'center', color: "white", paddingVertical: 10, paddingHorizontal: '20%', borderRadius: 5, marginTop: 20, backgroundColor: "#E94B3C"}}>{this.existingReview ? "UPDATE" : "ADD"}</Text>
							</TouchableOpacity>
							{
								!!this.existingReview &&
								<TouchableOpacity onPress={() => this.deleteReview(this.existingReview.stars)}>
									<Text style={{fontSize: 16, textAlign: 'center', color: "#E94B3C", padding: 5, marginTop: height * 0.01}}>Delete Review</Text>
								</TouchableOpacity>
							}
						</View>
					</View>
				</Modal>
			</ScrollView>
		)
	}
}

const mapDispatchToProps = dispatch => (
	bindActionCreators({
		toggleFavorite,
		addRating,
		deleteReview
	}, dispatch)
)

const mapStateToProps = (state) => {
	const { scans, profile, url } = state
	return { scans, profile, url }
}

export default connect(mapStateToProps, mapDispatchToProps)(Preview)

const styles = StyleSheet.create({
	container: {
		backgroundColor: "white",
	},

	primaryImage: {
		height: width,
		width: width
	},
	
	header: {
		paddingTop: height * 0.01,
		padding: width * 0.045,
		backgroundColor: 'white',
		borderBottomWidth: height * 0.03 - 5,
		borderColor: "whitesmoke"
	},
	
	headerTopBar: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: 'center',
		marginBottom: height * 0.004
	},
	
	title: {
		fontSize: 25,
		fontWeight: 'bold'
	},
	
	company: {
		fontSize: 18,
		marginTop: height * 0.005
	},
	
	price: {
		fontSize: 18,
		color: "#E94B3C",
		marginTop: height * 0.005
	},
	
	images: {
		height: height * 0.25,
	},
	
	imagesViews: {
		elevation: 5,
		overflow: 'hidden',
		borderRadius: 10,
		height: height * 0.25,
		marginHorizontal: width * 0.03,
		marginTop: 4
	},
	
	infoContainer: {
		backgroundColor: "white",
		overflow: 'hidden',
		width: width,
		padding: width * 0.06
	},

	activeSelector: {
		flexDirection: "row",
		alignItems: 'center',
		justifyContent: "center",
		width: width,
		backgroundColor: 'white',
		overflow:'hidden',
	},

	activeSelectorText: {
		width: width * 0.5,
		fontSize: 20,
		paddingTop: width * 0.01,
		paddingBottom: width * 0.015,
		paddingHorizontal: width * 0.1,
		alignSelf: "center",
		textAlign: 'center',
		fontFamily: 'Roboto',
		fontWeight: 'bold'
	},

	reviewsContainer: {
		width
	},

	ratingsContainer: {
		backgroundColor: "white",
		alignItems: "center",
		justifyContent: "space-between",
		flexDirection: 'row',
		width: width
	},

	reviewColumnContainer: {
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		backgroundColor: 'white',
		paddingHorizontal: width * 0.06,
		paddingVertical: height * 0.015,
		width: '100%'
	},

	input: {
		backgroundColor: 'white',
		borderRadius: 10,
		paddingHorizontal: 10,
	},

	modalText: {
		fontSize: 18,
		paddingVertical: 10
	},

	modalTitle: {
		fontWeight: "bold",
		fontSize: 20
	}
})