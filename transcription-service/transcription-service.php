<?php
/**
 * Plugin Name: AXiM Transcription Service
 * Plugin URI: https://aximsystems.com/
 * Description: Professional AI-powered transcription service widget that can be embedded anywhere using shortcode [axim_transcription]
 * Version: 1.1.0
 * Author: AXiM Systems
 * Author URI: https://aximsystems.com/
 * Text Domain: axim-transcription
 * License: GPL v2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('AXIM_TRANS_VERSION', '1.1.0');
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
        
        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
    }

    public function init() {
        // Load translations
        load_plugin_textdomain('axim-transcription', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // Register settings
        add_action('admin_init', array($this, 'register_settings'));
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
                    'pluginUrl' => AXIM_TRANS_PLUGIN_URL,
                    'supabaseUrl' => get_option('axim_supabase_url', ''),
                    'supabaseKey' => get_option('axim_supabase_key', '')
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
        $attributes = shortcode_atts(
            array(
                'default_plan' => 'basic'
            ),
            $atts
        );
        
        // Render container for React app
        return sprintf(
            '<div id="%s" class="axim-transcription-widget" data-default-plan="%s"></div>',
            esc_attr($widget_id),
            esc_attr($attributes['default_plan'])
        );
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'AXiM Transcription',
            'AXiM Transcription',
            'manage_options',
            'axim-transcription',
            array($this, 'render_admin_page'),
            'dashicons-microphone',
            30
        );
        
        add_submenu_page(
            'axim-transcription',
            'Settings',
            'Settings',
            'manage_options',
            'axim-settings',
            array($this, 'render_settings_page')
        );
        
        add_submenu_page(
            'axim-transcription',
            'Analytics',
            'Analytics',
            'manage_options',
            'axim-analytics',
            array($this, 'render_analytics_page')
        );
    }
    
    public function admin_enqueue_scripts($hook) {
        if (strpos($hook, 'axim') === false) {
            return;
        }
        
        wp_enqueue_style(
            'axim-admin-styles',
            AXIM_TRANS_PLUGIN_URL . 'admin/css/axim-admin.css',
            array(),
            AXIM_TRANS_VERSION
        );
        
        wp_enqueue_script(
            'axim-admin-scripts',
            AXIM_TRANS_PLUGIN_URL . 'admin/js/axim-admin.js',
            array('jquery', 'wp-element'),
            AXIM_TRANS_VERSION,
            true
        );
        
        if ($hook === 'axim-transcription_page_axim-analytics') {
            wp_enqueue_script(
                'axim-analytics-scripts',
                AXIM_TRANS_PLUGIN_URL . 'admin/js/axim-analytics-enhanced.js',
                array('jquery'),
                AXIM_TRANS_VERSION,
                true
            );
        }
    }
    
    public function register_settings() {
        register_setting('axim_transcription_settings', 'axim_supabase_url');
        register_setting('axim_transcription_settings', 'axim_supabase_key');
        register_setting('axim_transcription_settings', 'axim_default_plan');
        register_setting('axim_transcription_settings', 'axim_tracking_id');
    }
    
    public function render_admin_page() {
        include AXIM_TRANS_PLUGIN_DIR . 'admin/partials/axim-admin-dashboard.php';
    }
    
    public function render_settings_page() {
        include AXIM_TRANS_PLUGIN_DIR . 'admin/partials/axim-admin-settings.php';
    }
    
    public function render_analytics_page() {
        include AXIM_TRANS_PLUGIN_DIR . 'admin/partials/axim-admin-reports.php';
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
    // Activation tasks
    flush_rewrite_rules();
    
    // Set default options
    add_option('axim_supabase_url', 'https://ukrzgadtuqlkinsodfxn.supabase.co');
    add_option('axim_supabase_key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnpnYWR0dXFsa2luc29kZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU5OTgsImV4cCI6MjA2ODAwMTk5OH0.KcAHbfXI6-83MGYo6AnTrr8OuDgqmgCCwpO4H91H1Bw');
    add_option('axim_default_plan', 'basic');
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'axim_transcription_deactivate');
function axim_transcription_deactivate() {
    // Cleanup tasks
    flush_rewrite_rules();
}