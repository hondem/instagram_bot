/**
 * This script was made by Jan Demel
 * jandemel98@gmail.com
 * The author doesn't take any responsibility with how you use this
 */

const Log = require('./log');
const random = require('random')

exports.likePosts = async(page, posts) => {
	for (let i = 0; i < posts.length; i++) {
		Log('Liking ' + (i + 1) + '/' + posts.length);

		try {
			await page.goto(posts[i], {"waitUntil" : "networkidle0"});
			let wasLiked = await page.evaluate(() => {
				return (document.querySelector('.glyphsSpriteHeart__filled__24__red_5') == null) ? false : true
			});
			if (!wasLiked) {
				await page.click('.fr66n');
			} else {
				Log("Already liked");
			}
		} catch (e) {
			Log("ERROR OCCURED");
		}
	}
}

exports.likeAndCommentPosts = async(page, posts, comments, commentsPropability) => {
	for (let i = 0; i < posts.length; i++) {
		Log('Liking ' + (i + 1) + '/' + posts.length);

		try {
			await page.goto(posts[i], {"waitUntil" : "networkidle0"});
			let wasLiked = await page.evaluate(() => {
				return (document.querySelector('.glyphsSpriteHeart__filled__24__red_5') == null) ? false : true
			});
			if (!wasLiked) {
				await page.click('.fr66n');
				
				if(random.int(0, 100) <= commentsPropability){
					await page.focus('textarea');
					await page.keyboard.type(comments[random.int(0, comments.length)]);
					await page.keyboard.type(String.fromCharCode(13));
				}

			} else {
				Log("Already liked");
			}
		} catch (e) {
			Log("ERROR OCCURED");
		}
	}
}