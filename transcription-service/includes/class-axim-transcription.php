<?php
/**
 * Main plugin class
 *
 * @link       https://aximsystems.com
 * @since      1.1.0
 */

class AXiM_Transcription {
    
    public function init() {
        // Register shortcode
        add_shortcode('axim_transcription', array($this, 'render_transcription_widget'));
        
        // Register REST API endpoints
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        
        // Add AJAX handlers
        add_action('wp_ajax_axim_process_order', array($this, 'process_order'));
        add_action('wp_ajax_nopriv_axim_process_order', array($this, 'process_order'));
    }
    
    public function render_transcription_widget($atts) {
        // Parse attributes
        $attributes = shortcode_atts(
            array(
                'default_plan' => 'basic'
            ),
            $atts
        );
        
        // Enqueue scripts and styles
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
        
        // Pass data to JavaScript
        wp_localize_script(
            'axim-transcription-app',
            'aximTranscriptionData',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'restUrl' => rest_url('axim/v1'),
                'nonce' => wp_create_nonce('axim_transcription_nonce'),
                'defaultPlan' => $attributes['default_plan']
            )
        );
        
        // Generate unique ID
        $widget_id = 'axim-transcription-' . uniqid();
        
        // Render container
        return sprintf(
            '<div id="%s" class="axim-transcription-widget" data-default-plan="%s"></div>',
            esc_attr($widget_id),
            esc_attr($attributes['default_plan'])
        );
    }
    
    public function register_rest_routes() {
        register_rest_route('axim/v1', '/plans', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_plans'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('axim/v1', '/orders', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_order'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('axim/v1', '/orders/(?P<id>[a-zA-Z0-9-]+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_order'),
            'permission_callback' => '__return_true'
        ));
    }
    
    public function get_plans($request) {
        $plans = array(
            array(
                'id' => 'student',
                'name' => 'Student',
                'price' => 0.25,
                'description' => 'Perfect for students and researchers',
                'features' => array(
                    'AI-Powered Transcript',
                    'Chapter Labels',
                    'Audio Summary Report'
                )
            ),
            array(
                'id' => 'basic',
                'name' => 'Basic',
                'price' => 0.39,
                'description' => 'Great for professionals and teams',
                'features' => array(
                    'AI-Powered Transcript',
                    'Chapter Labels',
                    'Audio Summary Report',
                    'Email Summary'
                )
            )
        );
        
        return new WP_REST_Response($plans, 200);
    }
    
    public function create_order($request) {
        $params = $request->get_params();
        
        // Validate request
        if (!isset($params['planId']) || !isset($params['customerInfo'])) {
            return new WP_Error('missing_fields', 'Required fields are missing', array('status' => 400));
        }
        
        // Generate order ID
        $order_id = 'AXM-' . uniqid();
        
        // Store order in database
        global $wpdb;
        $table_name = $wpdb->prefix . 'axim_orders';
        
        $result = $wpdb->insert(
            $table_name,
            array(
                'order_id' => $order_id,
                'plan_id' => $params['planId'],
                'customer_info' => json_encode($params['customerInfo']),
                'total_price' => isset($params['totalPrice']) ? $params['totalPrice'] : 0,
                'status' => 'pending',
                'created_at' => current_time('mysql')
            )
        );
        
        if (!$result) {
            return new WP_Error('db_error', 'Failed to create order', array('status' => 500));
        }
        
        // Return order information
        return new WP_REST_Response(
            array(
                'orderId' => $order_id,
                'status' => 'pending',
                'createdAt' => current_time('mysql')
            ),
            201
        );
    }
    
    public function get_order($request) {
        $order_id = $request['id'];
        
        // Get order from database
        global $wpdb;
        $table_name = $wpdb->prefix . 'axim_orders';
        
        $order = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM $table_name WHERE order_id = %s",
                $order_id
            )
        );
        
        if (!$order) {
            return new WP_Error('not_found', 'Order not found', array('status' => 404));
        }
        
        // Format order data
        $customer_info = json_decode($order->customer_info, true);
        
        return new WP_REST_Response(
            array(
                'orderId' => $order->order_id,
                'planId' => $order->plan_id,
                'customerInfo' => $customer_info,
                'totalPrice' => (float) $order->total_price,
                'status' => $order->status,
                'createdAt' => $order->created_at
            ),
            200
        );
    }
    
    public function process_order() {
        check_ajax_referer('axim_transcription_nonce', 'nonce');
        
        $order_data = json_decode(stripslashes($_POST['order_data']), true);
        
        // Validate order data
        if (!isset($order_data['planId']) || !isset($order_data['customerInfo'])) {
            wp_send_json_error('Invalid order data');
        }
        
        // Generate order ID
        $order_id = 'AXM-' . uniqid();
        
        // Process file upload if provided
        $file_url = '';
        if (isset($_FILES['audio_file'])) {
            $upload_dir = wp_upload_dir();
            $target_dir = $upload_dir['basedir'] . '/axim-transcriptions/';
            
            // Create directory if it doesn't exist
            if (!file_exists($target_dir)) {
                wp_mkdir_p($target_dir);
            }
            
            $file_name = $order_id . '-' . basename($_FILES['audio_file']['name']);
            $target_file = $target_dir . $file_name;
            
            if (move_uploaded_file($_FILES['audio_file']['tmp_name'], $target_file)) {
                $file_url = $upload_dir['baseurl'] . '/axim-transcriptions/' . $file_name;
            } else {
                wp_send_json_error('Failed to upload file');
            }
        }
        
        // Store order in database
        global $wpdb;
        $table_name = $wpdb->prefix . 'axim_orders';
        
        $result = $wpdb->insert(
            $table_name,
            array(
                'order_id' => $order_id,
                'plan_id' => $order_data['planId'],
                'customer_info' => json_encode($order_data['customerInfo']),
                'total_price' => isset($order_data['totalPrice']) ? $order_data['totalPrice'] : 0,
                'file_url' => $file_url,
                'status' => 'processing',
                'created_at' => current_time('mysql')
            )
        );
        
        if (!$result) {
            wp_send_json_error('Failed to create order');
        }
        
        // Send confirmation email
        $this->send_confirmation_email($order_id, $order_data);
        
        // Return order information
        wp_send_json_success(
            array(
                'orderId' => $order_id,
                'status' => 'processing',
                'createdAt' => current_time('mysql')
            )
        );
    }
    
    private function send_confirmation_email($order_id, $order_data) {
        $to = $order_data['customerInfo']['email'];
        $subject = 'Your AXiM Transcription Order: ' . $order_id;
        
        $message = "Hello {$order_data['customerInfo']['name']},\n\n";
        $message .= "Thank you for your order with AXiM Transcription Service.\n\n";
        $message .= "Order ID: $order_id\n";
        $message .= "Plan: {$order_data['planId']}\n";
        $message .= "Total: $" . number_format($order_data['totalPrice'], 2) . "\n\n";
        $message .= "We'll process your transcription and send you the results shortly.\n\n";
        $message .= "Best regards,\n";
        $message .= "AXiM Transcription Team";
        
        $headers = array('Content-Type: text/plain; charset=UTF-8');
        
        wp_mail($to, $subject, $message, $headers);
    }
}