<?php
/**
 * Plugin Name: AXiM Transcription Service
 * Plugin URI: https://aximsystems.com/
 * Description: Professional AI-powered transcription service with advanced analytics and reporting
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

// Autoloader
spl_autoload_register(function ($class) {
    $prefix = 'AXiM_';
    $base_dir = AXIM_TRANS_PLUGIN_DIR . 'includes/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . 'class-' . strtolower(str_replace('_', '-', $relative_class)) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

// Initialize plugin
function axim_transcription_init() {
    // Initialize main plugin class
    $plugin = new AXiM_Transcription();
    $plugin->init();

    // Initialize admin if in admin area
    if (is_admin()) {
        $admin = new AXiM_Admin(AXIM_TRANS_VERSION);
        $admin->init();
    }

    // Initialize analytics
    $analytics = new AXiM_Analytics();
    $analytics->init();
}

// Activation hook
register_activation_hook(__FILE__, 'axim_transcription_activate');
function axim_transcription_activate() {
    // Create necessary database tables
    require_once AXIM_TRANS_PLUGIN_DIR . 'includes/class-axim-activator.php';
    AXiM_Activator::activate();
    
    // Schedule cron for automated reports
    if (!wp_next_scheduled('axim_generate_scheduled_reports')) {
        wp_schedule_event(time(), 'daily', 'axim_generate_scheduled_reports');
    }
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'axim_transcription_deactivate');
function axim_transcription_deactivate() {
    // Clean up scheduled tasks
    wp_clear_scheduled_hook('axim_generate_scheduled_reports');
}

// Initialize plugin
add_action('plugins_loaded', 'axim_transcription_init');