class Quiz {

	questionData          = null;
	questionCount         = 0;
	currentQuestionIndex  = false;
	currentQuestionNumber = 0;

	constructor() {

		// Import question data.
		this.questionData = qbankQuestionData;
		this.questionCount = this.questionData.length;

		// Show quiz start page.
		const startTemplate = document.getElementById('qbank-quiz-start-template');
		const startTemplateContent  = document.importNode(startTemplate.content, true);
		startTemplate.parentNode.insertBefore(startTemplateContent, startTemplate.nextSibling);

		// Init start button.
		this.elements = {
			startButton: document.querySelector('.qbank-quiz-start-button')
		}
		this.elements.startButton.addEventListener('click', this.startHandler.bind(this));

		// Init scoring object.
		this.score = {
			answerCount: 0,
			correctCount: 0,
			incorrectCount: 0
		}

		// Track scoring on event.
		document.addEventListener('qbank_question_answer_result', (e) => {
			console.log(this.score)

			// Update score storage.
			this.score.answerCount++;

			const correct = e.detail.correct;
			if(correct) {
				this.score.correctCount++;
			}
			if(!correct) {
				this.score.incorrectCount++;
			}

			console.log(this.score)

			// Update score display.
			this.updateScoreDisplay();

		});

	}

	updateScoreDisplay() {

		// Remove all existing .quiz-score elements displayed.
		const scoreElementsCurrent = document.querySelectorAll('.quiz-score');
		if(scoreElementsCurrent.length) {
			scoreElementsCurrent.forEach((scoreElement) => {
				scoreElement.remove();
			});
		}

		// Insert score widgets into the DOM from templatese.
		const scoreWidgets = document.querySelectorAll('.quiz-score-template');
		if(scoreWidgets.length) {
			scoreWidgets.forEach((scoreWidget) => {
				const scoreWidgetFragment = document.importNode(scoreWidget.content, true);
				scoreWidget.parentNode.insertBefore(scoreWidgetFragment, scoreWidget.nextSibling);
			});
		}

		// Update the display.
		const scoreElements = document.querySelectorAll('.quiz-score');
		if(scoreElements.length) {
			scoreElements.forEach((scoreElement) => {
				scoreElement.innerHTML = scoreElement.innerHTML.replace('{{quiz-score-correct}}', this.score.correctCount);
				scoreElement.innerHTML = scoreElement.innerHTML.replace('{{quiz-score-incorrect}}', this.score.incorrectCount);
				scoreElement.innerHTML = scoreElement.innerHTML.replace('{{quiz-score-answers}}', this.score.answerCount);
			});
		}

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

		if(this.currentQuestionIndex === parseInt(this.questionCount - 1)) {
			console.error('Trying to handle a next click when current question is the last question available.');
			return;
		}

		const newQuestionIndex = parseInt(this.currentQuestionIndex +1);
		this.loadQuestion(newQuestionIndex)

	}

	nextButtonDisable() {
		this.elements = {
			nextButtons: document.querySelectorAll('.qbank-quiz-next-button')
		}
		this.elements.nextButtons.forEach((nextButton) => {
			nextButton.disabled = true;
		});
	}

	isFirstQuestion() {
		if(this.currentQuestionIndex === 0) {
			return true;
		}
		return false;
	}

	isLastQuestion() {
		if(this.currentQuestionIndex === parseInt(this.questionCount - 1)) {
			return true;
		}
		return false;
	}

	previousButtonInit() {
		this.elements = {
			previousButtons: document.querySelectorAll('.qbank-quiz-previous-button')
		}
		this.elements.previousButtons.forEach((previousButton) => {
			previousButton.addEventListener('click', this.previousHandler.bind(this));
		});
	}

	previousButtonDisable() {
		this.elements = {
			previousButtons: document.querySelectorAll('.qbank-quiz-previous-button')
		}
		this.elements.previousButtons.forEach((previousButton) => {
			previousButton.disabled = true;
		});
	}

	previousHandler(e) {
		if(this.currentQuestionIndex < 1) {
			console.error('Trying to handle a previous click when current question index is 0.');
			return;
		}

		const newQuestionIndex = parseInt(this.currentQuestionIndex -1);

		console.log('clicking prev...')
		this.loadQuestion(newQuestionIndex)

	}

	loadQuestion(questionIndex) {

		console.log(questionIndex)

		const answerScreen = document.getElementById('qbank-quiz-answer');
		if(answerScreen) {
			answerScreen.remove();
		}

		// Inject answer screen.
		const answerTemplate        = document.getElementById('qbank-quiz-answer-template');
		const answerTemplateContent = document.importNode(answerTemplate.content, true);
		answerTemplate.parentNode.insertBefore(answerTemplateContent, answerTemplate.nextSibling);

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

		// Update current question index.
		this.currentQuestionIndex  = questionIndex;
		this.currentQuestionNumber = questionIndex + 1;

		// Init quiz nav buttons.
		if( this.isFirstQuestion() ) {
			this.previousButtonDisable();
		} else {
			this.previousButtonInit();
		}

		if( this.isLastQuestion() ) {
			//this.nextButtonDisable();
			this.convertNextToFinishButton();
		} else {
			this.nextButtonInit();
		}

		// Update score display.
		this.updateScoreDisplay();

		// Update question number display.
		this.updateQuestionNumberDisplay();

	}

	updateQuestionNumberDisplay() {

		const questionNumberWidgets = document.querySelectorAll('.quiz-question-number');
		if( !questionNumberWidgets.length ) { return; }
		questionNumberWidgets.forEach((questionNumberWidget) => {
			questionNumberWidget.innerHTML = questionNumberWidget.innerHTML.replace('{{quiz-question-number}}', this.currentQuestionNumber);
		});

	}

	convertNextToFinishButton() {

		this.elements = {
			nextButtons: document.querySelectorAll('.qbank-quiz-next-button')
		}
		this.elements.nextButtons.forEach((nextButton) => {
			console.log(nextButton)
			nextButton.addEventListener('click', this.reviewHandler.bind(this));
			nextButton.innerHTML = 'Finish';
		});

	}

	reviewHandler() {

		console.log('review handler called...')

		// Remove answer screen if shown.
		const answerScreen = document.getElementById('qbank-quiz-answer');
		if(answerScreen) {
			answerScreen.remove();
		}

		// Inject review screen.
		const template        = document.getElementById('qbank-quiz-review-template');
		const templateContent = document.importNode(template.content, true);
		template.parentNode.insertBefore(templateContent, template.nextSibling);

		// Update score display.
		this.updateScoreDisplay();

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
