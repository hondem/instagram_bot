const fs = require('fs');
const puppeteer = require('puppeteer');

/* Args variables */
let __DEBUG_MODE = false;

/* Handle program params */
process.argv.forEach((val, index, array) => {
	if (val == '--debug') __DEBUG_MODE = true;
});

/* Program helpers */
const debugLog = (message) => {
	if (__DEBUG_MODE) console.log(message);
}

let config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

/* Lets PUPPETEER! */

function main(){
	(async () => {
		for (let userIndex = 0; userIndex < config.accounts.length; userIndex++) {
			let currentAcount = config.accounts[userIndex];
			
			console.log("STARTING NEW BROWSER: ", new Date());
			debugLog("Starting browser");
			const browser = await puppeteer.launch();
	
			debugLog("Opening new page");
			const page = await browser.newPage();
	
			debugLog("Setting up environment");
			page.setViewport({
				width: 1920,
				height: 1080
			});
	
			debugLog("Browsing...");
			try{
				await page.goto('http://www.instagram.com/accounts/login/?source=auth_switcher');
			} catch(e){
				console.log("ERROR: ", new Date());
			}
			await page.waitFor(4000);
	
			debugLog("LOGGING IN WITH:");
			debugLog("Username: " + currentAcount.username);
			debugLog("Password: ******************");
	
			await page.focus('input[name="username"]');
			await page.keyboard.type(currentAcount.username);
	
			await page.focus('input[name="password"]');
			await page.keyboard.type(currentAcount.password);
	
			await page.click('button[type="submit"]');
			debugLog("LOGIN SUCCESS!");
			await page.screenshot({
				path: 'login.png'
			});
			await page.waitFor(4000);
	
	
			debugLog("Fetching hashtags...");
	
			const relevants = [];
	
			for (let y = 0; y < currentAcount.hashtags.length; y++) {
				debugLog("HASHTAG:" + currentAcount.hashtags[y]);
				try {
					await page.goto("https://www.instagram.com/explore/tags/" + currentAcount.hashtags[y] + '/');
				} catch (e) {
					debugLog("Problem fetching hashtag: " + currentAcount.hashtags[y]);
				}
	
				for (let __ = 0; __ < 10; __++) {
					await page.evaluate(_ => {
						window.scrollBy(0, window.innerHeight);
					});
					await page.waitFor(3000);
				}
	
				const hrefs = await page.$$eval('a', as => as.map(a => a.href));
	
				for (let i = 0; i < hrefs.length; i++) {
					if (hrefs[i].includes('/p/')) relevants.push(hrefs[i]);
				}
			}
	
			debugLog('FETCHING DONE!');
			debugLog('Fetched ' + relevants.length + ' pictures');
	
			let maxPosts = (relevants.length > 300) ? 300 : relevants.length;
	
			for (let i = 0; i < maxPosts; i++) {
				debugLog('Liking ' + (i + 1) + '/' + maxPosts);
	
				try {
					await page.goto(relevants[i]);
					let wasLiked = await page.evaluate(() => {
						return (document.querySelector('.glyphsSpriteHeart__filled__24__red_5') == null) ? false : true
					});
					if (!wasLiked) {
						await page.click('.fr66n');
					} else {
						debugLog("Skipping this..");
					}
				} catch (e) {
					debugLog('ERROR OCCURED');
				}
				await page.screenshot({
					path: 'logs/log_' + i + '.png'
				});
			}
			debugLog("Success!");

			if(userIndex == config.accounts.length - 1){
				debugLog(new Date());
			}

			await browser.close();
		}
	})();
}

setInterval(main.bind(this), 3600000);