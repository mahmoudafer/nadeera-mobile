const arrayToObj = ({obj, arr, key}) => {
	const finalObj = {...obj}
	arr.forEach(item => {
		if (finalObj[item[key]] == undefined)
			finalObj[item[key]] = item
	})
	return finalObj
}

export default arrayToObj