<?php

/* Loose code to organize */

// API routes
function register_qbank_api_routes() {
  register_rest_route('qbank/v1', '/save-answer', array(
    'methods' => 'POST',
    'callback' => 'save_answer_to_question'
  ));

	register_rest_route('qbank/v1', '/session', array(
    'methods' => 'POST',
    'callback' => 'qbank_session_create_callback',
    'args' => array(),
  ));

	register_rest_route('qbank/v1', '/session/end', array(
    'methods' => 'POST',
    'callback' => 'qbank_session_end_callback',
    'args' => array(),
  ));
}

function qbank_session_create_callback($request) {

	/*
		@TODO check if user has open session, if they do, close it.

	*/

	$quiz_id_sent = $request->get_param('quiz_id');
	if( $quiz_id_sent ) {
		$quiz_id = $quiz_id_sent;
	} else {
		$quiz_id = 0;
	}

	$user_id = get_current_user_id();
	if ( $user_id === 0 ) {
    return rest_ensure_response(array(
      'error' => 'Invalid user, or user not logged in.'
    ));
  }

	$session_data = array(
		'user_id' => $user_id,
		'quiz_id' => $quiz_id
	);
	$result = qbank_create_session($session_data);
	if ($result !== false) {
		return rest_ensure_response(array(
	    'success' => true
	  ));
	} else {
		return rest_ensure_response(array(
			'success' => false,
	    'error'   => 'Student session saved.'
	  ));
	}

}

function qbank_session_end_callback($request) {

	$session_id = $request->get_param('session_id');
	$user_id = get_current_user_id();

	/*
	 @TODO
			fetch existing session to check that it exists.
			update session row with the current timestamp in datetime format.
			send response confirming session ended.
		*/

	return rest_ensure_response(array(
		'message' => 'Session ended.',
	));

}

function save_answer_to_question($request) {

  // Parse JSON params.
  $answer_data  = $request->get_json_params();
	$question_id  = $answer_data['question_id'];
	$answer_index = (int) $answer_data['answer_index'];
	$question_revision_id = $answer_data['question_revision_id'];

  if (empty($answer_data) || ! isset($answer_index)) {
    return rest_ensure_response(array(
      'error' => 'Invalid data. Please provide an "answer" field in the request.'
    ));
  }

	// Get the correct answer index.
	$answer_correct_index = answer_correct_index($question_id);

	// Check if answer is true or false.
	$is_correct = is_answer_correct($question_id, $answer_index);
	$correct    = ($is_correct === true) ? 1 : 0;

  // Create an object to pass to the qbank_answer_create function
  $answer_object = (object) array(
    'user'              => get_current_user_id(),
    'question'          => $question_id,
		'question_revision' => $question_revision_id,
    'answer_index'      => $answer_index,
		'correct'           => $correct
  );

  // Attempt to insert the answer into the database
  $inserted_id = qbank_answer_create($answer_object);

  if ($inserted_id === false) {
    return rest_ensure_response(array(
      'error' => 'Error saving the answer.'
    ));
  } else {
    return rest_ensure_response(array(
      'message'              => 'Answer saved successfully',
      'question_id'          => $question_id,
      'student_id'           => $student_id,
			'answer_correct'       => $is_correct,
			'answer_index'         => $answer_index,
      'inserted_id'          => $inserted_id,
			'answer_correct_index' => $answer_correct_index
    ));
  }
}

add_action('rest_api_init', 'register_qbank_api_routes');

// SAVE ANSWER RECORDS

function qbank_answer_create($answer) {
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
			'question_revision' => $answer->question_revision,
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

function answer_correct_index($question_id) {

  $answers = get_field('answers', $question_id);
  if (empty($answers) || !is_array($answers)) {
    return false;
  }

  foreach ($answers as $answer_index => $answer) {
    if (isset($answer['correct']) && $answer['correct']) {
      return $answer_index;
    }
  }

	return false;

}

/**
 *
 * QBank Create Session.
 *
 * Example Usage:
 *
 * This code demonstrates how to use the qbank_create_session function to insert a new session
 * into the wp_qbank_session table.
 *
 * Usage:
 *
		 $session_data = array(
			 'user_id' => 123,
			 'quiz_id' => 456,
			 'start' => '2023-10-21 09:00:00',
			 'end' => '2023-10-21 10:00:00',
		 );
		 $result = qbank_create_session($session_data);
		 if ($result !== false) {
		 	// Data inserted successfully, and $result contains the inserted row's ID
		 } else {
			 Failed to insert data
		 }
 *
 * @param array $session_data An array containing session data, including user_id, quiz_id, start, and end.
 *
 * @return int|false The ID of the inserted row on success, or false on failure.
 */

function qbank_create_session($session_data) {

  global $wpdb;

    // Define the table name
    $table_name = $wpdb->prefix . 'qbank_session';

    // Extract data from the session_data array
    $user_id = $session_data['user_id'];
    $quiz_id = $session_data['quiz_id'];

    // Prepare the data for insertion
    $data = array(
        'user_id' => $user_id,
        'quiz_id' => $quiz_id
    );

    // Define the data format for the prepared statement
    $data_format = array('%d', '%d', '%s', '%s');

    // Insert the data into the database table
    $wpdb->insert($table_name, $data, $data_format);

    // Check for errors and return the result
    if ($wpdb->last_error) {
        return false; // Failed to insert data
    } else {
        return $wpdb->insert_id; // Returns the ID of the inserted row
    }
}
