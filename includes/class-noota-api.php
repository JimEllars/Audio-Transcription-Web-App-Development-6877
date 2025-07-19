<?php
/**
 * Noota API Client for AXiM Transcription Service
 * 
 * This class handles all interactions with the Noota API
 * including file uploads, transcription requests, and webhook handling.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Noota_API {
    private $api_key;
    private $workspace_id;
    private $base_url = 'https://api.noota.io';
    
    public function __construct() {
        $this->api_key = get_option('axim_noota_api_key', '');
        $this->workspace_id = get_option('axim_noota_workspace_id', '');
    }
    
    /**
     * Check if API is properly configured
     */
    public function is_configured() {
        return !empty($this->api_key) && !empty($this->workspace_id);
    }
    
    /**
     * Upload audio file to Noota
     */
    public function upload_audio_file($file, $options = []) {
        if (!$this->is_configured()) {
            throw new Exception('Noota API not configured');
        }
        
        // Validate file
        $allowed_types = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/mpeg'];
        if (!in_array($file['type'], $allowed_types)) {
            throw new Exception('Unsupported audio file type: ' . $file['type']);
        }
        
        // Check file size (max 500MB)
        if ($file['size'] > 500 * 1024 * 1024) {
            throw new Exception('File too large. Maximum size is 500MB.');
        }
        
        $endpoint = $this->base_url . '/v1/recordings';
        
        // Prepare multipart form data
        $boundary = wp_generate_uuid4();
        $body = '';
        
        // Add metadata fields
        $fields = [
            'workspace_id' => $this->workspace_id,
            'title' => $options['title'] ?? 'AXiM Transcription Upload',
            'description' => $options['description'] ?? '',
            'language' => $options['language'] ?? 'en',
            'webhook_url' => $options['webhook_url'] ?? '',
        ];
        
        // Add metadata if provided
        if (!empty($options['metadata'])) {
            $fields['metadata'] = json_encode($options['metadata']);
        }
        
        foreach ($fields as $name => $value) {
            $body .= "--{$boundary}\r\n";
            $body .= "Content-Disposition: form-data; name=\"{$name}\"\r\n\r\n";
            $body .= $value . "\r\n";
        }
        
        // Add file
        $body .= "--{$boundary}\r\n";
        $body .= "Content-Disposition: form-data; name=\"file\"; filename=\"{$file['name']}\"\r\n";
        $body .= "Content-Type: {$file['type']}\r\n\r\n";
        $body .= file_get_contents($file['tmp_name']) . "\r\n";
        $body .= "--{$boundary}--\r\n";
        
        $args = [
            'method' => 'POST',
            'headers' => [
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'multipart/form-data; boundary=' . $boundary,
                'Content-Length' => strlen($body)
            ],
            'body' => $body,
            'timeout' => 300 // 5 minutes for large file uploads
        ];
        
        $response = wp_remote_request($endpoint, $args);
        
        if (is_wp_error($response)) {
            throw new Exception('Upload request failed: ' . $response->get_error_message());
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($status_code !== 201) {
            $error_data = json_decode($response_body, true);
            $error_message = $error_data['message'] ?? 'Upload failed with status ' . $status_code;
            throw new Exception($error_message);
        }
        
        $result = json_decode($response_body, true);
        
        if (!$result || !isset($result['id'])) {
            throw new Exception('Invalid response from Noota API');
        }
        
        return $result;
    }
    
    /**
     * Start transcription process for an uploaded recording
     */
    public function start_transcription($recording_id, $options = []) {
        if (!$this->is_configured()) {
            throw new Exception('Noota API not configured');
        }
        
        $endpoint = $this->base_url . '/v1/recordings/' . $recording_id . '/transcribe';
        
        $body = [
            'language' => $options['language'] ?? 'en',
            'include_summary' => $options['include_summary'] ?? true,
            'include_chapters' => $options['include_chapters'] ?? true,
            'include_keywords' => $options['include_keywords'] ?? true,
            'speaker_detection' => $options['speaker_detection'] ?? true,
            'webhook_url' => $options['webhook_url'] ?? ''
        ];
        
        $args = [
            'method' => 'POST',
            'headers' => [
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json'
            ],
            'body' => json_encode($body),
            'timeout' => 60
        ];
        
        $response = wp_remote_request($endpoint, $args);
        
        if (is_wp_error($response)) {
            throw new Exception('Transcription request failed: ' . $response->get_error_message());
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($status_code !== 200 && $status_code !== 202) {
            $error_data = json_decode($response_body, true);
            $error_message = $error_data['message'] ?? 'Transcription failed with status ' . $status_code;
            throw new Exception($error_message);
        }
        
        return json_decode($response_body, true);
    }
    
    /**
     * Get transcription results
     */
    public function get_transcription($recording_id) {
        if (!$this->is_configured()) {
            throw new Exception('Noota API not configured');
        }
        
        $endpoint = $this->base_url . '/v1/recordings/' . $recording_id . '/transcript';
        
        $args = [
            'method' => 'GET',
            'headers' => [
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json'
            ],
            'timeout' => 30
        ];
        
        $response = wp_remote_request($endpoint, $args);
        
        if (is_wp_error($response)) {
            throw new Exception('Failed to retrieve transcription: ' . $response->get_error_message());
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($status_code !== 200) {
            $error_data = json_decode($response_body, true);
            $error_message = $error_data['message'] ?? 'Failed to retrieve transcription with status ' . $status_code;
            throw new Exception($error_message);
        }
        
        return json_decode($response_body, true);
    }
    
    /**
     * Get recording status
     */
    public function get_recording_status($recording_id) {
        if (!$this->is_configured()) {
            throw new Exception('Noota API not configured');
        }
        
        $endpoint = $this->base_url . '/v1/recordings/' . $recording_id;
        
        $args = [
            'method' => 'GET',
            'headers' => [
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json'
            ],
            'timeout' => 30
        ];
        
        $response = wp_remote_request($endpoint, $args);
        
        if (is_wp_error($response)) {
            throw new Exception('Failed to get recording status: ' . $response->get_error_message());
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($status_code !== 200) {
            $error_data = json_decode($response_body, true);
            $error_message = $error_data['message'] ?? 'Failed to get status with code ' . $status_code;
            throw new Exception($error_message);
        }
        
        return json_decode($response_body, true);
    }
    
    /**
     * List all recordings in workspace
     */
    public function list_recordings($limit = 50, $offset = 0) {
        if (!$this->is_configured()) {
            throw new Exception('Noota API not configured');
        }
        
        $endpoint = $this->base_url . '/v1/recordings';
        $query_params = [
            'workspace_id' => $this->workspace_id,
            'limit' => $limit,
            'offset' => $offset
        ];
        
        $endpoint .= '?' . http_build_query($query_params);
        
        $args = [
            'method' => 'GET',
            'headers' => [
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json'
            ],
            'timeout' => 30
        ];
        
        $response = wp_remote_request($endpoint, $args);
        
        if (is_wp_error($response)) {
            throw new Exception('Failed to list recordings: ' . $response->get_error_message());
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($status_code !== 200) {
            $error_data = json_decode($response_body, true);
            $error_message = $error_data['message'] ?? 'Failed to list recordings with status ' . $status_code;
            throw new Exception($error_message);
        }
        
        return json_decode($response_body, true);
    }
    
    /**
     * Delete a recording
     */
    public function delete_recording($recording_id) {
        if (!$this->is_configured()) {
            throw new Exception('Noota API not configured');
        }
        
        $endpoint = $this->base_url . '/v1/recordings/' . $recording_id;
        
        $args = [
            'method' => 'DELETE',
            'headers' => [
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json'
            ],
            'timeout' => 30
        ];
        
        $response = wp_remote_request($endpoint, $args);
        
        if (is_wp_error($response)) {
            throw new Exception('Failed to delete recording: ' . $response->get_error_message());
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        
        if ($status_code !== 204) {
            $response_body = wp_remote_retrieve_body($response);
            $error_data = json_decode($response_body, true);
            $error_message = $error_data['message'] ?? 'Failed to delete recording with status ' . $status_code;
            throw new Exception($error_message);
        }
        
        return true;
    }
    
    /**
     * Get workspace information
     */
    public function get_workspace_info() {
        if (!$this->is_configured()) {
            throw new Exception('Noota API not configured');
        }
        
        $endpoint = $this->base_url . '/v1/workspaces/' . $this->workspace_id;
        
        $args = [
            'method' => 'GET',
            'headers' => [
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json'
            ],
            'timeout' => 30
        ];
        
        $response = wp_remote_request($endpoint, $args);
        
        if (is_wp_error($response)) {
            throw new Exception('Failed to get workspace info: ' . $response->get_error_message());
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($status_code !== 200) {
            $error_data = json_decode($response_body, true);
            $error_message = $error_data['message'] ?? 'Failed to get workspace info with status ' . $status_code;
            throw new Exception($error_message);
        }
        
        return json_decode($response_body, true);
    }
    
    /**
     * Test API connection
     */
    public function test_connection() {
        try {
            $workspace_info = $this->get_workspace_info();
            return [
                'success' => true,
                'workspace' => $workspace_info['name'] ?? 'Unknown',
                'message' => 'Connection successful'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Get supported languages
     */
    public function get_supported_languages() {
        // Common languages supported by most transcription services
        // This should be updated based on Noota's actual supported languages
        return [
            'en' => 'English',
            'es' => 'Spanish',
            'fr' => 'French',
            'de' => 'German',
            'it' => 'Italian',
            'pt' => 'Portuguese',
            'ru' => 'Russian',
            'ja' => 'Japanese',
            'ko' => 'Korean',
            'zh' => 'Chinese (Mandarin)',
            'ar' => 'Arabic',
            'hi' => 'Hindi',
            'nl' => 'Dutch',
            'pl' => 'Polish',
            'tr' => 'Turkish'
        ];
    }
    
    /**
     * Format file size for display
     */
    private function format_file_size($bytes) {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }
}