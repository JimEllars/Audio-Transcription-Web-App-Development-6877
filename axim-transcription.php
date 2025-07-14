<?php
/**
 * Plugin Name: AXiM Transcription Service
 * Plugin URI: https://aximsystems.com/
 * Description: Professional AI-powered transcription service
 * Version: 1.1.0
 * Author: AXiM Systems
 * Author URI: https://aximsystems.com/
 * Text Domain: axim-transcription
 */

if (!defined('ABSPATH')) {
    exit;
}

define('AXIM_VERSION', '1.1.0');
define('AXIM_PATH', plugin_dir_path(__FILE__));
define('AXIM_URL', plugin_dir_url(__FILE__));

class AXiMTranscription {
    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
        add_shortcode('axim_transcription', array($this, 'render_widget'));
    }

    public function enqueue_assets() {
        // Always enqueue assets since shortcode might be in a widget
        wp_enqueue_style(
            'axim-styles',
            AXIM_URL . 'dist/assets/main.css',
            array(),
            AXIM_VERSION
        );

        wp_enqueue_script(
            'axim-app',
            AXIM_URL . 'dist/js/main.js',
            array(),
            AXIM_VERSION,
            true
        );

        // Pass data to JavaScript
        wp_localize_script(
            'axim-app',
            'aximData',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('axim-nonce'),
                'pluginUrl' => AXIM_URL
            )
        );
    }

    public function render_widget($atts) {
        $attributes = shortcode_atts(
            array(
                'plan' => 'basic'
            ),
            $atts
        );

        return '<div id="axim-app" data-plan="' . esc_attr($attributes['plan']) . '"></div>';
    }
}

// Initialize plugin
function axim_init() {
    AXiMTranscription::get_instance();
}
add_action('plugins_loaded', 'axim_init');