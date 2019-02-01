const fs = require('fs');
const puppeteer = require('puppeteer');

/* Args variables */
let __DEBUG_MODE = false;

/* Handle program params */
process.argv.forEach((val, index, array) => {
	if(val == '--debug') __DEBUG_MODE = true;
});

/* Program helpers */
const debugLog = (message) => {
	if(__DEBUG_MODE) console.log(message);
}

let config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

/* Lets PUPPETEER! */
(async() => {
	debugLog("Starting browser");
	const browser = await puppeteer.launch();

	debugLog("Opening new page");
	const page = await browser.newPage();

	debugLog("Setting up environment");
	page.setViewport({ width:1920, height:1080 });

	debugLog("Browsing...");
	await page.goto('http://www.instagram.com/accounts/login/?source=auth_switcher');
	await page.waitFor(4000);

	debugLog("LOGGING IN WITH:");
	debugLog("Username: " + config.username);
	debugLog("Password: ******************");

	await page.focus('input[name="username"]');
	await page.keyboard.type(config.username);

	await page.focus('input[name="password"]');
	await page.keyboard.type(config.password);

	await page.click('button[type="submit"]');
	debugLog("LOGIN SUCCESS!");
	await page.screenshot({ path:'login.png'} );
	await page.waitFor(4000);

	debugLog("Fetching hashtags...");

	const relevants = [];

	for(let y = 0; y < config.hashtags.length; y++){
		debugLog("HASHTAG:" + config.hashtags[y]);
		await page.goto("https://www.instagram.com/explore/tags/" + config.hashtags[y] + '/');
		
		for(let __ = 0; __ < 30; __++){
			await page.evaluate(_ => {
				window.scrollBy(0, window.innerHeight);
			});
			await page.waitFor(1000);
		}

		const hrefs = await page.$$eval('a', as => as.map(a => a.href));
		
		for(let i = 0; i < hrefs.length; i++){
			if(hrefs[i].includes('/p/')) relevants.push(hrefs[i]);
		}
	}

	debugLog('FETCHING DONE!');
	debugLog('Fetched ' + relevants.length + ' pictures');

	for(let i = 0; i < relevants.length; i++){
		debugLog('Liking '+ (i + 1) +'/' + (relevants.length - 1));
		try{
			await page.goto(relevants[i]);
			await page.click('.fr66n');
		} catch (e) {
			debugLog('ERROR OCCURED');
		}
		await page.screenshot({path: 'logs/log_' + i + '.png'});
	}

	debugLog("Success!");

	await browser.close();
})();