<?php
/**
 * Plugin Name: AXiM Transcription Service
 * Plugin URI: https://aximsystems.com/
 * Description: Professional AI-powered transcription service widget that can be embedded using [axim_transcription]
 * Version: 1.1.0
 * Author: AXiM Systems
 * Author URI: https://aximsystems.com/
 * Text Domain: axim-transcription
 * License: GPL v2 or later
 * Elementor tested up to: 3.18.3
 */

if (!defined('ABSPATH')) {
    exit;
}

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
        
        // Elementor compatibility
        add_action('elementor/editor/before_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    public function init() {
        load_plugin_textdomain('axim-transcription', false, dirname(plugin_basename(__FILE__)) . '/languages');
        $this->create_database_tables();
    }

    public function enqueue_scripts() {
        wp_enqueue_style(
            'axim-transcription-styles',
            AXIM_TRANS_PLUGIN_URL . 'assets/widget.css',
            array(),
            AXIM_TRANS_VERSION
        );

        wp_enqueue_script(
            'axim-transcription-script',
            AXIM_TRANS_PLUGIN_URL . 'assets/widget.js',
            array('jquery'),
            AXIM_TRANS_VERSION,
            true
        );

        wp_localize_script(
            'axim-transcription-script',
            'aximTransData',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('axim_nonce'),
                'supabaseUrl' => get_option('axim_supabase_url', 'https://ukrzgadtuqlkinsodfxn.supabase.co'),
                'supabaseKey' => get_option('axim_supabase_key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnpnYWR0dXFsa2luc29kZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU5OTgsImV4cCI6MjA2ODAwMTk5OH0.KcAHbfXI6-83MGYo6AnTrr8OuDgqmgCCwpO4H91H1Bw')
            )
        );
    }

    public function render_transcription_widget($atts) {
        $attributes = shortcode_atts(
            array(
                'default_plan' => 'basic'
            ),
            $atts
        );

        ob_start();
        ?>
        <div class="axim-widget" data-plan="<?php echo esc_attr($attributes['default_plan']); ?>">
            <div class="axim-widget-inner">
                <div class="axim-widget-header">
                    <div class="axim-logo">
                        <span class="axim-icon">🎤</span>
                        <h3>AXiM Transcription</h3>
                    </div>
                    <p>Professional AI-powered audio transcription</p>
                </div>

                <div class="axim-plans">
                    <div class="axim-plan">
                        <h4>Student Plan</h4>
                        <div class="axim-price">$0.25<span>/minute</span></div>
                        <ul class="axim-features">
                            <li>✓ AI-Powered Transcript</li>
                            <li>✓ Chapter Labels</li>
                            <li>✓ Audio Summary</li>
                        </ul>
                    </div>

                    <div class="axim-plan featured">
                        <h4>Basic Plan</h4>
                        <div class="axim-price">$0.39<span>/minute</span></div>
                        <ul class="axim-features">
                            <li>✓ AI-Powered Transcript</li>
                            <li>✓ Chapter Labels</li>
                            <li>✓ Audio Summary</li>
                            <li>✓ Email Summary</li>
                        </ul>
                    </div>
                </div>

                <button class="axim-cta" onclick="window.open('https://transcription.aximsystems.com', '_blank')">
                    Start Transcription
                </button>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    // ... [rest of the admin methods remain the same]
}

// Initialize plugin
function axim_transcription_init() {
    AXiMTranscriptionService::get_instance();
}
add_action('plugins_loaded', 'axim_transcription_init');

// Activation/Deactivation hooks
register_activation_hook(__FILE__, 'axim_transcription_activate');
register_deactivation_hook(__FILE__, 'axim_transcription_deactivate');
?>