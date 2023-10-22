class Quiz {

	constructor() {

		console.log('quiz class loaded.')

		// Import question data.
		this.questionData = qbankQuestionData;

		/*




		console.log(this)



		*/

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

	startHandler(e) {

		console.log('start quiz...')
		console.log(this.questionData[0].id)

		// Remove start screen.
		const startScreen = document.getElementById('qbank-quiz-start');
		startScreen.remove();

		// Inject answer screen.
		const answerTemplate        = document.getElementById('qbank-quiz-answer-template');
		const answerTemplateContent = document.importNode(answerTemplate.content, true);
		answerTemplate.parentNode.insertBefore(answerTemplateContent, answerTemplate.nextSibling);

		// Load question content.
		const questionContentContainer = document.querySelector('.qbank-question-content');
		const tokenMarkup = questionContentContainer.innerHTML;
		const content = tokenMarkup.replace( '{{question_content}}', this.questionData[0].question_text )
		questionContentContainer.innerHTML = content;

		// Render answers.
		const answers = this.questionData[0].answers;
		const answerChoiceList = document.getElementById('qbank-answer-choice-list');
		const templateLi = answerChoiceList.querySelector('li');
		const answerMarkers = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L'];
		answers.forEach((answer, answerIndex) => {
			answer.marker = answerMarkers[answerIndex];
			const newLi = this.createLiFromTemplate(templateLi, answer);
			answerChoiceList.appendChild(newLi);
		});
		templateLi.remove();

	}

	// Create a function to clone and modify the template
	createLiFromTemplate(templateLi, data) {
	  const newLi = templateLi.cloneNode(false);
		newLi.innerHTML = templateLi.innerHTML;

	  newLi.innerHTML = newLi.innerHTML
	    .replace('{{answer_marker}}', data.marker)
	    .replace('{{answer_text}}', data.text);

	  return newLi;
	}

}

const quizController = new Quiz();
