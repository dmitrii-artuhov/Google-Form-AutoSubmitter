// imports
const { Cluster } = require('puppeteer-cluster');
const puppeteer = require('puppeteer');


// global constants
const maxPoolSize = 30; 
const totalFormSubmissions = 100;
const formURL = 'https://docs.google.com/forms/d/e/1FAIpQLScR_SJJ6a68ilhKSy6j9AV-aL9flFiIjl0boZHIuZFmSb5nEA/viewform';

(async () => {
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
})();



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
