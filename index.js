// imports
const { Cluster } = require('puppeteer-cluster');
const puppeteer = require('puppeteer');
// const readline = require("readline");
const prompt = require('prompt');


// global constants
const maxPoolSize = 20; // <= 30 is optimal. Should make less for weaker PCs
let totalFormSubmissions = 100;
// testing purposes
let formURL = 'https://docs.google.com/forms/d/e/1FAIpQLSc3B8GU0_AHczDT0BuVzGcOAEEO0JYBJQKXLtJoutgf_mGGTQ/viewform'; 

// user input
const properties = [
	{
		name: 'Form URL',
		validator: /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i,
		warning: 'Form URL must be a valid google forms url'
	},
	{
		name: 'Total submissions',
		validator: /^[0-9]+$/,
		warning: 'Total submissions must be a natural number'
	}
];

prompt.start();

prompt.get(properties, async (err, result) => {
	if (err) {
		console.error(err);
		return;
	}

	// read data from user input
	formURL = result['Form URL'];
	totalFormSubmissions = result['Total submissions'];

	// run the cluster
	await startCluster();
});


// sessions cluster
const startCluster = async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: maxPoolSize,
		monitor: true
  });

  await cluster.task(async ({ page, data: url }) => {
    await processForm(page, url);
  });

	for (let i = 0; i < totalFormSubmissions; i++) {
		cluster.queue(formURL);
	}

  await cluster.idle();
  await cluster.close();
};


// all form processing related stuff is here
const processForm = async (page, url) => {
	// Opening Form
	await page.goto(url, {
		waitUntil: 'networkidle2'
	});

	// MCQ and Checkbox Questions
	const selectors = await page.$$('.docssharedWizToggleLabeledLabelWrapper');
	
	// Укажите Ваш возраст (radio)
	await selectors[getRandomInt(0, 4)].click();

	// Укажите Ваш статус (radio)
	await selectors[getRandomInt(5, 8)].click();
	
	// Укажите Ваш пол (radio)
	await selectors[getRandomInt(9, 10)].click();

	// Укажите Ваш район (dropdown menu)
	await page.click('.quantumWizMenuPaperselectOption');
	await page.waitForTimeout(200);
	const dropDownItems = await page.$$('.quantumWizMenuPaperselectPopup > .quantumWizMenuPaperselectOption');
	await dropDownItems[1].click();
	await page.waitForTimeout(500);

	// Знакомы ли вы с правилами безопасного поведения в Интернете (radio)
	await selectors[getRandomInt(11, 14)].click();

	// Выберите из списка основные источники угроз информационной безопасности (checkboxes)
	await selectors[getRandomInt(15, 17)].click();
	
	// Основными проблемами информационной безопасности являются (radio)
	await selectors[getRandomInt(18, 19)].click();
	
	// Когда вы получаете спам-сообщения по почте (e-mail) с каким-либо файлом, следует (radio)
	await selectors[getRandomInt(20, 22)].click();
	
	// Какие пароли вы используете для защиты аккаунтов (radio)
	await selectors[getRandomInt(23, 26)].click();

	// Как вы считаете, что из нижеперечисленного относится к персональным данным? (checkboxes)
	await selectors[getRandomInt(27, 30)].click();

	// Что относится к биометрическим персональным данным (radio)
	await selectors[getRandomInt(31, 34)].click();

	// Если при обработке персональных данных организацией нарушаются ваши права по защите персональных данных, куда вы можете обратиться за помощью (radio)
	await selectors[getRandomInt(35, 37)].click();

	// Какой из предложенных форматов файла является наиболее защищенным от несанкционированного доступа (radio)
	await selectors[getRandomInt(38, 41)].click();

	// Вы зашли в свой аккаунт в социальной сети и обнаружили, что некоторые новые входящие сообщения прочитаны. Вы уверены, что не читали эти сообщения. Что нужно сделать (radio)
	await selectors[getRandomInt(42, 45)].click();

	// В интернете вы наткнулись на объявление «На этом сайте ты можешь смотреть все закрытые фотографии своих друзей в соцсетях!» и нажали на него. Открылся сайт, куда необходимо ввести ваш логин и пароль от страницы в социальной сети. Какими будут Ваши действия (radio)
	await selectors[getRandomInt(46, 49)].click();

	// По закону сведения, взятые из общедоступных источников можно использовать без согласия человека. Относятся ли к таким источникам соцсети (radio)
	await selectors[getRandomInt(50, 52)].click();
	
	// Какими видами интернет-атак Вы сталкивались (radio)
	await selectors[getRandomInt(53, 56)].click();
	
	// Вы находитесь в кафе с друзьями, и Вам нужно срочно перевести небольшую сумму денег родственнику. Какой из предложенных вариантов действий следует выбрать, как самый безопасный (radio)
	await selectors[getRandomInt(58, 59)].click();


	// Submit form
	await page.click(".appsMaterialWizButtonPaperbuttonFocusOverlay");
	await page.waitForNavigation();

	const submissionPage = await page.url();
	
	if (!submissionPage.includes("formResponse")) {
		throw new Error('This worker was not able to submit a form!');
	}
}

