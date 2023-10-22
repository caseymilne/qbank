<?php

namespace QBank;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}



/**
 * Elementor Question Answers Widget.
 *
 * Elementor widget that inserts an embbedable content into the page, from any given URL.
 *
 * @since 1.0.0
 */
class Quiz_Widget extends \Elementor\Widget_Base {

	public function __construct($data = [], $args = null) {
	  parent::__construct($data, $args);
	  wp_register_script( 'qbank-quiz', QBANK_URL . '/script/quiz.js', [ 'elementor-frontend' ], '1.0.0', true );
		wp_register_script( 'qbank-answer', QBANK_URL . '/script/answer.js', [ 'elementor-frontend', 'qbank-quiz' ], '1.0.0', true );
	}

	/**
	 * Get widget name.
	 *
	 * Retrieve widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'quiz';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve oEmbed widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return string Widget title.
	 */
	public function get_title() {
		return esc_html__( 'Quiz', 'qbank' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve oEmbed widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-code';
	}

	/**
	 * Get custom help URL.
	 *
	 * Retrieve a URL where the user can get more information about the widget.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return string Widget help URL.
	 */
	public function get_custom_help_url() {
		return 'https://developers.elementor.com/docs/widgets/';
	}

	/**
	 * Get widget categories.
	 *
	 * Retrieve the list of categories the oEmbed widget belongs to.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return array Widget categories.
	 */
	public function get_categories() {
		return [ 'general' ];
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the oEmbed widget belongs to.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return [ 'question', 'content' ];
	}

	public function get_script_depends() {
		return [ 'qbank-quiz' ];
		return [ 'qbank-answer' ];
	}

	/**
	 * Register oEmbed widget controls.
	 *
	 * Add input fields to allow the user to customize the widget settings.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function register_controls() {

		$this->start_controls_section(
			'content_section',
			[
				'label' => esc_html__( 'Content', 'qbank' ),
				'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'start_template',
			[
				'label' => esc_html__( 'Start Template ID', 'qbank' ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'input_type' => 'url',
				'placeholder' => esc_html__( 'Start Template ID', 'qbank' ),
			]
		);

		$this->add_control(
			'answer_template',
			[
				'label' => esc_html__( 'Answer Template ID', 'qbank' ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'input_type' => 'url',
				'placeholder' => esc_html__( 'Answer Template ID', 'qbank' ),
			]
		);

		$this->add_control(
			'review_template',
			[
				'label' => esc_html__( 'Review Template ID', 'qbank' ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'input_type' => 'url',
				'placeholder' => esc_html__( 'Review Template ID', 'qbank' ),
			]
		);

		$this->end_controls_section();

	}

	/**
	 * Render oEmbed widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {

		global $post;

		$settings = $this->get_settings_for_display();

		$question_posts = get_field('questions', $post->ID);
		$questions = [];
		foreach($question_posts as $question_index => $question_post) {
			$question = [
				'id'              => $question_post->ID,
				'post_title'      => $question_post->post_title,
				'lesson'          => get_field('lesson', $question_post->ID),
				'question_text'   => get_field('question_text', $question_post->ID),
				'answers'         => get_field('answers', $question_post->ID),
				'question_number' => $question_index+1,
			];
			$questions[] = $question;
		}
		echo '<script>';
		echo 'var qbankQuestionData = ';
		echo json_encode($questions);
		echo ';';
		echo '</script>';

		echo '<template id="qbank-quiz-start-template">';
		echo '<div id="qbank-quiz-start">';
		echo \ElementorPro\Plugin::elementor()->frontend->get_builder_content_for_display( $settings['start_template'] );
		echo '</div>';
		echo '</template>';

		echo '<template id="qbank-quiz-answer-template">';
		echo '<div id="qbank-quiz-answer">';
		echo \ElementorPro\Plugin::elementor()->frontend->get_builder_content_for_display( $settings['answer_template'] );
		echo '</div>';
		echo '</template>';

		echo '<template id="qbank-quiz-review-template">';
		echo \ElementorPro\Plugin::elementor()->frontend->get_builder_content_for_display( $settings['review_template'] );
		echo '</template>';

	}

}
