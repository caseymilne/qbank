class Quiz {

	constructor() {
		console.log('quiz class loaded.')
		this.questionData = qbankQuestionData;

		this.elements = {
			startButton: document.querySelector('.qbank-quiz-start-button')
		}

		console.log(this)

		this.elements.startButton.addEventListener('click', this.startHandler.bind(this));


	}

	startHandler(e) {

		console.log('start quiz...')
		console.log(this.questionData[0].id)



		const quizTemplate = document.getElementById('qbank-quiz-template');
		const quizContent  = document.importNode(quizTemplate.content, true);
		quizTemplate.parentNode.insertBefore(quizContent, quizTemplate.nextSibling);

		const questionContentContainer = document.querySelector('.qbank-question-content');
		const tokenMarkup = questionContentContainer.innerHTML;
		const content = tokenMarkup.replace( '{{question_content}}', this.questionData[0].question_text )
		questionContentContainer.innerHTML = content;

	}

}

const quizController = new Quiz();
