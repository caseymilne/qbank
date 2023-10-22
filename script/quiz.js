class Quiz {

	questionData          = null;
	questionCount         = 0;
	currentQuestionIndex  = false;
	currentQuestionNumber = 0;
	questionsAnswered     = [];

	constructor() {

		// Import question data.
		this.questionData = qbankQuestionData;
		this.questionCount = this.questionData.length;

		// Import quiz settings.
		this.settings = qbankQuizSettings;

		// Create quiz session.
		this.createSession();

		// Init scoring object.
		this.initScoringObject();

		// Show start screen if quiz supports it.
		if( this.settings.show_start !== false ) {
			this.startScreenShow();
		} else {
			this.answerScreenShow();
		}

		// Track scoring on event.
		document.addEventListener('qbank_question_answer_result', (e) => {

			// Update score storage.
			this.score.answerCount++;

			const correct = e.detail.correct;
			if(correct) {
				this.score.correctCount++;
			}
			if(!correct) {
				this.score.incorrectCount++;
			}

			// Update percentage (in progress, running).
			if(this.score.answerCount > 0 && this.score.correctCount > 0) {
				this.score.percent = Math.round( ( this.score.correctCount / this.score.answerCount ) * 100 );
			} else {
				this.score.percent = 0;
			}

			// Update score display.
			this.updateScoreDisplay();

			// Add current question to the questionsAnswered array.
			this.questionsAnswered.push(this.currentQuestionIndex);

		});

	}

	initScoringObject() {
		this.score = {
			answerCount: 0,
			correctCount: 0,
			incorrectCount: 0,
			percent: 0
		}
	}

	questionCountDisplay() {

		const widgets = document.querySelectorAll('.quiz-question-count-template');
		if(widgets.length) {
			widgets.forEach((widget) => {
				const widgetFragment = document.importNode(widget.content, true);
				widget.parentNode.insertBefore(widgetFragment, widget.nextSibling);
			});
		}

		const els = document.querySelectorAll('.quiz-question-count');
		if(els.length) {
			els.forEach((el) => {
				el.innerHTML = el.innerHTML.replace('{{quiz-question-count}}', this.questionCount);
			});
		}



	}

	startScreenShow() {
		// Show quiz start page.
		const startTemplate = document.getElementById('qbank-quiz-start-template');
		const startTemplateContent  = document.importNode(startTemplate.content, true);
		startTemplate.parentNode.insertBefore(startTemplateContent, startTemplate.nextSibling);

		// Init start button.
		this.elements = {
			startButton: document.querySelector('.qbank-quiz-start-button')
		}
		this.elements.startButton.addEventListener('click', this.startHandler.bind(this));

		// Show question count if it exists.
		this.questionCountDisplay();

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
				scoreElement.innerHTML = scoreElement.innerHTML.replace('{{quiz-score-percent}}', this.score.percent);
			});
		}

	}

	reviewButtonInit() {
		this.elements = {
			reviewButtons: document.querySelectorAll('.qbank-quiz-review-button')
		}
		this.elements.reviewButtons.forEach((reviewButton) => {
			reviewButton.addEventListener('click', this.reviewHandler.bind(this));
		});
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
		this.loadQuestion(newQuestionIndex)

	}

	isQuestionAnswered(questionIndex) {
		if (this.questionsAnswered.includes(questionIndex)) {
		  return true;
		}
		return false;
	}

	loadQuestion(questionIndex) {

		// Check if question being loaded has already been answered.
		const questionAnswered = this.isQuestionAnswered(questionIndex);

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

		// Attach answer events only if question not already answered.
		if( ! questionAnswered ) {
			$_answer.attachAnswerChoiceEvents();
			$_answer.attachAnswerButtonEvents();
		}

		$_answer.setAnswerLesson(this.questionData[questionIndex].lesson);

		// Update question ID in answer button.
		const answerButtons = document.querySelectorAll('.qbank-answer-button');
		answerButtons.forEach((answerButton) => {
			answerButton.setAttribute('question-id', this.questionData[questionIndex].id);
			answerButton.setAttribute('question-revision-id', this.questionData[questionIndex].revision_id);
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

		this.reviewButtonInit();

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
			nextButton.addEventListener('click', this.reviewHandler.bind(this));
			nextButton.innerHTML = 'Finish';
		});

	}

	reviewHandler() {

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

		// Init restart button if it exists.
		this.restartButtonInit();

	}

	startHandler(e) {

		this.answerScreenShow();



	}

	answerScreenShow() {

		// Remove start screen.
		const startScreen = document.getElementById('qbank-quiz-start');
		if(startScreen) {
			startScreen.remove();
		}


		// Load question.
		this.loadQuestion(0);

	}

	restartButtonInit() {
		const buttons = document.querySelector('.qbank-quiz-restart-button')
		buttons.addEventListener('click', this.restartHandler.bind(this));
	}

	restartHandler(e) {

		// Remove review screen.
		const screen = document.getElementById('qbank-quiz-review');
		screen.remove();

		// Init scoring object.
		this.initScoringObject();

		// Show start screen.
		this.startScreenShow();

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

	createSession() {

		const requestData = {
			quiz_id: qbankQuizData.quizId
		}

		fetch('/wp-json/qbank/v1/session', {
			method: 'POST',
			headers: {
	      'Content-Type': 'application/json',
	      'X-WP-Nonce': qbankQuizData.nonce,
	    },
			body: JSON.stringify(requestData),
		})
		.then(response => response.json())
		.then(data => {

			console.log(data)


		})
		.catch(error => {
				console.error('Error:', error);
		});

	}

}

const quizController = new Quiz();
