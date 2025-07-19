<?php
/**
 * Zapier Integration for AXiM Transcription Service
 * 
 * This class handles all Zapier webhook integrations including
 * fallback transcription, order notifications, and automation triggers.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Zapier_Integration {
    private $supabase_url = 'https://ukrzgadtuqlkinsodfxn.supabase.co';
    private $supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnpnYWR0dXFsa2luc29kZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU5OTgsImV4cCI6MjA2ODAwMTk5OH0.KcAHbfXI6-83MGYo6AnTrr8OuDgqmgCCwpO4H91H1Bw';

    /**
     * Trigger new order webhook to Zapier
     */
    public function trigger_new_order($order_data, $payment_intent) {
        $webhook_url = get_option('axim_zapier_webhook_url', '');
        
        if (empty($webhook_url)) {
            return false;
        }

        $payload = [
            'event_type' => 'new_order',
            'order_id' => $order_data['orderId'],
            'customer_name' => $order_data['customerInfo']['name'],
            'customer_email' => $order_data['customerInfo']['email'],
            'customer_company' => $order_data['customerInfo']['company'] ?? '',
            'plan_id' => $order_data['planId'],
            'duration' => $order_data['audioDuration'] ?? 0,
            'total_price' => $payment_intent->amount / 100,
            'discount_code' => $order_data['discountCode'] ?? '',
            'discount_amount' => $order_data['discountAmount'] ?? 0,
            'payment_intent_id' => $payment_intent->id,
            'created_at' => date('c'),
            'site_url' => get_site_url()
        ];

        return $this->send_webhook($webhook_url, $payload, 'new_order', $order_data['orderId']);
    }

    /**
     * Trigger transcription completed webhook
     */
    public function trigger_order_completed($order_id, $transcription_data) {
        $webhook_url = get_option('axim_zapier_webhook_url', '');
        
        if (empty($webhook_url)) {
            return false;
        }

        // Get order details
        $order = $this->get_order_from_supabase($order_id);
        if (!$order) {
            return false;
        }

        $payload = [
            'event_type' => 'transcription_completed',
            'order_id' => $order_id,
            'customer_email' => $order['guest_email'],
            'customer_name' => $order['customer_info']['name'] ?? '',
            'plan_id' => $order['plan_id'],
            'duration' => $transcription_data['duration'] ?? 0,
            'word_count' => $transcription_data['word_count'] ?? 0,
            'transcript' => $transcription_data['transcript'] ?? '',
            'summary' => $transcription_data['summary'] ?? '',
            'chapters' => $transcription_data['chapters'] ?? [],
            'keywords' => $transcription_data['keywords'] ?? [],
            'completed_at' => date('c'),
            'site_url' => get_site_url()
        ];

        return $this->send_webhook($webhook_url, $payload, 'transcription_completed', $order_id);
    }

    /**
     * Trigger transcription fallback when Noota fails
     */
    public function trigger_transcription_fallback($order_id, $audio_file, $error_message) {
        $webhook_url = get_option('axim_zapier_webhook_url', '');
        
        if (empty($webhook_url)) {
            return false;
        }

        // Upload file to WordPress media library first
        $file_url = $this->upload_audio_to_media($audio_file, $order_id);
        
        if (!$file_url) {
            error_log('Failed to upload audio file for Zapier fallback');
            return false;
        }

        // Get order details
        $order = $this->get_order_from_supabase($order_id);
        if (!$order) {
            return false;
        }

        $payload = [
            'event_type' => 'transcription_fallback',
            'order_id' => $order_id,
            'customer_email' => $order['guest_email'],
            'customer_name' => $order['customer_info']['name'] ?? '',
            'plan_id' => $order['plan_id'],
            'audio_file_url' => $file_url,
            'audio_file_name' => $audio_file['name'],
            'audio_file_size' => $audio_file['size'],
            'error_message' => $error_message,
            'primary_provider' => 'noota',
            'fallback_needed' => true,
            'webhook_callback_url' => home_url('/axim/webhook/zapier'),
            'created_at' => date('c'),
            'site_url' => get_site_url()
        ];

        // Log the fallback attempt
        $this->log_zapier_webhook('transcription_fallback', $order_id, $payload, 'pending');

        return $this->send_webhook($webhook_url, $payload, 'transcription_fallback', $order_id);
    }

    /**
     * Trigger transcription retry for failed orders
     */
    public function trigger_transcription_retry($order_id, $error_message) {
        $webhook_url = get_option('axim_zapier_webhook_url', '');
        
        if (empty($webhook_url)) {
            return false;
        }

        $order = $this->get_order_from_supabase($order_id);
        if (!$order) {
            return false;
        }

        $payload = [
            'event_type' => 'transcription_retry',
            'order_id' => $order_id,
            'customer_email' => $order['guest_email'],
            'customer_name' => $order['customer_info']['name'] ?? '',
            'plan_id' => $order['plan_id'],
            'error_message' => $error_message,
            'retry_count' => $order['retry_count'] ?? 0,
            'webhook_callback_url' => home_url('/axim/webhook/zapier'),
            'created_at' => date('c'),
            'site_url' => get_site_url()
        ];

        return $this->send_webhook($webhook_url, $payload, 'transcription_retry', $order_id);
    }

    /**
     * Handle incoming webhook from Zapier
     */
    public function handle_webhook($data) {
        try {
            $event_type = $data['event_type'] ?? '';
            $order_id = $data['order_id'] ?? '';

            switch ($event_type) {
                case 'transcription_completed':
                    return $this->handle_transcription_completed_webhook($data);
                    
                case 'transcription_failed':
                    return $this->handle_transcription_failed_webhook($data);
                    
                case 'customer_added_to_crm':
                    return $this->handle_crm_webhook($data);
                    
                default:
                    return [
                        'success' => false,
                        'message' => 'Unknown webhook event type: ' . $event_type
                    ];
            }

        } catch (Exception $e) {
            error_log('Zapier webhook handling error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error processing webhook: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Handle transcription completed webhook from Zapier
     */
    private function handle_transcription_completed_webhook($data) {
        $order_id = $data['order_id'];
        $transcript = $data['transcript'] ?? '';
        $summary = $data['summary'] ?? '';
        
        if (empty($order_id) || empty($transcript)) {
            return [
                'success' => false,
                'message' => 'Missing required data: order_id and transcript'
            ];
        }

        // Format transcription data
        $transcription_data = [
            'transcript' => $transcript,
            'summary' => $summary,
            'chapters' => $data['chapters'] ?? [],
            'keywords' => $data['keywords'] ?? [],
            'speakers' => $data['speakers'] ?? [],
            'duration' => $data['duration'] ?? 0,
            'language' => $data['language'] ?? 'en',
            'confidence' => $data['confidence'] ?? 0,
            'word_count' => str_word_count($transcript),
            'processed_at' => date('c'),
            'provider' => $data['provider'] ?? 'zapier_fallback'
        ];

        // Update order in Supabase
        $this->update_order_in_supabase($order_id, [
            'status' => 'completed',
            'transcription_data' => $transcription_data,
            'transcription_provider' => 'zapier_fallback',
            'completed_at' => date('c')
        ]);

        // Send completion email
        $order = $this->get_order_from_supabase($order_id);
        if ($order) {
            $this->send_transcription_completion_email($order, $transcription_data);
        }

        // Update webhook log
        $this->log_zapier_webhook('transcription_completed_response', $order_id, $data, 'completed');

        return [
            'success' => true,
            'message' => 'Transcription completed successfully via Zapier fallback'
        ];
    }

    /**
     * Handle transcription failed webhook from Zapier
     */
    private function handle_transcription_failed_webhook($data) {
        $order_id = $data['order_id'];
        $error_message = $data['error_message'] ?? 'Zapier fallback failed';

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

        $this->log_zapier_webhook('transcription_failed_response', $order_id, $data, 'failed');

        return [
            'success' => true,
            'message' => 'Transcription failure processed'
        ];
    }

    /**
     * Handle CRM integration webhook
     */
    private function handle_crm_webhook($data) {
        // Log CRM integration
        $this->log_zapier_webhook('crm_integration', $data['order_id'] ?? '', $data, 'completed');

        return [
            'success' => true,
            'message' => 'CRM integration processed'
        ];
    }

    /**
     * Send webhook to Zapier
     */
    private function send_webhook($url, $payload, $event_type, $order_id) {
        try {
            $args = [
                'method' => 'POST',
                'headers' => [
                    'Content-Type' => 'application/json',
                    'User-Agent' => 'AXiM-Transcription-Service/' . AXIM_VERSION
                ],
                'body' => json_encode($payload),
                'timeout' => 30
            ];

            $response = wp_remote_request($url, $args);

            if (is_wp_error($response)) {
                throw new Exception('Webhook request failed: ' . $response->get_error_message());
            }

            $status_code = wp_remote_retrieve_response_code($response);
            $response_body = wp_remote_retrieve_body($response);

            if ($status_code >= 200 && $status_code < 300) {
                $this->log_zapier_webhook($event_type, $order_id, $payload, 'sent', $response_body);
                return true;
            } else {
                throw new Exception('Webhook failed with status ' . $status_code . ': ' . $response_body);
            }

        } catch (Exception $e) {
            error_log('Zapier webhook error: ' . $e->getMessage());
            $this->log_zapier_webhook($event_type, $order_id, $payload, 'failed', $e->getMessage());
            return false;
        }
    }

    /**
     * Upload audio file to WordPress media library
     */
    private function upload_audio_to_media($audio_file, $order_id) {
        try {
            if (!function_exists('wp_handle_upload')) {
                require_once(ABSPATH . 'wp-admin/includes/file.php');
            }

            $upload_overrides = [
                'test_form' => false,
                'mimes' => [
                    'mp3' => 'audio/mpeg',
                    'wav' => 'audio/wav',
                    'm4a' => 'audio/m4a',
                    'aac' => 'audio/aac',
                    'ogg' => 'audio/ogg'
                ]
            ];

            // Create a unique filename
            $file_extension = pathinfo($audio_file['name'], PATHINFO_EXTENSION);
            $new_filename = 'axim-' . $order_id . '-' . time() . '.' . $file_extension;
            
            // Create a temporary file with the new name
            $temp_file = [
                'name' => $new_filename,
                'type' => $audio_file['type'],
                'tmp_name' => $audio_file['tmp_name'],
                'error' => $audio_file['error'],
                'size' => $audio_file['size']
            ];

            $uploaded_file = wp_handle_upload($temp_file, $upload_overrides);

            if (isset($uploaded_file['error'])) {
                throw new Exception('Upload error: ' . $uploaded_file['error']);
            }

            // Create attachment
            $attachment = [
                'post_mime_type' => $uploaded_file['type'],
                'post_title' => 'AXiM Audio - Order ' . $order_id,
                'post_content' => '',
                'post_status' => 'inherit'
            ];

            $attachment_id = wp_insert_attachment($attachment, $uploaded_file['file']);

            if (is_wp_error($attachment_id)) {
                throw new Exception('Failed to create attachment');
            }

            // Generate metadata
            if (!function_exists('wp_generate_attachment_metadata')) {
                require_once(ABSPATH . 'wp-admin/includes/image.php');
            }

            $attachment_data = wp_generate_attachment_metadata($attachment_id, $uploaded_file['file']);
            wp_update_attachment_metadata($attachment_id, $attachment_data);

            return $uploaded_file['url'];

        } catch (Exception $e) {
            error_log('Audio upload error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Log Zapier webhook activity
     */
    private function log_zapier_webhook($webhook_type, $order_id, $payload, $status, $response_data = null) {
        $log_data = [
            'webhook_type' => $webhook_type,
            'order_id' => $order_id,
            'payload' => $payload,
            'status' => $status,
            'response_data' => $response_data,
            'created_at' => date('c'),
            'processed_at' => $status === 'completed' ? date('c') : null
        ];

        wp_remote_post(
            $this->supabase_url . '/rest/v1/zapier_webhooks_ax9m2k1',
            [
                'headers' => [
                    'apikey' => $this->supabase_key,
                    'Authorization' => 'Bearer ' . $this->supabase_key,
                    'Content-Type' => 'application/json',
                    'Prefer' => 'return=minimal'
                ],
                'body' => json_encode($log_data)
            ]
        );
    }

    /**
     * Get order from Supabase
     */
    private function get_order_from_supabase($order_id) {
        $response = wp_remote_get(
            $this->supabase_url . '/rest/v1/wp_orders_ax9m2k1?id=eq.' . urlencode($order_id),
            [
                'headers' => [
                    'apikey' => $this->supabase_key,
                    'Authorization' => 'Bearer ' . $this->supabase_key,
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

    /**
     * Update order in Supabase
     */
    private function update_order_in_supabase($order_id, $updates) {
        $updates['updated_at'] = date('c');

        wp_remote_request(
            $this->supabase_url . '/rest/v1/wp_orders_ax9m2k1?id=eq.' . urlencode($order_id),
            [
                'method' => 'PATCH',
                'headers' => [
                    'apikey' => $this->supabase_key,
                    'Authorization' => 'Bearer ' . $this->supabase_key,
                    'Content-Type' => 'application/json'
                ],
                'body' => json_encode($updates)
            ]
        );
    }

    /**
     * Send transcription completion email
     */
    private function send_transcription_completion_email($order, $transcription_data) {
        $to = $order['guest_email'];
        $subject = 'Your AXiM Transcription is Ready - Order ' . $order['id'];
        
        $message = "Hello,\n\n";
        $message .= "Your transcription is now complete!\n\n";
        $message .= "Order ID: " . $order['id'] . "\n";
        $message .= "Duration: " . ($transcription_data['duration'] ?? 0) . " seconds\n";
        $message .= "Word Count: " . ($transcription_data['word_count'] ?? 0) . " words\n";
        $message .= "Processed via: Zapier Fallback Service\n\n";
        
        if (!empty($transcription_data['summary'])) {
            $message .= "SUMMARY:\n";
            $message .= $transcription_data['summary'] . "\n\n";
        }
        
        $message .= "FULL TRANSCRIPT:\n";
        $message .= $transcription_data['transcript'] . "\n\n";
        
        $message .= "Thank you for using AXiM Transcription Service!\n";
        $message .= "Best regards,\nAXiM Systems";
        
        wp_mail($to, $subject, $message);
    }

    /**
     * Send transcription failure email
     */
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

    /**
     * Get Zapier webhook statistics
     */
    public function get_webhook_statistics() {
        $response = wp_remote_get(
            $this->supabase_url . '/rest/v1/zapier_webhooks_ax9m2k1?select=webhook_type,status,created_at&order=created_at.desc&limit=100',
            [
                'headers' => [
                    'apikey' => $this->supabase_key,
                    'Authorization' => 'Bearer ' . $this->supabase_key,
                    'Content-Type' => 'application/json'
                ]
            ]
        );

        if (is_wp_error($response)) {
            return [];
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        
        $stats = [
            'total_webhooks' => count($data),
            'successful' => 0,
            'failed' => 0,
            'pending' => 0,
            'by_type' => []
        ];

        foreach ($data as $webhook) {
            switch ($webhook['status']) {
                case 'sent':
                case 'completed':
                    $stats['successful']++;
                    break;
                case 'failed':
                    $stats['failed']++;
                    break;
                case 'pending':
                    $stats['pending']++;
                    break;
            }

            if (!isset($stats['by_type'][$webhook['webhook_type']])) {
                $stats['by_type'][$webhook['webhook_type']] = 0;
            }
            $stats['by_type'][$webhook['webhook_type']]++;
        }

        return $stats;
    }
}