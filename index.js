// imports
const { Cluster } = require('puppeteer-cluster');
const puppeteer = require('puppeteer');
// const readline = require("readline");
const prompt = require('prompt');


// global constants
const maxPoolSize = 30; 
let totalFormSubmissions = 100;
let formURL = 'https://docs.google.com/forms/d/e/1FAIpQLScR_SJJ6a68ilhKSy6j9AV-aL9flFiIjl0boZHIuZFmSb5nEA/viewform';

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

	// To answer questions, first identify selectors of all similar questions type
	// then use the selector index to select the question
	// then perform an action to answer the question,
	// e.g. click or type an answer


	// Short Answer questions
	const selectors = await page.$$('.quantumWizTextinputPaperinputInput');
	await selectors[0].click();
	await page.keyboard.type('Random stuff here');

	// Other fields here...

	// Submit form
	await page.click(".quantumWizButtonPaperbuttonLabel");
	await page.waitForNavigation();

	const submissionPage = await page.url();
	
	if (!submissionPage.includes("formResponse")) {
		throw new Error('This worker was not able to submit a form!');
	}
}
