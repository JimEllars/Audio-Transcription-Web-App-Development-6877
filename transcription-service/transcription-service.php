<?php
/**
 * Plugin Name: AXiM Transcription Service
 * Plugin URI: https://aximsystems.com/
 * Description: Professional AI-powered transcription service widget that can be embedded anywhere using shortcode [axim_transcription]
 * Version: 1.0.0
 * Author: AXiM Systems
 * Author URI: https://aximsystems.com/
 * Text Domain: axim-transcription
 * License: GPL v2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('AXIM_TRANS_VERSION', '1.0.0');
define('AXIM_TRANS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('AXIM_TRANS_PLUGIN_URL', plugin_dir_url(__FILE__));

class AXiMTranscriptionService {
    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('axim_transcription', array($this, 'render_transcription_widget'));
    }

    public function init() {
        // Load translations
        load_plugin_textdomain('axim-transcription', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }

    public function enqueue_scripts() {
        // Enqueue only when shortcode is present
        global $post;
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'axim_transcription')) {
            // Enqueue React and dependencies
            wp_enqueue_script(
                'axim-transcription-app',
                AXIM_TRANS_PLUGIN_URL . 'dist/assets/index.js',
                array(),
                AXIM_TRANS_VERSION,
                true
            );

            wp_enqueue_style(
                'axim-transcription-styles',
                AXIM_TRANS_PLUGIN_URL . 'dist/assets/index.css',
                array(),
                AXIM_TRANS_VERSION
            );

            // Pass WordPress data to React
            wp_localize_script(
                'axim-transcription-app',
                'aximTranscriptionData',
                array(
                    'ajaxUrl' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('axim_transcription_nonce'),
                    'siteUrl' => get_site_url(),
                    'pluginUrl' => AXIM_TRANS_PLUGIN_URL
                )
            );
        }
    }

    public function render_transcription_widget($atts) {
        // Generate unique ID for multiple instances
        static $widget_counter = 0;
        $widget_counter++;
        $widget_id = 'axim-transcription-' . $widget_counter;

        // Parse attributes
        $attributes = shortcode_atts(array(
            'theme' => 'light',
            'default_plan' => 'basic'
        ), $atts);

        // Render container for React app
        return sprintf(
            '<div id="%s" class="axim-transcription-widget" data-theme="%s" data-default-plan="%s"></div>',
            esc_attr($widget_id),
            esc_attr($attributes['theme']),
            esc_attr($attributes['default_plan'])
        );
    }
}

// Initialize plugin
function axim_transcription_init() {
    AXiMTranscriptionService::get_instance();
}
add_action('plugins_loaded', 'axim_transcription_init');

// Activation hook
register_activation_hook(__FILE__, 'axim_transcription_activate');
function axim_transcription_activate() {
    // Activation tasks if needed
    flush_rewrite_rules();
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'axim_transcription_deactivate');
function axim_transcription_deactivate() {
    // Cleanup tasks if needed
    flush_rewrite_rules();
}