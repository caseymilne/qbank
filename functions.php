<?php

/* Loose code to organize */

// API routes
function register_qbank_api_routes() {
  register_rest_route('qbank/v1', '/save-answer/(?P<question_id>\d+)/(?P<student_id>\d+)', array(
    'methods' => 'POST',
    'callback' => 'save_answer_to_question',
    'args' => array(
      'question_id' => array(),
      'student_id' => array(),
    ),
  ));
}

function save_answer_to_question($request) {
    $question_id = $request->get_param('question_id');
    $student_id = $request->get_param('student_id');

    // Assuming the request contains JSON data with 'answer' field
    $answer_data = $request->get_json_params();

    if (empty($answer_data) || !isset($answer_data['answer_index'])) {
        return rest_ensure_response(array(
            'error' => 'Invalid data. Please provide an "answer" field in the request.'
        ));
    }

    $answer_index = (int) $answer_data['answer_index'];

		// Check if answer is true or false.
		$is_correct = is_answer_correct($question_id, $answer_index);
		$correct    = ($is_correct === true) ? 1 : 0;

    // Create an object to pass to the insert_qbank_answer function
    $answer_object = (object) array(
      'user'         => $student_id,
      'question'     => $question_id,
      'answer_index' => $answer_index,
			'correct'      => $correct
    );

    // Attempt to insert the answer into the database
    $inserted_id = insert_qbank_answer($answer_object);

    if ($inserted_id === false) {
        return rest_ensure_response(array(
            'error' => 'Error saving the answer.'
        ));
    } else {
      return rest_ensure_response(array(
        'message' => 'Answer saved successfully',
        'question_id' => $question_id,
        'student_id' => $student_id,
				'answer_correct' => $is_correct,
        'inserted_id' => $inserted_id
      ));
    }
}

add_action('rest_api_init', 'register_qbank_api_routes');

// SAVE ANSWER RECORDS

function insert_qbank_answer($answer) {
    global $wpdb; // WordPress database object

    // Define the table name
    $table_name = $wpdb->prefix . 'qbank_answer';

    // Extract properties from the object
    $user = $answer->user;
    $question = $answer->question;
    $answer_index = $answer->answer_index;

    // Prepare data for insertion
    $data = array(
      'user' => $answer->user,
      'question' => $answer->question,
      'answer_index' => $answer->answer_index,
			'correct' => $answer->correct
    );

    // Insert the data into the custom table
    $result = $wpdb->insert($table_name, $data);

    if ($result === false) {
        // Handle the insertion error if needed
        return false;
    } else {
        // Return the ID of the inserted row
        return $wpdb->insert_id;
    }
}

function is_answer_correct($question_id, $answer_index) {

  $answers = get_field('answers', $question_id);
  if (empty($answers) || !is_array($answers)) {
    return false;
  }

  foreach ($answers as $answer_check_index => $answer) {
    if (isset($answer['correct']) && $answer['correct'] && $answer_check_index == $answer_index) {
      return true;
    }
  }

  return false;
}
