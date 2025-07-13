<?php
class AXiM_Admin {
    private $plugin_name;
    private $version;

    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_styles'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('wp_ajax_axim_get_analytics', array($this, 'get_analytics_data'));
    }

    public function add_admin_menu() {
        add_menu_page(
            'AXiM Transcription', 
            'AXiM Transcription', 
            'manage_options', 
            'axim-transcription',
            array($this, 'display_admin_dashboard'),
            'dashicons-chart-bar',
            30
        );

        add_submenu_page(
            'axim-transcription',
            'Analytics',
            'Analytics',
            'manage_options',
            'axim-analytics',
            array($this, 'display_analytics_page')
        );

        add_submenu_page(
            'axim-transcription',
            'Settings',
            'Settings',
            'manage_options',
            'axim-settings',
            array($this, 'display_settings_page')
        );
    }

    public function enqueue_styles($hook) {
        if (strpos($hook, 'axim') === false) return;
        
        wp_enqueue_style(
            'axim-admin-styles',
            plugin_dir_url(__FILE__) . 'css/axim-admin.css',
            array(),
            $this->version,
            'all'
        );
    }

    public function enqueue_scripts($hook) {
        if (strpos($hook, 'axim') === false) return;

        wp_enqueue_script(
            'axim-admin-scripts',
            plugin_dir_url(__FILE__) . 'js/axim-admin.js',
            array('jquery', 'wp-element'),
            $this->version,
            true
        );

        wp_localize_script(
            'axim-admin-scripts',
            'aximAdminData',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('axim_admin_nonce')
            )
        );
    }

    public function display_admin_dashboard() {
        include_once 'partials/axim-admin-dashboard.php';
    }

    public function display_analytics_page() {
        include_once 'partials/axim-admin-analytics.php';
    }

    public function display_settings_page() {
        include_once 'partials/axim-admin-settings.php';
    }

    public function get_analytics_data() {
        check_ajax_referer('axim_admin_nonce', 'nonce');

        // Get analytics data from Supabase
        $analytics = $this->fetch_analytics_data();
        wp_send_json_success($analytics);
    }

    private function fetch_analytics_data() {
        // Implement Supabase data fetching here
        return array(
            'views' => 0,
            'conversions' => 0,
            'abandoned' => 0
        );
    }
}