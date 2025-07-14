<?php
/**
 * Supabase integration for AXiM Transcription
 *
 * @link       https://aximsystems.com
 * @since      1.1.0
 */

class AXiM_Supabase {
    private $supabase_url;
    private $supabase_key;
    
    public function __construct() {
        $this->supabase_url = get_option('axim_supabase_url', '');
        $this->supabase_key = get_option('axim_supabase_key', '');
    }
    
    public function is_connected() {
        return !empty($this->supabase_url) && !empty($this->supabase_key);
    }
    
    public function from($table) {
        return new AXiM_Supabase_Query($this->supabase_url, $this->supabase_key, $table);
    }
    
    public function auth() {
        return new AXiM_Supabase_Auth($this->supabase_url, $this->supabase_key);
    }
    
    public function storage() {
        return new AXiM_Supabase_Storage($this->supabase_url, $this->supabase_key);
    }
}

class AXiM_Supabase_Query {
    private $supabase_url;
    private $supabase_key;
    private $table;
    private $query_params = [];
    
    public function __construct($supabase_url, $supabase_key, $table) {
        $this->supabase_url = $supabase_url;
        $this->supabase_key = $supabase_key;
        $this->table = $table;
    }
    
    public function select($columns = '*') {
        $this->query_params['select'] = $columns;
        return $this;
    }
    
    public function insert($data) {
        $this->query_params['type'] = 'insert';
        $this->query_params['data'] = $data;
        return $this;
    }
    
    public function update($data) {
        $this->query_params['type'] = 'update';
        $this->query_params['data'] = $data;
        return $this;
    }
    
    public function delete() {
        $this->query_params['type'] = 'delete';
        return $this;
    }
    
    public function eq($column, $value) {
        $this->query_params['filters'][] = [
            'column' => $column,
            'operator' => 'eq',
            'value' => $value
        ];
        return $this;
    }
    
    public function execute() {
        $endpoint = $this->supabase_url . '/rest/v1/' . $this->table;
        $headers = [
            'apikey: ' . $this->supabase_key,
            'Authorization: Bearer ' . $this->supabase_key,
            'Content-Type: application/json',
            'Prefer: return=representation'
        ];
        
        $args = [
            'headers' => $headers,
            'timeout' => 30
        ];
        
        // Build request based on query type
        if (isset($this->query_params['type'])) {
            switch ($this->query_params['type']) {
                case 'insert':
                    $args['method'] = 'POST';
                    $args['body'] = json_encode($this->query_params['data']);
                    break;
                    
                case 'update':
                    $args['method'] = 'PATCH';
                    $args['body'] = json_encode($this->query_params['data']);
                    
                    // Add filters to URL
                    if (isset($this->query_params['filters'])) {
                        foreach ($this->query_params['filters'] as $filter) {
                            $endpoint .= '?' . $filter['column'] . '=eq.' . urlencode($filter['value']);
                        }
                    }
                    break;
                    
                case 'delete':
                    $args['method'] = 'DELETE';
                    
                    // Add filters to URL
                    if (isset($this->query_params['filters'])) {
                        foreach ($this->query_params['filters'] as $filter) {
                            $endpoint .= '?' . $filter['column'] . '=eq.' . urlencode($filter['value']);
                        }
                    }
                    break;
            }
        } else {
            // Default to SELECT
            $args['method'] = 'GET';
            
            // Add select columns
            $select = isset($this->query_params['select']) ? $this->query_params['select'] : '*';
            $endpoint .= '?select=' . urlencode($select);
            
            // Add filters
            if (isset($this->query_params['filters'])) {
                foreach ($this->query_params['filters'] as $filter) {
                    $endpoint .= '&' . $filter['column'] . '=eq.' . urlencode($filter['value']);
                }
            }
        }
        
        $response = wp_remote_request($endpoint, $args);
        
        if (is_wp_error($response)) {
            throw new Exception($response->get_error_message());
        }
        
        $body = wp_remote_retrieve_body($response);
        $status = wp_remote_retrieve_response_code($response);
        
        if ($status < 200 || $status >= 300) {
            throw new Exception('Supabase API error: ' . $body);
        }
        
        return json_decode($body, true);
    }
}

class AXiM_Supabase_Auth {
    private $supabase_url;
    private $supabase_key;
    
    public function __construct($supabase_url, $supabase_key) {
        $this->supabase_url = $supabase_url;
        $this->supabase_key = $supabase_key;
    }
    
    public function signUp($email, $password, $metadata = []) {
        $endpoint = $this->supabase_url . '/auth/v1/signup';
        
        $args = [
            'method' => 'POST',
            'headers' => [
                'apikey: ' . $this->supabase_key,
                'Content-Type: application/json'
            ],
            'body' => json_encode([
                'email' => $email,
                'password' => $password,
                'data' => $metadata
            ])
        ];
        
        $response = wp_remote_request($endpoint, $args);
        
        if (is_wp_error($response)) {
            throw new Exception($response->get_error_message());
        }
        
        return json_decode(wp_remote_retrieve_body($response), true);
    }
    
    public function signIn($email, $password) {
        $endpoint = $this->supabase_url . '/auth/v1/token?grant_type=password';
        
        $args = [
            'method' => 'POST',
            'headers' => [
                'apikey: ' . $this->supabase_key,
                'Content-Type: application/json'
            ],
            'body' => json_encode([
                'email' => $email,
                'password' => $password
            ])
        ];
        
        $response = wp_remote_request($endpoint, $args);
        
        if (is_wp_error($response)) {
            throw new Exception($response->get_error_message());
        }
        
        return json_decode(wp_remote_retrieve_body($response), true);
    }
}

class AXiM_Supabase_Storage {
    private $supabase_url;
    private $supabase_key;
    
    public function __construct($supabase_url, $supabase_key) {
        $this->supabase_url = $supabase_url;
        $this->supabase_key = $supabase_key;
    }
    
    public function upload($bucket, $path, $file) {
        $endpoint = $this->supabase_url . '/storage/v1/object/' . $bucket . '/' . $path;
        
        $args = [
            'method' => 'POST',
            'headers' => [
                'apikey: ' . $this->supabase_key,
                'Authorization: Bearer ' . $this->supabase_key,
                'Content-Type: application/octet-stream'
            ],
            'body' => file_get_contents($file)
        ];
        
        $response = wp_remote_request($endpoint, $args);
        
        if (is_wp_error($response)) {
            throw new Exception($response->get_error_message());
        }
        
        return json_decode(wp_remote_retrieve_body($response), true);
    }
    
    public function getPublicUrl($bucket, $path) {
        return $this->supabase_url . '/storage/v1/object/public/' . $bucket . '/' . $path;
    }
}