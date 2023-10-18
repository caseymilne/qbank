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

	add_action( 'elementor/widgets/register', [$this, 'register_new_widgets'] );



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

	}

}

new Plugin();
