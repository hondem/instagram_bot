/**
 * This script was made by Jan Demel
 * jandemel98@gmail.com
 * The author doesn't take any responsibility with how you use this
 */

const Log = require('./log');

module.exports = async(page, credentials) => {
	try{
		await page.goto('http://www.instagram.com/accounts/login/?source=auth_switcher', {"waitUntil" : "networkidle0"})

		Log("LOGGING IN: " + credentials.username);

		await page.focus('input[name="username"]');
		await page.keyboard.type(credentials.username);

		await page.focus('input[name="password"]');
		await page.keyboard.type(credentials.password);

		await Promise.all([
			await page.click('button[type="submit"]'),
			page.waitForNavigation({ waitUntil: 'networkidle0' }),
		]);
		
		let loginSuccess = await page.evaluate((username) => {
			return (document.querySelector('a[href="/'+ username +'/"]') == null) ? false : true
		}, credentials.username);

		return loginSuccess;
		
	} catch(e) {
		Log("Couldn't log in!");
		Log("ERROR: " + e);
	}
}