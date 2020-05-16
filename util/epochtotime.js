const epochToTime = (millis, minify) => {
	const now = new Date(), millisDate = new Date(millis)
    let difference = now.getTime() - millis
    difference = difference < 0 ? 0 : difference
	if (typeof millis !== 'number' || isNaN(millis))
        return ''
    //case 0 secs upto 59    
    if (difference <= 3600) { //1 min: 1 * 60 * 1000
        let secs = Math.ceil(difference / 60)
		return secs + (minify ? 's' : secs > 1 ? ' seconds ago' : ' seconds ago')
    }

	//case 1 min upto 59
	else if (difference < 3600000) { //1 hour: 1 * 60 * 60 * 1000
		let mins = Math.ceil(difference / 60000)
		return mins + (minify ? 'm' : mins > 1 ? ' minutes ago' : ' minute ago')
	}

	//case 6 hours upto 23
	else if (difference < 86400000) { // 24 hours: 24 * 60 * 60 * 1000
		let hours = Math.ceil(difference / 3600000)
		return hours + (minify ? 'h' : hours > 1 ? ' hours ago' : ' hour ago')
	}

	//case 1 day upto 29
	else if (difference < 2592000000) { //30 days: 30 * 24 * 60 * 60 * 1000
		let days = Math.ceil(difference / 86400000)
		return days + (minify ? 'd' : days > 1 ? ' days ago' : ' day ago')
	}

	//case 1 month upto 11
	else if (difference < 31104000000) { //12 months: 12 * 30 * 24 * 60 * 60 * 1000
		if (minify) {
			let weeks = Math.ceil(difference / 604800000)
			return weeks + 'w'
		}
		let months = Math.ceil(difference / 2592000000)
		return months + (months > 1 ? ' months ago' : ' month ago')
	}

	let years = Math.ceil(difference / 31104000000)
	return years + (years > 1 ? ' years ago' : ' year ago')
}

export default epochToTime