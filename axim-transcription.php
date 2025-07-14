<?php
/**
 * Plugin Name: AXiM Transcription Service
 * Plugin URI: https://aximsystems.com/
 * Description: Professional AI-powered transcription service with secure credentials and state persistence
 * Version: 1.2.0
 * Author: AXiM Systems
 * Author URI: https://aximsystems.com/
 * Text Domain: axim-transcription
 * License: GPL v2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('AXIM_VERSION', '1.2.0');
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
        add_action('wp_enqueue_scripts', array($this, 'enqueue_vite_assets'));
        add_shortcode('axim_transcription', array($this, 'render_widget'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        add_action('wp_ajax_axim_get_analytics', array($this, 'get_analytics_data'));
        add_action('wp_ajax_axim_track_event', array($this, 'track_event'));
        add_action('wp_ajax_nopriv_axim_track_event', array($this, 'track_event'));
    }

    public function enqueue_vite_assets() {
        $manifest_path = AXIM_PATH . 'dist/.vite/manifest.json';
        
        if (!file_exists($manifest_path)) {
            // Fallback to static files if manifest doesn't exist
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
        } else {
            $manifest = json_decode(file_get_contents($manifest_path), true);
            if ($manifest) {
                $entry_file = 'src/wordpress-entry.jsx';
                
                if (isset($manifest[$entry_file])) {
                    $entry = $manifest[$entry_file];
                    
                    // Enqueue CSS
                    if (isset($entry['css'])) {
                        foreach ($entry['css'] as $css_file) {
                            wp_enqueue_style(
                                'axim-transcription-styles-' . basename($css_file),
                                AXIM_URL . 'dist/' . $css_file,
                                [],
                                AXIM_VERSION
                            );
                        }
                    }

                    // Enqueue JavaScript
                    if (isset($entry['file'])) {
                        wp_enqueue_script(
                            'axim-transcription-app',
                            AXIM_URL . 'dist/' . $entry['file'],
                            [],
                            AXIM_VERSION,
                            true
                        );
                    }
                }
            }
        }

        // Securely pass data to the script
        wp_localize_script(
            'axim-transcription-app',
            'aximAppData',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('axim-nonce'),
                'pluginUrl' => AXIM_URL,
                'supabaseUrl' => 'https://ukrzgadtuqlkinsodfxn.supabase.co',
                'supabaseAnonKey' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnpnYWR0dXFsa2luc29kZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU5OTgsImV4cCI6MjA2ODAwMTk5OH0.KcAHbfXI6-83MGYo6AnTrr8OuDgqmgCCwpO4H91H1Bw',
                'version' => AXIM_VERSION
            )
        );
    }

    public function render_widget($atts) {
        static $widget_counter = 0;
        $widget_counter++;
        $widget_id = 'axim-app-' . $widget_counter;

        $attributes = shortcode_atts(
            array(
                'plan' => 'basic',
                'theme' => 'dark'
            ),
            $atts
        );

        return sprintf(
            '<div id="%s" class="axim-transcription-widget" data-plan="%s" data-theme="%s" data-version="%s"></div>',
            esc_attr($widget_id),
            esc_attr($attributes['plan']),
            esc_attr($attributes['theme']),
            esc_attr(AXIM_VERSION)
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
            AXIM_URL . 'admin/css/axim-admin.css',
            array(),
            AXIM_VERSION
        );

        wp_enqueue_script(
            'axim-admin-scripts',
            AXIM_URL . 'admin/js/axim-admin.js',
            array('jquery'),
            AXIM_VERSION,
            true
        );

        wp_localize_script(
            'axim-admin-scripts',
            'aximAdminData',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('axim-admin-nonce'),
                'version' => AXIM_VERSION
            )
        );
    }

    public function render_admin_page() {
        ?>
        <div class="wrap axim-admin-wrap">
            <h1>AXiM Transcription Dashboard v<?php echo AXIM_VERSION; ?></h1>
            
            <div class="axim-stats-grid">
                <div class="axim-stat-card">
                    <h3>Total Views</h3>
                    <div class="axim-stat-value" id="total-views">0</div>
                </div>
                <div class="axim-stat-card">
                    <h3>Total Orders</h3>
                    <div class="axim-stat-value" id="total-orders">0</div>
                </div>
                <div class="axim-stat-card">
                    <h3>Revenue</h3>
                    <div class="axim-stat-value" id="total-revenue">$0.00</div>
                </div>
            </div>

            <div class="axim-card">
                <h2>Recent Activity</h2>
                <div id="recent-activity">Loading...</div>
            </div>
        </div>
        <?php
    }

    public function render_analytics_page() {
        ?>
        <div class="wrap axim-admin-wrap">
            <h1>Analytics v<?php echo AXIM_VERSION; ?></h1>
            
            <div class="axim-card">
                <h2>Event Analytics</h2>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>Event Type</th>
                            <th>Count</th>
                            <th>Last Occurrence</th>
                        </tr>
                    </thead>
                    <tbody id="analytics-table">
                        <tr><td colspan="3">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        <?php
    }

    public function get_analytics_data() {
        check_ajax_referer('axim-admin-nonce', 'nonce');

        try {
            $analytics_data = $this->fetch_analytics_from_supabase();
            wp_send_json_success($analytics_data);
        } catch (Exception $e) {
            wp_send_json_error('Failed to fetch analytics: ' . $e->getMessage());
        }
    }

    public function track_event() {
        check_ajax_referer('axim-nonce', 'nonce');

        $event_type = sanitize_text_field($_POST['event_type']);
        $event_data = json_decode(stripslashes($_POST['event_data']), true);

        try {
            $this->send_event_to_supabase($event_type, $event_data);
            wp_send_json_success();
        } catch (Exception $e) {
            wp_send_json_error('Failed to track event: ' . $e->getMessage());
        }
    }

    private function fetch_analytics_from_supabase() {
        $supabase_url = 'https://ukrzgadtuqlkinsodfxn.supabase.co';
        $supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnpnYWR0dXFsa2luc29kZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU5OTgsImV4cCI6MjA2ODAwMTk5OH0.KcAHbfXI6-83MGYo6AnTrr8OuDgqmgCCwpO4H91H1Bw';

        // Get analytics summary
        $analytics_response = wp_remote_get(
            $supabase_url . '/rest/v1/wp_analytics_ax9m2k1?select=event_type,created_at&order=created_at.desc&limit=100',
            array(
                'headers' => array(
                    'apikey' => $supabase_key,
                    'Authorization' => 'Bearer ' . $supabase_key,
                    'Content-Type' => 'application/json'
                )
            )
        );

        // Get orders summary
        $orders_response = wp_remote_get(
            $supabase_url . '/rest/v1/wp_orders_ax9m2k1?select=total_price,status,created_at&order=created_at.desc&limit=50',
            array(
                'headers' => array(
                    'apikey' => $supabase_key,
                    'Authorization' => 'Bearer ' . $supabase_key,
                    'Content-Type' => 'application/json'
                )
            )
        );

        $analytics = array();
        $orders = array();

        if (!is_wp_error($analytics_response)) {
            $analytics = json_decode(wp_remote_retrieve_body($analytics_response), true);
        }

        if (!is_wp_error($orders_response)) {
            $orders = json_decode(wp_remote_retrieve_body($orders_response), true);
        }

        // Process data
        $event_counts = array();
        $total_views = 0;
        
        foreach ($analytics as $event) {
            if (!isset($event_counts[$event['event_type']])) {
                $event_counts[$event['event_type']] = 0;
            }
            $event_counts[$event['event_type']]++;
            
            if ($event['event_type'] === 'widget_view') {
                $total_views++;
            }
        }

        $total_revenue = 0;
        $total_orders = count($orders);
        
        foreach ($orders as $order) {
            if ($order['status'] === 'completed') {
                $total_revenue += floatval($order['total_price']);
            }
        }

        return array(
            'views' => $total_views,
            'orders' => $total_orders,
            'revenue' => $total_revenue,
            'events' => $event_counts
        );
    }

    private function send_event_to_supabase($event_type, $event_data) {
        $supabase_url = 'https://ukrzgadtuqlkinsodfxn.supabase.co';
        $supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnpnYWR0dXFsa2luc29kZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU5OTgsImV4cCI6MjA2ODAwMTk5OH0.KcAHbfXI6-83MGYo6AnTrr8OuDgqmgCCwpO4H91H1Bw';

        $data = array(
            'event_type' => $event_type,
            'event_data' => $event_data,
            'ip_address' => $_SERVER['REMOTE_ADDR'],
            'user_agent' => $_SERVER['HTTP_USER_AGENT'],
            'page_url' => isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '',
            'session_id' => session_id() ?: uniqid()
        );

        wp_remote_post(
            $supabase_url . '/rest/v1/wp_analytics_ax9m2k1',
            array(
                'headers' => array(
                    'apikey' => $supabase_key,
                    'Authorization' => 'Bearer ' . $supabase_key,
                    'Content-Type' => 'application/json'
                ),
                'body' => json_encode($data)
            )
        );
    }
}

// Initialize plugin
function axim_init() {
    AXiMTranscription::get_instance();
}
add_action('plugins_loaded', 'axim_init');

// Activation hook
register_activation_hook(__FILE__, 'axim_activation');
function axim_activation() {
    // Set plugin version
    update_option('axim_version', AXIM_VERSION);
    
    // Clear any cached data
    wp_cache_flush();
}