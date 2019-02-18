/**
 * This script was made by Jan Demel
 * jandemel98@gmail.com
 * The author doesn't take any responsibility with how you use this
 */

const Log = require('./log');

module.exports = async(page, config) => {
	let hashtags = config.hashtags;
	let postsPerHashtag = config.postsPerHashtag;
	let ret = [];

	for (let y = 0; y < hashtags.length; y++) {

		Log("Fetching: #" + hashtags[y]);
		
		try {
			await page.goto("https://www.instagram.com/explore/tags/" + hashtags[y] + '/');
		} catch (e) {
			Log(e);
		}

		let relevants = [];

		while(true){
			const hrefs = await page.$$eval('a', as => as.map(a => a.href));
			for (let i = 0; i < hrefs.length; i++){
				if(hrefs[i].includes('/p/') && !relevants.includes(hrefs[i])){
					relevants.push(hrefs[i]);
				}
			}
			
			Log("Relevant posts: " + relevants.length);
			if(relevants.length < postsPerHashtag){
				await page.evaluate(_ => {
					window.scrollBy(0, 2 * window.innerHeight);
				});
				await page.waitFor(1000);
			} else {
				break;
			}
		}

		relevants.splice(postsPerHashtag - 1, relevants.length - postsPerHashtag);
		ret = ret.concat(relevants);
	}

	return ret;
}