/**
 * This script was made by Jan Demel
 * jandemel98@gmail.com
 * The author doesn't take any responsibility. Don't contact me :D
 */

const fs = require('fs');
const puppeteer = require('puppeteer');

const Login = require('./src/login');
const FetchHashtags = require('./src/fetchHashtag');
const { likeAndCommentPosts } = require('./src/posts');

let config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

(async () => {
	const browser = await puppeteer.launch({ headless: true });
	const page = (await browser.pages())[0];
	
	/* Singing user in */
	await Login(page, { username: config.username, password: config.password });

	/* Fetching hashtags specified in config.json */
	let posts = await FetchHashtags(page, config);
	/* Like all posts */
	await likeAndCommentPosts(page, posts, config.comments, config.commentsPropability);
	
	setInterval(async () => {
		/* Fetching hashtags specified in config.json */
		let posts = await FetchHashtags(page, config);
		/* Like all posts */
		await likeAndCommentPosts(page, posts, config.comments, config.commentsPropability);
	}, 3600000);
})();
