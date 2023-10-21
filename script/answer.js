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
