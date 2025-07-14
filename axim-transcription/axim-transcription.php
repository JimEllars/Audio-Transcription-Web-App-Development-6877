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

// Prevent direct access
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
        
        // Admin hooks
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        add_action('admin_init', array($this, 'register_settings'));
        
        // AJAX hooks
        add_action('wp_ajax_axim_get_analytics', array($this, 'get_analytics_data'));
        add_action('wp_ajax_axim_track_event', array($this, 'track_event'));
        add_action('wp_ajax_nopriv_axim_track_event', array($this, 'track_event'));
    }

    public function init() {
        // Load translations
        load_plugin_textdomain('axim-transcription', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // Create database tables if needed
        $this->create_database_tables();
    }

    public function enqueue_scripts() {
        global $post;
        
        // Check if shortcode is present
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'axim_transcription')) {
            
            // Check if built files exist, otherwise use CDN versions
            $js_file = AXIM_TRANS_PLUGIN_DIR . 'dist/assets/index.js';
            $css_file = AXIM_TRANS_PLUGIN_DIR . 'dist/assets/index.css';
            
            if (file_exists($js_file)) {
                wp_enqueue_script(
                    'axim-transcription-app',
                    AXIM_TRANS_PLUGIN_URL . 'dist/assets/index.js',
                    array(),
                    AXIM_TRANS_VERSION,
                    true
                );
            } else {
                // Fallback: Load React from CDN and our inline script
                wp_enqueue_script('react', 'https://unpkg.com/react@18/umd/react.production.min.js', array(), '18.2.0', false);
                wp_enqueue_script('react-dom', 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', array('react'), '18.2.0', false);
                
                // Inline widget script
                wp_add_inline_script('react-dom', $this->get_inline_widget_script());
            }
            
            if (file_exists($css_file)) {
                wp_enqueue_style(
                    'axim-transcription-styles',
                    AXIM_TRANS_PLUGIN_URL . 'dist/assets/index.css',
                    array(),
                    AXIM_TRANS_VERSION
                );
            } else {
                // Inline styles
                wp_add_inline_style('wp-admin', $this->get_inline_styles());
            }

            // Pass WordPress data to frontend
            wp_localize_script(
                'react-dom',
                'aximTranscriptionData',
                array(
                    'ajaxUrl' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('axim_transcription_nonce'),
                    'siteUrl' => get_site_url(),
                    'pluginUrl' => AXIM_TRANS_PLUGIN_URL,
                    'supabaseUrl' => get_option('axim_supabase_url', 'https://ukrzgadtuqlkinsodfxn.supabase.co'),
                    'supabaseKey' => get_option('axim_supabase_key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnpnYWR0dXFsa2luc29kZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU5OTgsImV4cCI6MjA2ODAwMTk5OH0.KcAHbfXI6-83MGYo6AnTrr8OuDgqmgCCwpO4H91H1Bw')
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

        // Ensure scripts are loaded
        $this->enqueue_scripts();

        // Return container with fallback content
        ob_start();
        ?>
        <div id="<?php echo esc_attr($widget_id); ?>" class="axim-transcription-widget" data-default-plan="<?php echo esc_attr($attributes['default_plan']); ?>">
            <div style="background: #1C1C1C; border: 1px solid #333; border-radius: 12px; padding: 2rem; text-align: center; color: #F5F5F5;">
                <div style="width: 60px; height: 60px; background: #7F00FF; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center;">
                    🎤
                </div>
                <h3 style="color: #F5F5F5; margin-bottom: 1rem;">AXiM Transcription Service</h3>
                <p style="color: #A9A9A9; margin-bottom: 2rem;">Professional AI-powered audio transcription</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; max-width: 600px; margin: 0 auto 2rem;">
                    <div style="background: #111; border: 1px solid #333; border-radius: 8px; padding: 1.5rem;">
                        <h4 style="color: #7F00FF; margin-bottom: 0.5rem;">Student Plan</h4>
                        <div style="font-size: 2rem; font-weight: bold; color: #44DDA0; margin-bottom: 0.5rem;">$0.25</div>
                        <div style="color: #A9A9A9;">per minute</div>
                    </div>
                    <div style="background: #111; border: 1px solid #333; border-radius: 8px; padding: 1.5rem;">
                        <h4 style="color: #44DDA0; margin-bottom: 0.5rem;">Basic Plan</h4>
                        <div style="font-size: 2rem; font-weight: bold; color: #44DDA0; margin-bottom: 0.5rem;">$0.39</div>
                        <div style="color: #A9A9A9;">per minute</div>
                    </div>
                </div>
                
                <button onclick="window.open('https://transcription.aximsystems.com', '_blank')" style="background: #E8FC04; color: #111; border: none; padding: 1rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    Start Transcription
                </button>
                
                <div style="margin-top: 1rem; font-size: 0.875rem; color: #A9A9A9;">
                    ✓ AI-Powered • ✓ Chapter Labels • ✓ Audio Summary
                </div>
            </div>
        </div>
        
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Track widget view
            if (typeof aximTranscriptionData !== 'undefined') {
                fetch(aximTranscriptionData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'axim_track_event',
                        nonce: aximTranscriptionData.nonce,
                        event_type: 'widget_view',
                        event_data: JSON.stringify({
                            widget_id: '<?php echo esc_js($widget_id); ?>',
                            page_url: window.location.href
                        })
                    })
                });
            }
        });
        </script>
        <?php
        return ob_get_clean();
    }

    public function add_admin_menu() {
        // Main menu page
        add_menu_page(
            'AXiM Transcription',
            'AXiM Transcription',
            'manage_options',
            'axim-transcription',
            array($this, 'render_admin_page'),
            'dashicons-microphone',
            30
        );

        // Submenu pages
        add_submenu_page(
            'axim-transcription',
            'Analytics',
            'Analytics',
            'manage_options',
            'axim-analytics',
            array($this, 'render_analytics_page')
        );

        add_submenu_page(
            'axim-transcription',
            'Settings',
            'Settings',
            'manage_options',
            'axim-settings',
            array($this, 'render_settings_page')
        );
    }

    public function admin_enqueue_scripts($hook) {
        // Only load on our admin pages
        if (strpos($hook, 'axim') === false) {
            return;
        }

        // Admin styles
        wp_enqueue_style(
            'axim-admin-styles',
            AXIM_TRANS_PLUGIN_URL . 'assets/admin.css',
            array(),
            AXIM_TRANS_VERSION
        );

        // Admin scripts
        wp_enqueue_script(
            'axim-admin-scripts',
            AXIM_TRANS_PLUGIN_URL . 'assets/admin.js',
            array('jquery'),
            AXIM_TRANS_VERSION,
            true
        );

        // Localize script for AJAX
        wp_localize_script(
            'axim-admin-scripts',
            'aximAdminData',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('axim_admin_nonce')
            )
        );
    }

    public function register_settings() {
        register_setting('axim_transcription_settings', 'axim_supabase_url');
        register_setting('axim_transcription_settings', 'axim_supabase_key');
        register_setting('axim_transcription_settings', 'axim_default_plan');
        register_setting('axim_transcription_settings', 'axim_tracking_id');
    }

    public function render_admin_page() {
        ?>
        <div class="wrap axim-admin-wrap">
            <h1>AXiM Transcription Dashboard</h1>
            
            <div class="axim-stats-grid">
                <div class="axim-stat-card">
                    <h3>Widget Views</h3>
                    <div class="axim-stat-value" id="total-views">Loading...</div>
                </div>
                <div class="axim-stat-card">
                    <h3>Click-throughs</h3>
                    <div class="axim-stat-value" id="total-clicks">Loading...</div>
                </div>
                <div class="axim-stat-card">
                    <h3>Active Widgets</h3>
                    <div class="axim-stat-value"><?php echo $this->count_active_widgets(); ?></div>
                </div>
            </div>

            <div class="axim-card">
                <h2>Shortcode Usage</h2>
                <p>Use this shortcode to embed the transcription widget:</p>
                <code>[axim_transcription]</code>
                <p>Or with options:</p>
                <code>[axim_transcription default_plan="basic"]</code>
                <code>[axim_transcription default_plan="student"]</code>
            </div>

            <div class="axim-card">
                <h2>Recent Activity</h2>
                <div id="axim-activity-feed">Loading...</div>
            </div>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            // Load analytics data
            $.post(ajaxurl, {
                action: 'axim_get_analytics',
                nonce: aximAdminData.nonce
            }, function(response) {
                if (response.success) {
                    $('#total-views').text(response.data.views || 0);
                    $('#total-clicks').text(response.data.clicks || 0);
                }
            });
        });
        </script>
        <?php
    }

    public function render_analytics_page() {
        ?>
        <div class="wrap axim-admin-wrap">
            <h1>Analytics & Reports</h1>
            
            <div class="axim-card">
                <h2>Widget Performance</h2>
                <div id="analytics-chart">
                    <p>Analytics data will be displayed here.</p>
                </div>
            </div>
            
            <div class="axim-card">
                <h2>Usage Statistics</h2>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>Event Type</th>
                            <th>Count</th>
                            <th>Last Occurrence</th>
                        </tr>
                    </thead>
                    <tbody id="usage-stats">
                        <tr><td colspan="3">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        <?php
    }

    public function render_settings_page() {
        // Handle form submission
        if (isset($_POST['submit'])) {
            update_option('axim_supabase_url', sanitize_text_field($_POST['axim_supabase_url']));
            update_option('axim_supabase_key', sanitize_text_field($_POST['axim_supabase_key']));
            update_option('axim_default_plan', sanitize_text_field($_POST['axim_default_plan']));
            update_option('axim_tracking_id', sanitize_text_field($_POST['axim_tracking_id']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }
        
        ?>
        <div class="wrap axim-admin-wrap">
            <h1>AXiM Transcription Settings</h1>
            
            <form method="post" action="">
                <?php wp_nonce_field('axim_settings', 'axim_settings_nonce'); ?>
                
                <div class="axim-form-group">
                    <h2>Supabase Configuration</h2>
                    <table class="form-table">
                        <tr>
                            <th scope="row">Supabase URL</th>
                            <td>
                                <input type="text" name="axim_supabase_url" value="<?php echo esc_attr(get_option('axim_supabase_url', 'https://ukrzgadtuqlkinsodfxn.supabase.co')); ?>" class="regular-text" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Supabase Anon Key</th>
                            <td>
                                <input type="password" name="axim_supabase_key" value="<?php echo esc_attr(get_option('axim_supabase_key')); ?>" class="regular-text" />
                            </td>
                        </tr>
                    </table>
                </div>
                
                <div class="axim-form-group">
                    <h2>Widget Settings</h2>
                    <table class="form-table">
                        <tr>
                            <th scope="row">Default Plan</th>
                            <td>
                                <select name="axim_default_plan">
                                    <option value="basic" <?php selected(get_option('axim_default_plan', 'basic'), 'basic'); ?>>Basic</option>
                                    <option value="student" <?php selected(get_option('axim_default_plan'), 'student'); ?>>Student</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Google Analytics ID</th>
                            <td>
                                <input type="text" name="axim_tracking_id" value="<?php echo esc_attr(get_option('axim_tracking_id')); ?>" class="regular-text" />
                                <p class="description">Optional: Track widget usage in Google Analytics</p>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    public function get_analytics_data() {
        check_ajax_referer('axim_admin_nonce', 'nonce');
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'axim_analytics';
        
        // Get analytics data
        $views = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE event_type = 'widget_view'");
        $clicks = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE event_type = 'widget_click'");
        
        wp_send_json_success(array(
            'views' => $views ?: 0,
            'clicks' => $clicks ?: 0
        ));
    }

    public function track_event() {
        check_ajax_referer('axim_transcription_nonce', 'nonce');
        
        $event_type = sanitize_text_field($_POST['event_type']);
        $event_data = json_decode(stripslashes($_POST['event_data']), true);
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'axim_analytics';
        
        $wpdb->insert(
            $table_name,
            array(
                'event_type' => $event_type,
                'event_data' => json_encode($event_data),
                'user_id' => get_current_user_id(),
                'ip_address' => $this->get_client_ip(),
                'user_agent' => $_SERVER['HTTP_USER_AGENT'],
                'created_at' => current_time('mysql')
            )
        );
        
        wp_send_json_success();
    }

    private function create_database_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        $table_name = $wpdb->prefix . 'axim_analytics';
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            event_type varchar(50) NOT NULL,
            event_data longtext,
            user_id bigint(20),
            ip_address varchar(100),
            user_agent text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    private function count_active_widgets() {
        // Count posts/pages with the shortcode
        global $wpdb;
        $count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_content LIKE '%[axim_transcription%' AND post_status = 'publish'");
        return $count ?: 0;
    }

    private function get_client_ip() {
        $ip = '';
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        return $ip;
    }

    private function get_inline_styles() {
        return "
        .axim-transcription-widget {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .axim-admin-wrap {
            background: #111111;
            color: #F5F5F5;
            padding: 2rem;
            border-radius: 12px;
            margin: 20px;
        }
        .axim-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        .axim-stat-card {
            background: #1C1C1C;
            border: 1px solid #333333;
            border-radius: 12px;
            padding: 1.5rem;
        }
        .axim-stat-card h3 {
            color: #A9A9A9;
            margin: 0 0 0.5rem 0;
            font-size: 0.875rem;
        }
        .axim-stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #44DDA0;
        }
        .axim-card {
            background: #1C1C1C;
            border: 1px solid #333333;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }
        .axim-card h2 {
            color: #F5F5F5;
            margin-top: 0;
        }
        .axim-card code {
            background: #111111;
            color: #E8FC04;
            padding: 0.5rem;
            border-radius: 4px;
            display: block;
            margin: 0.5rem 0;
        }
        ";
    }

    private function get_inline_widget_script() {
        return "
        // Basic widget functionality without React
        document.addEventListener('DOMContentLoaded', function() {
            console.log('AXiM Transcription Widget Loaded');
        });
        ";
    }
}

// Initialize the plugin
function axim_transcription_init() {
    AXiMTranscriptionService::get_instance();
}
add_action('plugins_loaded', 'axim_transcription_init');

// Activation hook
register_activation_hook(__FILE__, 'axim_transcription_activate');
function axim_transcription_activate() {
    // Set default options
    add_option('axim_supabase_url', 'https://ukrzgadtuqlkinsodfxn.supabase.co');
    add_option('axim_supabase_key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnpnYWR0dXFsa2luc29kZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU5OTgsImV4cCI6MjA2ODAwMTk5OH0.KcAHbfXI6-83MGYo6AnTrr8OuDgqmgCCwpO4H91H1Bw');
    add_option('axim_default_plan', 'basic');
    
    // Flush rewrite rules
    flush_rewrite_rules();
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'axim_transcription_deactivate');
function axim_transcription_deactivate() {
    flush_rewrite_rules();
}
?>