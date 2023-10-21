var selectedAnswerIndex = false;

const answerChoices = document.querySelectorAll('.qbank-answer-choice');
answerChoices.forEach(choice => {
  choice.addEventListener('click', function(event) {
		selectedAnswerIndex = choice.getAttribute('answer-index')
	})
});

const answerButtons = document.querySelectorAll('.qbank-answer-button');

answerButtons.forEach(button => {
    button.addEventListener('click', function(event) {

			if( !selectedAnswerIndex ) {
				console.error('No answer selected.');
				return;
			}

      const answerData = {
          question_id: 30, // Replace with the actual question ID
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
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
