class Quiz {

	constructor() {

		// Import question data.
		this.questionData = qbankQuestionData;

		// Show quiz start page.
		const startTemplate = document.getElementById('qbank-quiz-start-template');
		const startTemplateContent  = document.importNode(startTemplate.content, true);
		startTemplate.parentNode.insertBefore(startTemplateContent, startTemplate.nextSibling);

		// Init start button.
		this.elements = {
			startButton: document.querySelector('.qbank-quiz-start-button')
		}
		this.elements.startButton.addEventListener('click', this.startHandler.bind(this));

	}

	nextButtonInit() {
		this.elements = {
			nextButtons: document.querySelectorAll('.qbank-quiz-next-button')
		}
		this.elements.nextButtons.forEach((nextButton) => {
			nextButton.addEventListener('click', this.nextHandler.bind(this));
		});
	}

	nextHandler(e) {

		console.log('clicking next...')
		this.loadQuestion(1)

	}

	previousButtonInit() {
		this.elements = {
			previousButtons: document.querySelectorAll('.qbank-quiz-previous-button')
		}
		this.elements.previousButtons.forEach((previousButton) => {
			previousButton.addEventListener('click', this.previousHandler.bind(this));
		});
	}

	previousHandler(e) {

		console.log('clicking prev...')
		this.loadQuestion(0)

	}

	loadQuestion(questionIndex) {

		const answerScreen = document.getElementById('qbank-quiz-answer');
		if(answerScreen) {
			answerScreen.remove();
		}

		// Inject answer screen.
		const answerTemplate        = document.getElementById('qbank-quiz-answer-template');
		const answerTemplateContent = document.importNode(answerTemplate.content, true);
		answerTemplate.parentNode.insertBefore(answerTemplateContent, answerTemplate.nextSibling);

		console.log(questionIndex)
		console.log(this.questionData[questionIndex].question_text)

		// Load question content.
		const questionContentContainer = document.querySelector('.qbank-question-content');
		const tokenMarkup = questionContentContainer.innerHTML;
		const content = tokenMarkup.replace( '{{question_content}}', this.questionData[questionIndex].question_text )
		questionContentContainer.innerHTML = content;

		// Render answers.
		const answers = this.questionData[questionIndex].answers;
		const answerChoiceList = document.getElementById('qbank-answer-choice-list');
		const templateLi = answerChoiceList.querySelector('li');
		const answerMarkers = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L'];
		answers.forEach((answer, answerIndex) => {
			answer.index  = answerIndex;
			answer.marker = answerMarkers[answerIndex];
			const newLi = this.createLiFromTemplate(templateLi, answer);
			answerChoiceList.appendChild(newLi);
		});
		templateLi.remove();

		// Attach answer selection events.
		const $_answer = new QBANK_Answer();
		$_answer.attachAnswerChoiceEvents();
		$_answer.attachAnswerButtonEvents();
		$_answer.setAnswerLesson(this.questionData[questionIndex].lesson);

		// Update question ID in answer button.
		const answerButtons = document.querySelectorAll('.qbank-answer-button');
		answerButtons.forEach((answerButton) => {
			answerButton.setAttribute('question-id', this.questionData[questionIndex].id);
		});

		// Init quiz nav buttons.
		this.previousButtonInit();
		this.nextButtonInit();

	}

	startHandler(e) {

		// Remove start screen.
		const startScreen = document.getElementById('qbank-quiz-start');
		startScreen.remove();

		// Load question.
		this.loadQuestion(0);

	}

	// Create a function to clone and modify the template
	createLiFromTemplate(templateLi, answer) {
	  const listItem = templateLi.cloneNode(false);
		listItem.innerHTML = templateLi.innerHTML;
	  listItem.innerHTML = listItem.innerHTML
	    .replace('{{answer_marker}}', answer.marker)
	    .replace('{{answer_text}}', answer.text);
		listItem.setAttribute('answer-index', answer.index)
	  return listItem;
	}

}

const quizController = new Quiz();