// random ints [min; max]
const getRandomInt = (min, max) => {
	min = Math.ceil(min);
	max = Math.floor(max);

	return Math.floor(Math.random() * (max - min + 1)) + min;
}


const test = async (URL) => {
	try {
		browser = await puppeteer.launch({
			headless: false,
			//headless option runs the browser in the command line
			//use false option to launch browser with graphic interface
			args: ['--no-sandbox'],
			// slowMo: 100
		});	


		const page = await browser.newPage();

		await page.goto(URL, {waitUntil: 'networkidle2'});

		// MCQ and Checkbox Questions
		const selectors = await page.$$('.docssharedWizToggleLabeledLabelWrapper');
		
		// Укажите Ваш возраст (radio)
		await selectors[getRandomInt(0, 4)].click();

		// Укажите Ваш статус (radio)
		await selectors[getRandomInt(5, 8)].click();
		
		// Укажите Ваш пол (radio)
		await selectors[getRandomInt(9, 10)].click();

		// Укажите Ваш район (dropdown menu)
		await page.click('.quantumWizMenuPaperselectOption');
		await page.waitForTimeout(200);
		const dropDownItems = await page.$$('.quantumWizMenuPaperselectPopup > .quantumWizMenuPaperselectOption');
		await dropDownItems[1].click();
		await page.waitForTimeout(500);


		// Знакомы ли вы с правилами безопасного поведения в Интернете (radio)
		await selectors[getRandomInt(11, 14)].click();

		// Выберите из списка основные источники угроз информационной безопасности (checkboxes)
		await selectors[getRandomInt(15, 17)].click();
		
		// Основными проблемами информационной безопасности являются (radio)
		await selectors[getRandomInt(18, 19)].click();
		
		// Когда вы получаете спам-сообщения по почте (e-mail) с каким-либо файлом, следует (radio)
		await selectors[getRandomInt(20, 22)].click();
		
		// Какие пароли вы используете для защиты аккаунтов (radio)
		await selectors[getRandomInt(23, 26)].click();

		// Как вы считаете, что из нижеперечисленного относится к персональным данным? (checkboxes)
		await selectors[getRandomInt(27, 30)].click();

		// Что относится к биометрическим персональным данным (radio)
		await selectors[getRandomInt(31, 34)].click();

		// Если при обработке персональных данных организацией нарушаются ваши права по защите персональных данных, куда вы можете обратиться за помощью (radio)
		await selectors[getRandomInt(35, 37)].click();

		// Какой из предложенных форматов файла является наиболее защищенным от несанкционированного доступа (radio)
		await selectors[getRandomInt(38, 41)].click();

		// Вы зашли в свой аккаунт в социальной сети и обнаружили, что некоторые новые входящие сообщения прочитаны. Вы уверены, что не читали эти сообщения. Что нужно сделать (radio)
		await selectors[getRandomInt(42, 45)].click();

		// В интернете вы наткнулись на объявление «На этом сайте ты можешь смотреть все закрытые фотографии своих друзей в соцсетях!» и нажали на него. Открылся сайт, куда необходимо ввести ваш логин и пароль от страницы в социальной сети. Какими будут Ваши действия (radio)
		await selectors[getRandomInt(46, 49)].click();

		// По закону сведения, взятые из общедоступных источников можно использовать без согласия человека. Относятся ли к таким источникам соцсети (radio)
		await selectors[getRandomInt(50, 52)].click();
		
		// Какими видами интернет-атак Вы сталкивались (radio)
		await selectors[getRandomInt(53, 56)].click();
		
		// Вы находитесь в кафе с друзьями, и Вам нужно срочно перевести небольшую сумму денег родственнику. Какой из предложенных вариантов действий следует выбрать, как самый безопасный (radio)
		await selectors[getRandomInt(58, 59)].click();


		// Submit form
		await page.click(".appsMaterialWizButtonPaperbuttonFocusOverlay");
		await page.waitForNavigation();

		const submissionPage = await page.url();
		
		if (!submissionPage.includes("formResponse")) {
			throw new Error('This worker was not able to submit a form!');
		}


		await page.close();
		await browser.close();
	}
	catch(err) {
		console.error(err);
	}
}
