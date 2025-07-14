<?php
/**
 * Analytics functionality for AXiM Transcription
 *
 * @link       https://aximsystems.com
 * @since      1.1.0
 */

class AXiM_Analytics {
    private $supabase;
    
    public function __construct() {
        require_once AXIM_TRANS_PLUGIN_DIR . 'includes/class-axim-supabase.php';
        $this->supabase = new AXiM_Supabase();
        
        add_action('wp_ajax_axim_schedule_report', array($this, 'schedule_report'));
        add_action('axim_generate_scheduled_reports', array($this, 'generate_scheduled_reports'));
        add_action('wp_ajax_axim_get_analytics', array($this, 'get_analytics_data'));
    }
    
    public function init() {
        // Register tracking hooks
        add_action('wp_ajax_axim_track_event', array($this, 'track_event'));
        add_action('wp_ajax_nopriv_axim_track_event', array($this, 'track_event'));
    }
    
    public function track_event() {
        check_ajax_referer('axim_transcription_nonce', 'nonce');
        
        $event_type = sanitize_text_field($_POST['event_type']);
        $event_data = json_decode(stripslashes($_POST['event_data']), true);
        
        // Store in local database
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
            )
        );
        
        // Also send to Supabase if connected
        if ($this->supabase->is_connected()) {
            try {
                $this->supabase->from('analytics_ax9m2k1')
                    ->insert([
                        'event_type' => $event_type,
                        'event_data' => $event_data,
                        'user_id' => get_current_user_id(),
                        'ip_address' => $this->get_client_ip(),
                        'user_agent' => $_SERVER['HTTP_USER_AGENT'],
                        'created_at' => date('Y-m-d H:i:s')
                    ])
                    ->execute();
            } catch (Exception $e) {
                // Log error but don't stop execution
                error_log('Supabase analytics error: ' . $e->getMessage());
            }
        }
        
        wp_send_json_success();
    }
    
    public function schedule_report() {
        check_ajax_referer('axim_admin_nonce', 'nonce');
        
        $schedule = sanitize_text_field($_POST['schedule']);
        $report_type = sanitize_text_field($_POST['report_type']);
        $recipient = sanitize_email($_POST['recipient']);
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'axim_reports';
        
        $result = $wpdb->insert(
            $table_name,
            array(
                'report_name' => $report_type . ' Report',
                'report_type' => $report_type,
                'schedule' => $schedule,
                'recipient_email' => $recipient
            )
        );
        
        if ($result) {
            wp_send_json_success();
        } else {
            wp_send_json_error('Failed to schedule report');
        }
    }
    
    public function generate_scheduled_reports() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'axim_reports';
        
        // Get reports that need to be sent
        $reports = $wpdb->get_results(
            "SELECT * FROM $table_name WHERE 
            (schedule = 'daily') OR 
            (schedule = 'weekly' AND WEEKDAY(NOW()) = 0) OR 
            (schedule = 'monthly' AND DAY(NOW()) = 1)"
        );
        
        foreach ($reports as $report) {
            $data = $this->generate_report_data($report->report_type);
            $pdf = $this->generate_pdf_report($data, $report->report_name);
            $this->send_report_email($report->recipient_email, $pdf, $report->report_name);
            
            // Update last sent time
            $wpdb->update(
                $table_name,
                array('last_sent' => current_time('mysql')),
                array('id' => $report->id)
            );
        }
    }
    
    private function generate_report_data($report_type) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'axim_analytics';
        
        $data = [];
        
        switch ($report_type) {
            case 'daily':
                $start_date = date('Y-m-d 00:00:00', strtotime('-1 day'));
                $end_date = date('Y-m-d 23:59:59', strtotime('-1 day'));
                break;
                
            case 'weekly':
                $start_date = date('Y-m-d 00:00:00', strtotime('-7 days'));
                $end_date = date('Y-m-d 23:59:59');
                break;
                
            case 'monthly':
                $start_date = date('Y-m-d 00:00:00', strtotime('-30 days'));
                $end_date = date('Y-m-d 23:59:59');
                break;
                
            default:
                $start_date = date('Y-m-d 00:00:00', strtotime('-30 days'));
                $end_date = date('Y-m-d 23:59:59');
        }
        
        // Get event counts by type
        $events = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT event_type, COUNT(*) as count FROM $table_name 
                WHERE created_at BETWEEN %s AND %s 
                GROUP BY event_type",
                $start_date,
                $end_date
            )
        );
        
        $data['events'] = $events;
        
        // Get conversion data
        $views = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM $table_name 
                WHERE event_type = 'page_view' AND created_at BETWEEN %s AND %s",
                $start_date,
                $end_date
            )
        );
        
        $orders = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM $table_name 
                WHERE event_type = 'order_complete' AND created_at BETWEEN %s AND %s",
                $start_date,
                $end_date
            )
        );
        
        $data['conversion'] = [
            'views' => $views,
            'orders' => $orders,
            'rate' => $views > 0 ? round(($orders / $views) * 100, 2) : 0
        ];
        
        return $data;
    }
    
    private function generate_pdf_report($data, $report_name) {
        // Use a PDF library to generate the report
        // This is a simplified example
        $pdf = "AXiM Transcription Analytics Report\n\n";
        $pdf .= "Report: $report_name\n";
        $pdf .= "Date: " . date('Y-m-d H:i:s') . "\n\n";
        
        $pdf .= "Event Summary:\n";
        foreach ($data['events'] as $event) {
            $pdf .= "- {$event->event_type}: {$event->count}\n";
        }
        
        $pdf .= "\nConversion Data:\n";
        $pdf .= "- Views: {$data['conversion']['views']}\n";
        $pdf .= "- Orders: {$data['conversion']['orders']}\n";
        $pdf .= "- Conversion Rate: {$data['conversion']['rate']}%\n";
        
        return $pdf;
    }
    
    private function send_report_email($recipient, $pdf, $report_name) {
        $subject = "AXiM Transcription - $report_name";
        $message = "Please find attached your $report_name.\n\n";
        $message .= "This report was automatically generated by AXiM Transcription Service.";
        
        wp_mail($recipient, $subject, $message, [], []);
    }
    
    public function get_analytics_data() {
        check_ajax_referer('axim_admin_nonce', 'nonce');
        
        $range = isset($_POST['range']) ? sanitize_text_field($_POST['range']) : '7d';
        
        switch ($range) {
            case '30d':
                $start_date = date('Y-m-d 00:00:00', strtotime('-30 days'));
                break;
                
            case '90d':
                $start_date = date('Y-m-d 00:00:00', strtotime('-90 days'));
                break;
                
            case '7d':
            default:
                $start_date = date('Y-m-d 00:00:00', strtotime('-7 days'));
        }
        
        $end_date = date('Y-m-d 23:59:59');
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'axim_analytics';
        
        // Get page views
        $views = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM $table_name 
                WHERE event_type = 'page_view' AND created_at BETWEEN %s AND %s",
                $start_date,
                $end_date
            )
        );
        
        // Get conversions
        $conversions = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM $table_name 
                WHERE event_type = 'order_complete' AND created_at BETWEEN %s AND %s",
                $start_date,
                $end_date
            )
        );
        
        // Get abandoned carts
        $abandoned = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM $table_name 
                WHERE event_type = 'cart_abandon' AND created_at BETWEEN %s AND %s",
                $start_date,
                $end_date
            )
        );
        
        // Get daily data for chart
        $daily_data = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    DATE(created_at) as date,
                    COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as views,
                    COUNT(CASE WHEN event_type = 'order_complete' THEN 1 END) as orders
                FROM $table_name 
                WHERE created_at BETWEEN %s AND %s
                GROUP BY DATE(created_at)
                ORDER BY date ASC",
                $start_date,
                $end_date
            )
        );
        
        $data = [
            'views' => $views ?: 0,
            'conversions' => $conversions ?: 0,
            'abandoned' => $abandoned ?: 0,
            'chartData' => $daily_data
        ];
        
        wp_send_json_success($data);
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
}