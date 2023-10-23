class QBANK_Answer {

	lessonContent = false;

	constructor() {

	}

	setAnswerLesson(lessonContent) {
		this.lessonContent = lessonContent;
	}

	attachAnswerChoiceEvents() {

    this.boundSelectionHandler = this.selectionHandler.bind(this);
    const answerChoices = document.querySelectorAll('.qbank-answer-choice');
    answerChoices.forEach(choice => {
      choice.addEventListener('click', this.boundSelectionHandler);
    });

    // Enable answering with class on the list.
    const answerChoiceList = document.getElementById('qbank-answer-choice-list');
    answerChoiceList.classList.add('qbank-answering-enabled');
  }

	// Add a method to remove the click event handlers if needed.
  removeAnswerChoiceEvents() {
    const answerChoices = document.querySelectorAll('.qbank-answer-choice');
    answerChoices.forEach(choice => {
      choice.removeEventListener('click', this.boundSelectionHandler);
    });
  }

	removeAnswerButtonEvents() {
		const answerButtons = document.querySelectorAll('.qbank-answer-button');
		answerButtons.forEach(button => {
		  button.removeEventListener('click', this.boundAnswerHandler);
		});
	}

	selectionHandler(e) {



    // Remove existing selection if it exists.
    if (this.selectedAnswerEl) {
      this.selectedAnswerEl.classList.remove('qbank-answer-selected');
    }

    // Set the current selection.
    this.selectedAnswerIndex = e.currentTarget.getAttribute('answer-index');
    this.selectedAnswerEl = e.currentTarget;
    this.selectedAnswerEl.classList.add('qbank-answer-selected');



  }

	attachAnswerButtonEvents() {

		this.boundAnswerHandler = this.answerHandler.bind(this);
		const answerButtons = document.querySelectorAll('.qbank-answer-button');

		answerButtons.forEach(button => {
		  button.addEventListener('click', this.boundAnswerHandler);
		});

	}

	answerHandler(e) {
		const questionId         = e.currentTarget.getAttribute('question-id');
		const questionRevisionId = e.currentTarget.getAttribute('question-revision-id');

		if( !this.selectedAnswerIndex ) {
			console.error('No answer selected.');
			return;
		}

		const answerData = {
			question_id: questionId,
			question_revision_id: questionRevisionId,
			answer_index: this.selectedAnswerIndex,
		};

		// Make a POST request to your custom API route
		fetch('/wp-json/qbank/v1/save-answer', {
			method: 'POST',
			headers: {
	      'Content-Type': 'application/json',
	      'X-WP-Nonce': qbankQuizData.nonce,
	    },
			body: JSON.stringify(answerData),
		})
		.then(response => response.json())
		.then(data => {

			this.answerResultEvent(data);
			this.showQuestionResult(data.answer_correct);
			this.showLessonQuestion();
			this.scrollToAnswerResults();

			// Highlight correct answer.
			this.highlightCorrectAnswer(data.answer_correct_index);

			// Highlight incorrect answer if provided.
			this.highlightIncorrectAnswer(data.answer_correct, data.answer_index);

			// Lock the question to prevent further answering.
			this.lockQuestion();

		})
		.catch(error => {
				console.error('Error:', error);
		});
	}

	highlightCorrectAnswer(correctAnswerIndex) {
		const answerList = document.getElementById("qbank-answer-choice-list");
		const answerItems = answerList.getElementsByTagName("li");
		answerItems[correctAnswerIndex].classList.remove("qbank-answer-selected");
		answerItems[correctAnswerIndex].classList.add("qbank-answer-correct");
	}

	highlightIncorrectAnswer(isCorrect, answerIndex) {
		if(isCorrect) { return; }
		const answerList = document.getElementById("qbank-answer-choice-list");
		const answerItems = answerList.getElementsByTagName("li");
		answerItems[answerIndex].classList.remove("qbank-answer-selected");
		answerItems[answerIndex].classList.add("qbank-answer-incorrect");
	}

	showQuestionResult(answerCorrect) {
		// Show question result.
		const answerResultContainer = document.getElementById('qbank-answer-result');
		if(answerCorrect) {
			answerResultContainer.innerHTML = 'CORRECT!';
		} else {
			answerResultContainer.innerHTML = 'INCORRECT!';
		}
	}

	showLessonQuestion() {
		// Show question lesson.
		const lessonTemplate = document.getElementById('qbank-question-lesson-template');

		if(lessonTemplate && this.lessonContent !== null) {
			const lessonFragment = lessonTemplate.content.cloneNode(true);
			const lessonElement  = lessonFragment.querySelector('.qbank-question-lesson');
			const container = document.getElementById('qbank-answer-result');
			if (container) {
				console.log(lessonElement);
				lessonElement.innerHTML = lessonElement.innerHTML.replace('{{question-lesson}}', this.lessonContent);
				container.appendChild(lessonElement);
			}
		}
	}

	scrollToAnswerResults() {
		const element = document.getElementById('qbank-answer-result');
		if (element) {
		  element.scrollIntoView({ behavior: 'smooth' });
		}
	}

	lockQuestion() {

		const answerChoiceList = document.getElementById('qbank-answer-choice-list');
		answerChoiceList.classList.remove('qbank-answering-enabled');
		this.removeAnswerChoiceEvents();
		this.removeAnswerButtonEvents();

	}

	answerResultEvent(data) {

		console.log('answer result event data:')
		console.log(data)

		const customEvent = new CustomEvent('qbank_question_answer_result', {
		  detail: data
		});

		document.dispatchEvent(customEvent);

	}

}
