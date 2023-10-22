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
		const questionId = e.currentTarget.getAttribute('question-id');

		if( !this.selectedAnswerIndex ) {
			console.error('No answer selected.');
			return;
		}

		const answerData = {
			question_id: questionId, // Replace with the actual question ID
			student_id: 999,  // Replace with the actual student ID
			answer_index: this.selectedAnswerIndex, // Include the selected choice
		};

		// Make a POST request to your custom API route
		fetch('/wp-json/qbank/v1/save-answer/123/456', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(answerData),
		})
		.then(response => response.json())
		.then(data => {

			const answerResultContainer = document.getElementById('qbank-answer-result');

			this.answerResultEvent(data);

			// Show question result.
			if(data.answer_correct) {
				answerResultContainer.innerHTML = 'CORRECT!';
			} else {
				answerResultContainer.innerHTML = 'INCORRECT!';
			}

			// Show question lesson.
			const lessonTemplate = document.getElementById('qbank-question-lesson-template');
			console.log(this.lessonContent)
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

			this.scrollToAnswerResults();

			// Highlight correct answer.
			const answerList = document.getElementById("qbank-answer-choice-list");
			const answerItems = answerList.getElementsByTagName("li");

			answerItems[data.answer_correct_index].classList.remove("qbank-answer-selected");
			answerItems[data.answer_correct_index].classList.add("qbank-answer-correct");

			// Highlight incorrect answer if provided.
			if( ! data.answer_correct ) {
				answerItems[data.answer_index].classList.remove("qbank-answer-selected");
				answerItems[data.answer_index].classList.add("qbank-answer-incorrect");
			}

			// Lock the question to prevent further answering.
			this.lockQuestion();


		})
		.catch(error => {
				console.error('Error:', error);
		});
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

		const eventDetails = {
		  questionId: 123,
		  correct: data.answer_correct,
		};

		const customEvent = new CustomEvent('qbank_question_answer_result', {
		  detail: eventDetails
		});

		document.dispatchEvent(customEvent);

	}

}


var selectedAnswerIndex = false;
var selectedAnswerEl    = false;

const answerChoices = document.querySelectorAll('.qbank-answer-choice');
answerChoices.forEach(choice => {
  choice.addEventListener('click', function(e) {

		// Remove existing selection if it exists.
		if(selectedAnswerEl) {
			selectedAnswerEl.classList.remove('qbank-answer-selected');
		}

		// Set current selection.
		selectedAnswerIndex = choice.getAttribute('answer-index');
		selectedAnswerEl    = e.currentTarget;
		selectedAnswerEl.classList.add('qbank-answer-selected')
	})
});

const answerButtons = document.querySelectorAll('.qbank-answer-button');

answerButtons.forEach(button => {
  button.addEventListener('click', function(e) {

		const questionId = e.currentTarget.getAttribute('question-id');

		if( !selectedAnswerIndex ) {
			console.error('No answer selected.');
			return;
		}

    const answerData = {
      question_id: questionId, // Replace with the actual question ID
      student_id: 999,  // Replace with the actual student ID
      answer_index: selectedAnswerIndex, // Include the selected choice
    };

    // Make a POST request to your custom API route
    fetch('/wp-json/qbank/v1/save-answer/123/456', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(answerData),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.message); // Log the response message
			const answerResultContainer = document.getElementById('qbank-answer-result');

			// Show question result.
			if(data.answer_correct) {
				answerResultContainer.innerHTML = 'CORRECT!';
			} else {
				answerResultContainer.innerHTML = 'INCORRECT!';
			}

			// Show question lesson.
			const lessonTemplate = document.getElementById('qbank-question-lesson-template');
			const lessonContent = document.importNode(lessonTemplate.content, true);
			console.log(lessonContent);
			lessonTemplate.parentNode.insertBefore(lessonContent, lessonTemplate.nextSibling);

			// Highlight correct answer.
			const answerList = document.querySelector("ul.qbank-answer-choice-list");
			const answerItems = answerList.getElementsByTagName("li");
			answerItems[data.answer_correct_index].classList.remove("qbank-answer-selected");
			answerItems[data.answer_correct_index].classList.add("qbank-answer-correct");

			// Highlight incorrect answer if provided.
			if( ! data.answer_correct ) {
				answerItems[data.answer_index].classList.remove("qbank-answer-selected");
				answerItems[data.answer_index].classList.add("qbank-answer-incorrect");
			}


    })
    .catch(error => {
        console.error('Error:', error);
    });

  });
});
