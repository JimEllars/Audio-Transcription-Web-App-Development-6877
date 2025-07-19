<?php
/**
 * Plugin Name: AXiM Transcription Service
 * Plugin URI: https://aximsystems.com/
 * Description: Professional AI-powered transcription service with discount codes and Zapier integration
 * Version: 1.5.0
 * Author: AXiM Systems
 * Author URI: https://aximsystems.com/
 * Text Domain: axim-transcription
 * License: GPL v2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('AXIM_VERSION', '1.5.0');
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
        add_action('admin_init', array($this, 'register_settings'));
        
        // AJAX handlers
        add_action('wp_ajax_axim_get_analytics', array($this, 'get_analytics_data'));
        add_action('wp_ajax_axim_track_event', array($this, 'track_event'));
        add_action('wp_ajax_nopriv_axim_track_event', array($this, 'track_event'));
        add_action('wp_ajax_axim_create_payment_intent', array($this, 'create_payment_intent'));
        add_action('wp_ajax_nopriv_axim_create_payment_intent', array($this, 'create_payment_intent'));
        add_action('wp_ajax_axim_confirm_payment', array($this, 'confirm_payment'));
        add_action('wp_ajax_nopriv_axim_confirm_payment', array($this, 'confirm_payment'));
        add_action('wp_ajax_axim_upload_audio', array($this, 'upload_audio_to_noota'));
        add_action('wp_ajax_nopriv_axim_upload_audio', array($this, 'upload_audio_to_noota'));
        
        // Discount code handlers
        add_action('wp_ajax_axim_validate_discount', array($this, 'validate_discount_code'));
        add_action('wp_ajax_nopriv_axim_validate_discount', array($this, 'validate_discount_code'));
        add_action('wp_ajax_axim_apply_discount', array($this, 'apply_discount_code'));
        add_action('wp_ajax_nopriv_axim_apply_discount', array($this, 'apply_discount_code'));
        
        // Webhook handlers
        add_action('wp_ajax_axim_stripe_webhook', array($this, 'handle_stripe_webhook'));
        add_action('wp_ajax_nopriv_axim_stripe_webhook', array($this, 'handle_stripe_webhook'));
        add_action('wp_ajax_axim_noota_webhook', array($this, 'handle_noota_webhook'));
        add_action('wp_ajax_nopriv_axim_noota_webhook', array($this, 'handle_noota_webhook'));
        add_action('wp_ajax_axim_zapier_webhook', array($this, 'handle_zapier_webhook'));
        add_action('wp_ajax_nopriv_axim_zapier_webhook', array($this, 'handle_zapier_webhook'));
        
        add_action('init', array($this, 'add_webhook_endpoints'));
        
        // Scheduled tasks
        add_action('axim_check_transcription_status', array($this, 'check_transcription_status'));
        add_action('axim_process_zapier_fallback', array($this, 'process_zapier_fallback'));
        
        // Initialize APIs
        require_once AXIM_PATH . 'includes/class-noota-api.php';
        require_once AXIM_PATH . 'includes/class-discount-manager.php';
        require_once AXIM_PATH . 'includes/class-zapier-integration.php';
    }

    public function add_webhook_endpoints() {
        // Stripe webhook
        add_rewrite_rule(
            '^axim/webhook/stripe/?$',
            'index.php?axim_stripe_webhook=1',
            'top'
        );
        add_rewrite_tag('%axim_stripe_webhook%', '([^&]+)');
        
        // Noota webhook
        add_rewrite_rule(
            '^axim/webhook/noota/?$',
            'index.php?axim_noota_webhook=1',
            'top'
        );
        add_rewrite_tag('%axim_noota_webhook%', '([^&]+)');
        
        // Zapier webhook
        add_rewrite_rule(
            '^axim/webhook/zapier/?$',
            'index.php?axim_zapier_webhook=1',
            'top'
        );
        add_rewrite_tag('%axim_zapier_webhook%', '([^&]+)');
        
        // Handle webhook requests
        if (get_query_var('axim_stripe_webhook')) {
            $this->handle_stripe_webhook();
            exit;
        }
        
        if (get_query_var('axim_noota_webhook')) {
            $this->handle_noota_webhook();
            exit;
        }
        
        if (get_query_var('axim_zapier_webhook')) {
            $this->handle_zapier_webhook();
            exit;
        }
    }

    public function register_settings() {
        register_setting('axim_settings', 'axim_stripe_secret_key');
        register_setting('axim_settings', 'axim_stripe_webhook_secret');
        register_setting('axim_settings', 'axim_noota_api_key');
        register_setting('axim_settings', 'axim_noota_workspace_id');
        register_setting('axim_settings', 'axim_transcription_provider');
        register_setting('axim_settings', 'axim_supabase_url');
        register_setting('axim_settings', 'axim_supabase_key');
        register_setting('axim_settings', 'axim_zapier_webhook_url');
        register_setting('axim_settings', 'axim_zapier_fallback_enabled');
        register_setting('axim_settings', 'axim_discount_codes_enabled');
    }

    public function enqueue_vite_assets() {
        $manifest_path = AXIM_PATH . 'dist/.vite/manifest.json';
        
        if (!file_exists($manifest_path)) {
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

        wp_localize_script(
            'axim-transcription-app',
            'aximAppData',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('axim-nonce'),
                'pluginUrl' => AXIM_URL,
                'supabaseUrl' => 'https://ukrzgadtuqlkinsodfxn.supabase.co',
                'supabaseAnonKey' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnpnYWR0dXFsa2luc29kZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU5OTgsImV4cCI6MjA2ODAwMTk5OH0.KcAHbfXI6-83MGYo6AnTrr8OuDgqmgCCwpO4H91H1Bw',
                'stripePublishableKey' => 'pk_live_51M9M9WJahsdipCJXf8NR7es7EnYBzk5vxNCKWW51H7TZdYdC4N0qMYATnHniWkN85iZc2lIMWh360fKuYGMFFUDt00A1wBVyPk',
                'version' => AXIM_VERSION,
                'discountCodesEnabled' => get_option('axim_discount_codes_enabled', true)
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

    // Discount Code Methods
    public function validate_discount_code() {
        check_ajax_referer('axim-nonce', 'nonce');
        
        $code = sanitize_text_field($_POST['code']);
        $plan_id = sanitize_text_field($_POST['plan_id'] ?? '');
        
        try {
            $discount_manager = new Discount_Manager();
            $validation_result = $discount_manager->validate_code($code, $plan_id);
            
            if ($validation_result['valid']) {
                wp_send_json_success([
                    'valid' => true,
                    'discount_percent' => $validation_result['discount_percent'],
                    'message' => $validation_result['message']
                ]);
            } else {
                wp_send_json_error([
                    'valid' => false,
                    'message' => $validation_result['message']
                ]);
            }
        } catch (Exception $e) {
            wp_send_json_error([
                'valid' => false,
                'message' => 'Error validating discount code: ' . $e->getMessage()
            ]);
        }
    }

    public function apply_discount_code() {
        check_ajax_referer('axim-nonce', 'nonce');
        
        $code = sanitize_text_field($_POST['code']);
        $order_id = sanitize_text_field($_POST['order_id']);
        $original_amount = floatval($_POST['original_amount']);
        
        try {
            $discount_manager = new Discount_Manager();
            $result = $discount_manager->apply_discount($code, $order_id, $original_amount);
            
            if ($result['success']) {
                wp_send_json_success([
                    'discount_applied' => true,
                    'discount_percent' => $result['discount_percent'],
                    'discount_amount' => $result['discount_amount'],
                    'final_amount' => $result['final_amount']
                ]);
            } else {
                wp_send_json_error([
                    'discount_applied' => false,
                    'message' => $result['message']
                ]);
            }
        } catch (Exception $e) {
            wp_send_json_error([
                'discount_applied' => false,
                'message' => 'Error applying discount: ' . $e->getMessage()
            ]);
        }
    }

    public function upload_audio_to_noota() {
        check_ajax_referer('axim-nonce', 'nonce');
        
        try {
            if (!isset($_FILES['audio_file'])) {
                throw new Exception('No audio file provided');
            }
            
            $order_id = sanitize_text_field($_POST['order_id']);
            $plan_id = sanitize_text_field($_POST['plan_id']);
            
            // Get order details from Supabase
            $order = $this->get_order_from_supabase($order_id);
            if (!$order) {
                throw new Exception('Order not found');
            }
            
            // Initialize Noota API
            $noota = new Noota_API();
            
            // Upload file to Noota
            $upload_response = $noota->upload_audio_file($_FILES['audio_file'], [
                'title' => 'AXiM Transcription - Order ' . $order_id,
                'description' => 'Audio file for transcription order ' . $order_id,
                'language' => $this->detect_audio_language($_FILES['audio_file']),
                'webhook_url' => home_url('/axim/webhook/noota'),
                'metadata' => [
                    'order_id' => $order_id,
                    'plan_id' => $plan_id,
                    'customer_email' => $order['guest_email']
                ]
            ]);
            
            if (!$upload_response || !isset($upload_response['id'])) {
                throw new Exception('Failed to upload file to Noota');
            }
            
            // Update order with Noota recording ID
            $this->update_order_in_supabase($order_id, [
                'noota_recording_id' => $upload_response['id'],
                'status' => 'processing',
                'transcription_provider' => 'noota',
                'processing_started_at' => date('c')
            ]);
            
            // Start transcription process
            $transcription_response = $noota->start_transcription($upload_response['id'], [
                'language' => $this->detect_audio_language($_FILES['audio_file']),
                'include_summary' => true,
                'include_chapters' => true,
                'include_keywords' => true,
                'webhook_url' => home_url('/axim/webhook/noota')
            ]);
            
            // Track event
            $this->track_event_internal('transcription_started', [
                'order_id' => $order_id,
                'noota_recording_id' => $upload_response['id'],
                'provider' => 'noota'
            ]);
            
            wp_send_json_success([
                'order_id' => $order_id,
                'noota_recording_id' => $upload_response['id'],
                'status' => 'processing',
                'message' => 'Audio file uploaded successfully. Transcription in progress.'
            ]);
            
        } catch (Exception $e) {
            error_log('Noota upload error: ' . $e->getMessage());
            
            // Trigger Zapier fallback if enabled
            if (get_option('axim_zapier_fallback_enabled', false)) {
                $this->trigger_zapier_fallback($order_id, $_FILES['audio_file'], $e->getMessage());
            }
            
            wp_send_json_error('Upload failed: ' . $e->getMessage());
        }
    }

    private function trigger_zapier_fallback($order_id, $audio_file, $error_message) {
        try {
            $zapier_integration = new Zapier_Integration();
            $zapier_integration->trigger_transcription_fallback($order_id, $audio_file, $error_message);
        } catch (Exception $e) {
            error_log('Zapier fallback error: ' . $e->getMessage());
        }
    }

    public function handle_zapier_webhook() {
        $payload = file_get_contents('php://input');
        $data = json_decode($payload, true);
        
        if (!$data) {
            http_response_code(400);
            exit('Invalid JSON payload');
        }
        
        try {
            $zapier_integration = new Zapier_Integration();
            $result = $zapier_integration->handle_webhook($data);
            
            if ($result['success']) {
                http_response_code(200);
                echo json_encode(['status' => 'success', 'message' => $result['message']]);
            } else {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => $result['message']]);
            }
            
        } catch (Exception $e) {
            error_log('Zapier webhook error: ' . $e->getMessage());
            http_response_code(500);
            exit('Webhook processing failed');
        }
    }

    public function handle_noota_webhook() {
        $payload = file_get_contents('php://input');
        $data = json_decode($payload, true);
        
        if (!$data) {
            http_response_code(400);
            exit('Invalid JSON payload');
        }
        
        try {
            $event_type = $data['event'] ?? '';
            $recording_data = $data['data'] ?? [];
            $recording_id = $recording_data['id'] ?? '';
            
            error_log('Noota webhook received: ' . $event_type . ' for recording: ' . $recording_id);
            
            switch ($event_type) {
                case 'transcription.completed':
                    $this->handle_transcription_completed($recording_data);
                    break;
                    
                case 'transcription.failed':
                    $this->handle_transcription_failed($recording_data);
                    break;
                    
                case 'recording.processing':
                    $this->handle_transcription_processing($recording_data);
                    break;
                    
                default:
                    error_log('Unhandled Noota webhook event: ' . $event_type);
            }
            
            http_response_code(200);
            echo 'OK';
            
        } catch (Exception $e) {
            error_log('Noota webhook error: ' . $e->getMessage());
            http_response_code(500);
            exit('Webhook processing failed');
        }
    }

    private function handle_transcription_completed($recording_data) {
        $recording_id = $recording_data['id'];
        $order_id = $recording_data['metadata']['order_id'] ?? '';
        
        if (!$order_id) {
            throw new Exception('No order ID in webhook data');
        }
        
        // Get full transcription data from Noota
        $noota = new Noota_API();
        $transcription = $noota->get_transcription($recording_id);
        
        if (!$transcription) {
            throw new Exception('Failed to retrieve transcription from Noota');
        }
        
        // Process and format transcription data
        $formatted_data = $this->format_transcription_data($transcription);
        
        // Update order status
        $this->update_order_in_supabase($order_id, [
            'status' => 'completed',
            'transcription_data' => $formatted_data,
            'completed_at' => date('c')
        ]);
        
        // Send completion email
        $order = $this->get_order_from_supabase($order_id);
        if ($order) {
            $this->send_transcription_completion_email($order, $formatted_data);
        }
        
        // Trigger Zapier automation for completed orders
        $zapier_integration = new Zapier_Integration();
        $zapier_integration->trigger_order_completed($order_id, $formatted_data);
        
        // Track completion
        $this->track_event_internal('transcription_completed', [
            'order_id' => $order_id,
            'noota_recording_id' => $recording_id,
            'duration' => $transcription['duration'] ?? 0
        ]);
    }

    private function handle_transcription_failed($recording_data) {
        $recording_id = $recording_data['id'];
        $order_id = $recording_data['metadata']['order_id'] ?? '';
        $error_message = $recording_data['error'] ?? 'Unknown error';
        
        if ($order_id) {
            $this->update_order_in_supabase($order_id, [
                'status' => 'failed',
                'error_message' => $error_message,
                'failed_at' => date('c')
            ]);
            
            // Send failure notification
            $order = $this->get_order_from_supabase($order_id);
            if ($order) {
                $this->send_transcription_failure_email($order, $error_message);
            }
            
            // Trigger Zapier fallback for failed transcriptions
            if (get_option('axim_zapier_fallback_enabled', false)) {
                $zapier_integration = new Zapier_Integration();
                $zapier_integration->trigger_transcription_retry($order_id, $error_message);
            }
        }
        
        $this->track_event_internal('transcription_failed', [
            'order_id' => $order_id,
            'noota_recording_id' => $recording_id,
            'error' => $error_message
        ]);
    }

    private function handle_transcription_processing($recording_data) {
        $recording_id = $recording_data['id'];
        $order_id = $recording_data['metadata']['order_id'] ?? '';
        $progress = $recording_data['progress'] ?? 0;
        
        if ($order_id) {
            $this->update_order_in_supabase($order_id, [
                'processing_progress' => $progress,
                'updated_at' => date('c')
            ]);
        }
        
        $this->track_event_internal('transcription_progress', [
            'order_id' => $order_id,
            'noota_recording_id' => $recording_id,
            'progress' => $progress
        ]);
    }

    private function format_transcription_data($transcription) {
        return [
            'transcript' => $transcription['transcript'] ?? '',
            'summary' => $transcription['summary'] ?? '',
            'chapters' => $transcription['chapters'] ?? [],
            'keywords' => $transcription['keywords'] ?? [],
            'speakers' => $transcription['speakers'] ?? [],
            'duration' => $transcription['duration'] ?? 0,
            'language' => $transcription['language'] ?? 'en',
            'confidence' => $transcription['confidence'] ?? 0,
            'word_count' => str_word_count($transcription['transcript'] ?? ''),
            'processed_at' => date('c')
        ];
    }

    private function send_transcription_completion_email($order, $transcription_data) {
        $to = $order['guest_email'];
        $subject = 'Your AXiM Transcription is Ready - Order ' . $order['id'];
        
        $message = "Hello,\n\n";
        $message .= "Your transcription is now complete!\n\n";
        $message .= "Order ID: " . $order['id'] . "\n";
        $message .= "Duration: " . $transcription_data['duration'] . " seconds\n";
        $message .= "Word Count: " . $transcription_data['word_count'] . " words\n\n";
        
        if (!empty($transcription_data['summary'])) {
            $message .= "SUMMARY:\n";
            $message .= $transcription_data['summary'] . "\n\n";
        }
        
        $message .= "FULL TRANSCRIPT:\n";
        $message .= $transcription_data['transcript'] . "\n\n";
        
        if (!empty($transcription_data['chapters'])) {
            $message .= "CHAPTERS:\n";
            foreach ($transcription_data['chapters'] as $chapter) {
                $message .= "- " . $chapter['title'] . " (" . $chapter['start_time'] . ")\n";
            }
            $message .= "\n";
        }
        
        $message .= "Thank you for using AXiM Transcription Service!\n";
        $message .= "Best regards,\nAXiM Systems";
        
        wp_mail($to, $subject, $message);
    }

    private function send_transcription_failure_email($order, $error_message) {
        $to = $order['guest_email'];
        $subject = 'AXiM Transcription Processing Issue - Order ' . $order['id'];
        
        $message = "Hello,\n\n";
        $message .= "We encountered an issue processing your transcription.\n\n";
        $message .= "Order ID: " . $order['id'] . "\n";
        $message .= "Error: " . $error_message . "\n\n";
        $message .= "Our team has been notified and will contact you shortly to resolve this issue.\n\n";
        $message .= "If you have any questions, please contact support@aximsystems.com\n\n";
        $message .= "Best regards,\nAXiM Systems";
        
        wp_mail($to, $subject, $message);
    }

    private function detect_audio_language($file) {
        // Simple language detection based on file metadata or default to English
        // In a production environment, you might want to use a more sophisticated detection method
        return 'en';
    }

    public function check_transcription_status() {
        // Get all processing orders
        $processing_orders = $this->get_processing_orders_from_supabase();
        
        $noota = new Noota_API();
        
        foreach ($processing_orders as $order) {
            if (!empty($order['noota_recording_id'])) {
                try {
                    $status = $noota->get_recording_status($order['noota_recording_id']);
                    
                    if ($status['status'] === 'completed' && $order['status'] !== 'completed') {
                        $this->handle_transcription_completed($status);
                    } elseif ($status['status'] === 'failed' && $order['status'] !== 'failed') {
                        $this->handle_transcription_failed($status);
                    }
                } catch (Exception $e) {
                    error_log('Error checking transcription status for order ' . $order['id'] . ': ' . $e->getMessage());
                }
            }
        }
    }

    // Stripe payment methods with discount support
    public function create_payment_intent() {
        check_ajax_referer('axim-nonce', 'nonce');
        
        $amount = floatval($_POST['amount']) * 100;
        $currency = sanitize_text_field($_POST['currency'] ?? 'usd');
        $customer_email = sanitize_email($_POST['customer_email']);
        $order_data = json_decode(stripslashes($_POST['order_data']), true);
        
        try {
            $stripe_secret = get_option('axim_stripe_secret_key', '');
            if (empty($stripe_secret)) {
                throw new Exception('Stripe not configured');
            }

            require_once AXIM_PATH . 'includes/stripe-php/init.php';
            \Stripe\Stripe::setApiKey($stripe_secret);

            $customer = null;
            try {
                $customers = \Stripe\Customer::all([
                    'email' => $customer_email,
                    'limit' => 1
                ]);
                
                if (count($customers->data) > 0) {
                    $customer = $customers->data[0];
                } else {
                    $customer = \Stripe\Customer::create([
                        'email' => $customer_email,
                        'name' => $order_data['customerInfo']['name'] ?? '',
                    ]);
                }
            } catch (Exception $e) {
                error_log('Stripe customer error: ' . $e->getMessage());
            }

            $intent = \Stripe\PaymentIntent::create([
                'amount' => $amount,
                'currency' => $currency,
                'customer' => $customer ? $customer->id : null,
                'receipt_email' => $customer_email,
                'metadata' => [
                    'order_id' => $order_data['orderId'] ?? uniqid('axm_'),
                    'plan_id' => $order_data['planId'] ?? '',
                    'customer_name' => $order_data['customerInfo']['name'] ?? '',
                    'duration' => $order_data['audioDuration'] ?? 0,
                    'discount_code' => $order_data['discountCode'] ?? '',
                    'discount_amount' => $order_data['discountAmount'] ?? 0,
                    'source' => 'axim_transcription_plugin'
                ],
                'description' => 'AXiM Transcription Service - ' . ($order_data['planId'] ?? 'Unknown Plan')
            ]);

            wp_send_json_success([
                'client_secret' => $intent->client_secret,
                'payment_intent_id' => $intent->id
            ]);

        } catch (Exception $e) {
            error_log('Stripe Payment Intent Error: ' . $e->getMessage());
            wp_send_json_error('Payment initialization failed: ' . $e->getMessage());
        }
    }

    public function confirm_payment() {
        check_ajax_referer('axim-nonce', 'nonce');
        
        $payment_intent_id = sanitize_text_field($_POST['payment_intent_id']);
        $order_data = json_decode(stripslashes($_POST['order_data']), true);
        
        try {
            $stripe_secret = get_option('axim_stripe_secret_key', '');
            if (empty($stripe_secret)) {
                throw new Exception('Stripe not configured');
            }

            require_once AXIM_PATH . 'includes/stripe-php/init.php';
            \Stripe\Stripe::setApiKey($stripe_secret);

            $intent = \Stripe\PaymentIntent::retrieve($payment_intent_id);
            
            if ($intent->status === 'succeeded') {
                $this->save_order_to_supabase($order_data, $intent);
                
                // Trigger Zapier automation for new orders
                $zapier_integration = new Zapier_Integration();
                $zapier_integration->trigger_new_order($order_data, $intent);
                
                $this->track_event_internal('payment_success', [
                    'amount' => $intent->amount / 100,
                    'currency' => $intent->currency,
                    'payment_intent_id' => $intent->id,
                    'customer_email' => $order_data['customerInfo']['email'],
                    'discount_code' => $order_data['discountCode'] ?? '',
                    'discount_amount' => $order_data['discountAmount'] ?? 0
                ]);

                wp_send_json_success([
                    'status' => 'succeeded',
                    'order_id' => $order_data['orderId'],
                    'payment_intent_id' => $intent->id
                ]);
            } else {
                wp_send_json_error('Payment not completed');
            }

        } catch (Exception $e) {
            error_log('Payment confirmation error: ' . $e->getMessage());
            wp_send_json_error('Payment confirmation failed: ' . $e->getMessage());
        }
    }

    private function save_order_to_supabase($order_data, $payment_intent) {
        $supabase_url = 'https://ukrzgadtuqlkinsodfxn.supabase.co';
        $supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnpnYWR0dXFsa2luc29kZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU5OTgsImV4cCI6MjA2ODAwMTk5OH0.KcAHbfXI6-83MGYo6AnTrr8OuDgqmgCCwpO4H91H1Bw';

        $order_record = [
            'id' => $order_data['orderId'],
            'plan_id' => $order_data['planId'],
            'customer_info' => $order_data['customerInfo'],
            'guest_email' => $order_data['customerInfo']['email'],
            'is_guest' => !isset($order_data['userId']),
            'user_id' => $order_data['userId'] ?? null,
            'duration' => $order_data['audioDuration'] ?? 0,
            'add_ons' => $order_data['addOns'] ?? [],
            'total_price' => $payment_intent->amount / 100,
            'promo_code' => $order_data['promoCode'] ?? '',
            'discount_code' => $order_data['discountCode'] ?? '',
            'discount_amount' => $order_data['discountAmount'] ?? 0,
            'discount' => $order_data['discount'] ?? 0,
            'payment_intent_id' => $payment_intent->id,
            'payment_status' => 'paid',
            'status' => 'awaiting_upload',
            'transcription_provider' => get_option('axim_transcription_provider', 'noota'),
            'created_at' => date('c'),
            'updated_at' => date('c')
        ];

        $response = wp_remote_post(
            $supabase_url . '/rest/v1/wp_orders_ax9m2k1',
            [
                'headers' => [
                    'apikey' => $supabase_key,
                    'Authorization' => 'Bearer ' . $supabase_key,
                    'Content-Type' => 'application/json',
                    'Prefer' => 'return=minimal'
                ],
                'body' => json_encode($order_record)
            ]
        );

        if (is_wp_error($response)) {
            error_log('Supabase order save error: ' . $response->get_error_message());
        }
    }

    private function get_order_from_supabase($order_id) {
        $supabase_url = 'https://ukrzgadtuqlkinsodfxn.supabase.co';
        $supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnpnYWR0dXFsa2luc29kZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU5OTgsImV4cCI6MjA2ODAwMTk5OH0.KcAHbfXI6-83MGYo6AnTrr8OuDgqmgCCwpO4H91H1Bw';

        $response = wp_remote_get(
            $supabase_url . '/rest/v1/wp_orders_ax9m2k1?id=eq.' . urlencode($order_id),
            [
                'headers' => [
                    'apikey' => $supabase_key,
                    'Authorization' => 'Bearer ' . $supabase_key,
                    'Content-Type' => 'application/json'
                ]
            ]
        );

        if (is_wp_error($response)) {
            return null;
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        return !empty($data) ? $data[0] : null;
    }

    private function update_order_in_supabase($order_id, $updates) {
        $supabase_url = 'https://ukrzgadtuqlkinsodfxn.supabase.co';
        $supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnpnYWR0dXFsa2luc29kZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU5OTgsImV4cCI6MjA2ODAwMTk5OH0.KcAHbfXI6-83MGYo6AnTrr8OuDgqmgCCwpO4H91H1Bw';

        $updates['updated_at'] = date('c');

        wp_remote_request(
            $supabase_url . '/rest/v1/wp_orders_ax9m2k1?id=eq.' . urlencode($order_id),
            [
                'method' => 'PATCH',
                'headers' => [
                    'apikey' => $supabase_key,
                    'Authorization' => 'Bearer ' . $supabase_key,
                    'Content-Type' => 'application/json'
                ],
                'body' => json_encode($updates)
            ]
        );
    }

    private function get_processing_orders_from_supabase() {
        $supabase_url = 'https://ukrzgadtuqlkinsodfxn.supabase.co';
        $supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnpnYWR0dXFsa2luc29kZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU5OTgsImV4cCI6MjA2ODAwMTk5OH0.KcAHbfXI6-83MGYo6AnTrr8OuDgqmgCCwpO4H91H1Bw';

        $response = wp_remote_get(
            $supabase_url . '/rest/v1/wp_orders_ax9m2k1?status=eq.processing',
            [
                'headers' => [
                    'apikey' => $supabase_key,
                    'Authorization' => 'Bearer ' . $supabase_key,
                    'Content-Type' => 'application/json'
                ]
            ]
        );

        if (is_wp_error($response)) {
            return [];
        }

        return json_decode(wp_remote_retrieve_body($response), true) ?: [];
    }

    // Stripe webhook handler (unchanged)
    public function handle_stripe_webhook() {
        $webhook_secret = get_option('axim_stripe_webhook_secret', '');
        
        if (empty($webhook_secret)) {
            http_response_code(400);
            exit('Webhook secret not configured');
        }

        $payload = @file_get_contents('php://input');
        $sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

        try {
            require_once AXIM_PATH . 'includes/stripe-php/init.php';
            $event = \Stripe\Webhook::constructEvent($payload, $sig_header, $webhook_secret);

            switch ($event['type']) {
                case 'payment_intent.succeeded':
                    $this->handle_payment_success($event['data']['object']);
                    break;
                case 'payment_intent.payment_failed':
                    $this->handle_payment_failed($event['data']['object']);
                    break;
                default:
                    error_log('Unhandled Stripe webhook event: ' . $event['type']);
            }

            http_response_code(200);
            echo 'OK';

        } catch (\UnexpectedValueException $e) {
            error_log('Invalid Stripe webhook payload: ' . $e->getMessage());
            http_response_code(400);
            exit('Invalid payload');
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            error_log('Invalid Stripe webhook signature: ' . $e->getMessage());
            http_response_code(400);
            exit('Invalid signature');
        }
    }

    private function handle_payment_success($payment_intent) {
        $this->update_order_in_supabase($payment_intent->metadata->order_id, ['status' => 'awaiting_upload']);
        $this->send_order_confirmation_email($payment_intent);
        
        $this->track_event_internal('webhook_payment_success', [
            'payment_intent_id' => $payment_intent->id,
            'order_id' => $payment_intent->metadata->order_id
        ]);
    }

    private function handle_payment_failed($payment_intent) {
        $this->update_order_in_supabase($payment_intent->metadata->order_id, ['status' => 'payment_failed']);
        
        $this->track_event_internal('webhook_payment_failed', [
            'payment_intent_id' => $payment_intent->id,
            'order_id' => $payment_intent->metadata->order_id
        ]);
    }

    private function send_order_confirmation_email($payment_intent) {
        $metadata = $payment_intent->metadata;
        $to = $payment_intent->receipt_email;
        $subject = 'AXiM Transcription Order Confirmation - ' . $metadata->order_id;
        
        $message = "Thank you for your order!\n\n";
        $message .= "Order ID: " . $metadata->order_id . "\n";
        $message .= "Plan: " . ucfirst($metadata->plan_id) . "\n";
        $message .= "Duration: " . $metadata->duration . " minutes\n";
        $message .= "Amount: $" . number_format($payment_intent->amount / 100, 2) . "\n";
        
        if (!empty($metadata->discount_code)) {
            $message .= "Discount Applied: " . $metadata->discount_code . " ($" . number_format($metadata->discount_amount / 100, 2) . " off)\n";
        }
        
        $message .= "\nNext step: Please upload your audio file to begin processing.\n";
        $message .= "You'll receive another email when your transcript is ready.\n\n";
        $message .= "Best regards,\nAXiM Systems";

        wp_mail($to, $subject, $message);
    }

    // Admin interface methods
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

        add_submenu_page(
            'axim-transcription',
            'Discount Codes',
            'Discount Codes',
            'manage_options',
            'axim-discounts',
            array($this, 'render_discounts_page')
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

    public function render_discounts_page() {
        if (isset($_POST['create_discount'])) {
            $discount_manager = new Discount_Manager();
            $result = $discount_manager->create_discount_code([
                'code' => sanitize_text_field($_POST['discount_code']),
                'discount_percent' => floatval($_POST['discount_percent']),
                'expires_at' => sanitize_text_field($_POST['expires_at']),
                'max_uses' => intval($_POST['max_uses']) ?: null
            ]);
            
            if ($result['success']) {
                echo '<div class="notice notice-success"><p>Discount code created successfully!</p></div>';
            } else {
                echo '<div class="notice notice-error"><p>Error: ' . $result['message'] . '</p></div>';
            }
        }

        $discount_manager = new Discount_Manager();
        $discount_codes = $discount_manager->get_all_discount_codes();
        ?>
        <div class="wrap axim-admin-wrap">
            <h1>Discount Codes Management v<?php echo AXIM_VERSION; ?></h1>
            
            <div class="axim-card">
                <h2>Create New Discount Code</h2>
                <form method="post" action="">
                    <table class="form-table">
                        <tr>
                            <th scope="row">Discount Code</th>
                            <td>
                                <input type="text" name="discount_code" class="regular-text" required 
                                       placeholder="e.g., SAVE20" />
                                <p class="description">Enter a unique discount code</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Discount Percentage</th>
                            <td>
                                <input type="number" name="discount_percent" class="regular-text" 
                                       min="1" max="100" step="0.01" required />
                                <p class="description">Percentage discount (1-100)</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Expiration Date</th>
                            <td>
                                <input type="datetime-local" name="expires_at" class="regular-text" />
                                <p class="description">Leave empty for no expiration</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Maximum Uses</th>
                            <td>
                                <input type="number" name="max_uses" class="regular-text" min="1" />
                                <p class="description">Leave empty for unlimited uses</p>
                            </td>
                        </tr>
                    </table>
                    
                    <?php submit_button('Create Discount Code', 'primary', 'create_discount'); ?>
                </form>
            </div>
            
            <div class="axim-card">
                <h2>Existing Discount Codes</h2>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Discount</th>
                            <th>Uses</th>
                            <th>Max Uses</th>
                            <th>Expires</th>
                            <th>Status</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($discount_codes as $code): ?>
                        <tr>
                            <td><strong><?php echo esc_html($code['code']); ?></strong></td>
                            <td><?php echo esc_html($code['discount_percent']); ?>%</td>
                            <td><?php echo esc_html($code['uses']); ?></td>
                            <td><?php echo $code['max_uses'] ? esc_html($code['max_uses']) : 'Unlimited'; ?></td>
                            <td><?php echo $code['expires_at'] ? date('Y-m-d H:i', strtotime($code['expires_at'])) : 'Never'; ?></td>
                            <td>
                                <?php if ($code['is_active']): ?>
                                    <span style="color: green;">Active</span>
                                <?php else: ?>
                                    <span style="color: red;">Inactive</span>
                                <?php endif; ?>
                            </td>
                            <td><?php echo date('Y-m-d', strtotime($code['created_at'])); ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
        <?php
    }

    public function render_settings_page() {
        if (isset($_POST['submit'])) {
            update_option('axim_stripe_secret_key', sanitize_text_field($_POST['axim_stripe_secret_key']));
            update_option('axim_stripe_webhook_secret', sanitize_text_field($_POST['axim_stripe_webhook_secret']));
            update_option('axim_noota_api_key', sanitize_text_field($_POST['axim_noota_api_key']));
            update_option('axim_noota_workspace_id', sanitize_text_field($_POST['axim_noota_workspace_id']));
            update_option('axim_transcription_provider', sanitize_text_field($_POST['axim_transcription_provider']));
            update_option('axim_zapier_webhook_url', sanitize_text_field($_POST['axim_zapier_webhook_url']));
            update_option('axim_zapier_fallback_enabled', isset($_POST['axim_zapier_fallback_enabled']));
            update_option('axim_discount_codes_enabled', isset($_POST['axim_discount_codes_enabled']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }

        $stripe_secret = get_option('axim_stripe_secret_key', '');
        $webhook_secret = get_option('axim_stripe_webhook_secret', '');
        $noota_api_key = get_option('axim_noota_api_key', '');
        $noota_workspace_id = get_option('axim_noota_workspace_id', '');
        $transcription_provider = get_option('axim_transcription_provider', 'noota');
        $zapier_webhook_url = get_option('axim_zapier_webhook_url', '');
        $zapier_fallback_enabled = get_option('axim_zapier_fallback_enabled', false);
        $discount_codes_enabled = get_option('axim_discount_codes_enabled', true);
        
        $stripe_webhook_url = home_url('/axim/webhook/stripe');
        $noota_webhook_url = home_url('/axim/webhook/noota');
        $internal_zapier_webhook_url = home_url('/axim/webhook/zapier');
        ?>
        <div class="wrap axim-admin-wrap">
            <h1>AXiM Settings v<?php echo AXIM_VERSION; ?></h1>
            
            <form method="post" action="">
                <div class="axim-card">
                    <h2>Feature Settings</h2>
                    <table class="form-table">
                        <tr>
                            <th scope="row">Enable Discount Codes</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="axim_discount_codes_enabled" 
                                           <?php checked($discount_codes_enabled); ?> />
                                    Allow customers to use discount codes during checkout
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Enable Zapier Fallback</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="axim_zapier_fallback_enabled" 
                                           <?php checked($zapier_fallback_enabled); ?> />
                                    Use Zapier as backup when primary transcription fails
                                </label>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <div class="axim-card">
                    <h2>Transcription Provider</h2>
                    <p>Choose your preferred transcription service provider.</p>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row">Provider</th>
                            <td>
                                <select name="axim_transcription_provider" class="regular-text">
                                    <option value="noota" <?php selected($transcription_provider, 'noota'); ?>>Noota API</option>
                                    <option value="openai" <?php selected($transcription_provider, 'openai'); ?>>OpenAI Whisper (Coming Soon)</option>
                                    <option value="azure" <?php selected($transcription_provider, 'azure'); ?>>Azure Speech (Coming Soon)</option>
                                </select>
                                <p class="description">Select the transcription service to use for processing audio files</p>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <div class="axim-card">
                    <h2>Noota API Configuration</h2>
                    <p>Configure your Noota API integration for transcription processing.</p>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row">API Key</th>
                            <td>
                                <input type="password" name="axim_noota_api_key" 
                                       value="<?php echo esc_attr($noota_api_key); ?>" 
                                       class="regular-text" />
                                <p class="description">Your Noota API key from your dashboard</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Workspace ID</th>
                            <td>
                                <input type="text" name="axim_noota_workspace_id" 
                                       value="<?php echo esc_attr($noota_workspace_id); ?>" 
                                       class="regular-text" />
                                <p class="description">Your Noota workspace ID</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Webhook URL</th>
                            <td>
                                <code><?php echo esc_url($noota_webhook_url); ?></code>
                                <p class="description">Add this URL to your Noota webhook settings</p>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <div class="axim-card">
                    <h2>Zapier Integration</h2>
                    <p>Configure Zapier webhooks for automation and backup processing.</p>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row">Zapier Webhook URL</th>
                            <td>
                                <input type="url" name="axim_zapier_webhook_url" 
                                       value="<?php echo esc_attr($zapier_webhook_url); ?>" 
                                       class="regular-text" />
                                <p class="description">Your Zapier webhook URL for triggering automations</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Incoming Webhook URL</th>
                            <td>
                                <code><?php echo esc_url($internal_zapier_webhook_url); ?></code>
                                <p class="description">Use this URL in Zapier to send data back to your site</p>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <div class="axim-card">
                    <h2>Stripe Configuration</h2>
                    <p>Configure your Stripe integration for payment processing.</p>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row">Stripe Secret Key</th>
                            <td>
                                <input type="password" name="axim_stripe_secret_key" 
                                       value="<?php echo esc_attr($stripe_secret); ?>" 
                                       class="regular-text" />
                                <p class="description">Your Stripe secret key (starts with sk_)</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Webhook Secret</th>
                            <td>
                                <input type="password" name="axim_stripe_webhook_secret" 
                                       value="<?php echo esc_attr($webhook_secret); ?>" 
                                       class="regular-text" />
                                <p class="description">Your Stripe webhook endpoint secret</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Webhook URL</th>
                            <td>
                                <code><?php echo esc_url($stripe_webhook_url); ?></code>
                                <p class="description">Add this URL to your Stripe webhook endpoints</p>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
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
                <div class="axim-stat-card">
                    <h3>Processing</h3>
                    <div class="axim-stat-value" id="processing-orders">0</div>
                </div>
            </div>

            <div class="axim-card">
                <h2>Recent Orders</h2>
                <div id="recent-orders">Loading...</div>
            </div>
            
            <div class="axim-card">
                <h2>Discount Code Usage</h2>
                <div id="discount-usage">Loading...</div>
            </div>
            
            <div class="axim-card">
                <h2>Zapier Automations</h2>
                <div id="zapier-status">Loading...</div>
            </div>
        </div>
        <?php
    }

    public function render_analytics_page() {
        ?>
        <div class="wrap axim-admin-wrap">
            <h1>Analytics v<?php echo AXIM_VERSION; ?></h1>
            
            <div class="axim-card">
                <h2>Transcription Analytics</h2>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Status</th>
                            <th>Provider</th>
                            <th>Duration</th>
                            <th>Discount</th>
                            <th>Progress</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody id="transcription-analytics-table">
                        <tr><td colspan="7">Loading...</td></tr>
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
            $this->track_event_internal($event_type, $event_data);
            wp_send_json_success();
        } catch (Exception $e) {
            wp_send_json_error('Failed to track event: ' . $e->getMessage());
        }
    }

    private function track_event_internal($event_type, $event_data) {
        $supabase_url = 'https://ukrzgadtuqlkinsodfxn.supabase.co';
        $supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnpnYWR0dXFsa2luc29kZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU5OTgsImV4cCI6MjA2ODAwMTk5OH0.KcAHbfXI6-83MGYo6AnTrr8OuDgqmgCCwpO4H91H1Bw';

        $data = array(
            'event_type' => $event_type,
            'event_data' => $event_data,
            'ip_address' => $_SERVER['REMOTE_ADDR'],
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'page_url' => $_SERVER['HTTP_REFERER'] ?? '',
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

    private function fetch_analytics_from_supabase() {
        $supabase_url = 'https://ukrzgadtuqlkinsodfxn.supabase.co';
        $supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnpnYWR0dXFsa2luc29kZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU5OTgsImV4cCI6MjA2ODAwMTk5OH0.KcAHbfXI6-83MGYo6AnTrr8OuDgqmgCCwpO4H91H1Bw';

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

        $orders_response = wp_remote_get(
            $supabase_url . '/rest/v1/wp_orders_ax9m2k1?select=total_price,status,transcription_provider,created_at,payment_status,discount_code,discount_amount&order=created_at.desc&limit=100',
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
        $total_orders = 0;
        $paid_orders = 0;
        $processing_orders = 0;
        $total_discount_amount = 0;
        $discount_code_usage = array();
        
        foreach ($orders as $order) {
            $total_orders++;
            if ($order['payment_status'] === 'paid') {
                $paid_orders++;
                $total_revenue += floatval($order['total_price']);
                
                if (!empty($order['discount_code'])) {
                    $total_discount_amount += floatval($order['discount_amount']);
                    if (!isset($discount_code_usage[$order['discount_code']])) {
                        $discount_code_usage[$order['discount_code']] = 0;
                    }
                    $discount_code_usage[$order['discount_code']]++;
                }
            }
            if ($order['status'] === 'processing') {
                $processing_orders++;
            }
        }

        $conversion_rate = $total_views > 0 ? round(($paid_orders / $total_views) * 100, 2) : 0;

        return array(
            'views' => $total_views,
            'orders' => $paid_orders,
            'total_orders' => $total_orders,
            'processing_orders' => $processing_orders,
            'revenue' => $total_revenue,
            'conversion_rate' => $conversion_rate,
            'total_discount_amount' => $total_discount_amount,
            'discount_code_usage' => $discount_code_usage,
            'events' => $event_counts
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
    update_option('axim_version', AXIM_VERSION);
    flush_rewrite_rules();
    
    // Schedule transcription status checks
    if (!wp_next_scheduled('axim_check_transcription_status')) {
        wp_schedule_event(time(), 'hourly', 'axim_check_transcription_status');
    }
    
    // Schedule Zapier fallback processing
    if (!wp_next_scheduled('axim_process_zapier_fallback')) {
        wp_schedule_event(time(), 'every_five_minutes', 'axim_process_zapier_fallback');
    }
    
    wp_cache_flush();
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'axim_deactivation');
function axim_deactivation() {
    flush_rewrite_rules();
    wp_clear_scheduled_hook('axim_check_transcription_status');
    wp_clear_scheduled_hook('axim_process_zapier_fallback');
}

// Add custom cron schedule
add_filter('cron_schedules', 'axim_custom_cron_schedules');
function axim_custom_cron_schedules($schedules) {
    $schedules['every_five_minutes'] = array(
        'interval' => 300,
        'display' => __('Every 5 Minutes')
    );
    return $schedules;
}