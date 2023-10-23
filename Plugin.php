<?php

/*
 *
 * Plugin Name: QBank
 *
 */

namespace QBank;

define( 'QBANK_URL', plugin_dir_url( __FILE__ ) );
define( 'QBANK_PATH', plugin_dir_path( __FILE__ ) );
define( 'QBANK_VERSION', '1.1.0' );

class Plugin {

	public function __construct() {

		require_once( QBANK_PATH . '/inc/post_types.php' );
		require_once( QBANK_PATH . '/functions.php' );

		add_action( 'elementor/widgets/register', [$this, 'register_new_widgets'] );

		add_action('wp_enqueue_scripts', function() {
			wp_enqueue_style(
				'qbank-main-style',
				QBANK_URL . 'style/main.css',
				[],
				time(),
				'all'
			);
		});

	}

 /**
	* Register new Elementor widgets.
	*
	* @param \Elementor\Widgets_Manager $widgets_manager Elementor widgets manager.
	* @return void
	*/
	function register_new_widgets( $widgets_manager ) {

		require_once( QBANK_PATH . '/widgets/question-answers.php' );
		$widgets_manager->register( new \QBank\QuestionAnswers_Widget() );

		require_once( QBANK_PATH . '/widgets/answer-button.php' );
		$widgets_manager->register( new \QBank\AnswerButton_Widget() );

		require_once( QBANK_PATH . '/widgets/question-content.php' );
		$widgets_manager->register( new \QBank\QuestionContent_Widget() );

		require_once( QBANK_PATH . '/widgets/question-lesson.php' );
		$widgets_manager->register( new \QBank\QuestionLesson_Widget() );

		require_once( QBANK_PATH . '/widgets/quiz-start-button.php' );
		$widgets_manager->register( new \QBank\QuizStartButton_Widget() );

		require_once( QBANK_PATH . '/widgets/quiz-restart-button.php' );
		$widgets_manager->register( new \QBank\QuizRestartButton_Widget() );

		require_once( QBANK_PATH . '/widgets/quiz-review-button.php' );
		$widgets_manager->register( new \QBank\QuizReviewButton_Widget() );

		require_once( QBANK_PATH . '/widgets/quiz-question.php' );
		$widgets_manager->register( new \QBank\QuizQuestion_Widget() );

		require_once( QBANK_PATH . '/widgets/quiz-title.php' );
		$widgets_manager->register( new \QBank\QuizTitle_Widget() );

		require_once( QBANK_PATH . '/widgets/quiz-description.php' );
		$widgets_manager->register( new \QBank\QuizDescription_Widget() );

		require_once( QBANK_PATH . '/widgets/quiz-next-button.php' );
		$widgets_manager->register( new \QBank\QuizNextButton_Widget() );

		require_once( QBANK_PATH . '/widgets/quiz-previous-button.php' );
		$widgets_manager->register( new \QBank\QuizPreviousButton_Widget() );

		require_once( QBANK_PATH . '/widgets/quiz.php' );
		$widgets_manager->register( new \QBank\Quiz_Widget() );

		require_once( QBANK_PATH . '/widgets/quiz-score.php' );
		$widgets_manager->register( new \QBank\QuizScore_Widget() );

		require_once( QBANK_PATH . '/widgets/quiz-score-incorrect.php' );
		$widgets_manager->register( new \QBank\QuizScoreIncorrect_Widget() );

		require_once( QBANK_PATH . '/widgets/quiz-score-percent.php' );
		$widgets_manager->register( new \QBank\QuizScorePercent_Widget() );

		require_once( QBANK_PATH . '/widgets/quiz-score-answers.php' );
		$widgets_manager->register( new \QBank\QuizScoreAnswers_Widget() );

		require_once( QBANK_PATH . '/widgets/quiz-question-number.php' );
		$widgets_manager->register( new \QBank\QuizQuestionNumber_Widget() );

		require_once( QBANK_PATH . '/widgets/student-score-percent.php' );
		$widgets_manager->register( new \QBank\StudentScorePercent_Widget() );

		require_once( QBANK_PATH . '/widgets/quiz-question-count.php' );
		$widgets_manager->register( new \QBank\QuizQuestionCount_Widget() );

	}

	public static function activate() {

		// Check if Elementor is active
    if (!class_exists('Elementor\Plugin')) {
      return;
    }

		self::import_templates();

	}

	public static function import_templates() {

		error_log('running import templates...');

    // Create an instance of Elementor TemplateLibrary Manager
    $template_manager = new \Elementor\TemplateLibrary\Manager();

		// Define the path to your templates directory
		$templates_dir = QBANK_PATH . '/templates/';

		// Get a list of template files in the directory
		$template_files = glob($templates_dir . '*.json');

    // Check if the manager exists
    if (method_exists($template_manager, 'instance')) {

			// Import each template
	    foreach ($template_files as $template_file) {
        $template_data = file_get_contents($template_file);
        if ($template_data) {
          // Import the template into Elementor
          $import_result = $template_manager->instance()->import_template([
            'source' => 'local',
            'data' => $template_data,
          ]);
          // Check $import_result for success or error handling
					error_log(print_r($import_result, 1));
        }
	    }

	  } else {
			error_log('Instance method does not exist in template manager.');
		}

	}



}

new Plugin();

// Register activation hook.
register_activation_hook(__FILE__, ['\QBank\Plugin', 'activate']);
