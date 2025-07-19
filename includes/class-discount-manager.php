<?php
/**
 * Discount Manager for AXiM Transcription Service
 * 
 * This class handles all discount code operations including validation,
 * application, and management of discount codes.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Discount_Manager {
    private $supabase_url = 'https://ukrzgadtuqlkinsodfxn.supabase.co';
    private $supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnpnYWR0dXFsa2luc29kZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU5OTgsImV4cCI6MjA2ODAwMTk5OH0.KcAHbfXI6-83MGYo6AnTrr8OuDgqmgCCwpO4H91H1Bw';

    /**
     * Validate a discount code
     */
    public function validate_code($code, $plan_id = '') {
        try {
            $code = strtoupper(trim($code));
            
            if (empty($code)) {
                return [
                    'valid' => false,
                    'message' => 'Please enter a discount code'
                ];
            }

            // Get discount code from database
            $discount_code = $this->get_discount_code($code);
            
            if (!$discount_code) {
                return [
                    'valid' => false,
                    'message' => 'Invalid discount code'
                ];
            }

            // Check if active
            if (!$discount_code['is_active']) {
                return [
                    'valid' => false,
                    'message' => 'This discount code is no longer active'
                ];
            }

            // Check expiration
            if ($discount_code['expires_at'] && strtotime($discount_code['expires_at']) < time()) {
                return [
                    'valid' => false,
                    'message' => 'This discount code has expired'
                ];
            }

            // Check usage limit
            if ($discount_code['max_uses'] && $discount_code['uses'] >= $discount_code['max_uses']) {
                return [
                    'valid' => false,
                    'message' => 'This discount code has reached its usage limit'
                ];
            }

            // Special validation for student codes
            if ($code === 'STUDENT2025' && $plan_id !== 'student') {
                return [
                    'valid' => false,
                    'message' => 'This discount code is only valid for the Student plan'
                ];
            }

            return [
                'valid' => true,
                'discount_percent' => $discount_code['discount_percent'],
                'message' => 'Discount code applied successfully!'
            ];

        } catch (Exception $e) {
            error_log('Discount validation error: ' . $e->getMessage());
            return [
                'valid' => false,
                'message' => 'Error validating discount code'
            ];
        }
    }

    /**
     * Apply discount to an order
     */
    public function apply_discount($code, $order_id, $original_amount) {
        try {
            $code = strtoupper(trim($code));
            
            // Validate the code first
            $validation = $this->validate_code($code);
            if (!$validation['valid']) {
                return [
                    'success' => false,
                    'message' => $validation['message']
                ];
            }

            $discount_percent = $validation['discount_percent'];
            $discount_amount = ($original_amount * $discount_percent) / 100;
            $final_amount = max(0, $original_amount - $discount_amount);

            // Increment usage count
            $this->increment_usage($code);

            return [
                'success' => true,
                'discount_percent' => $discount_percent,
                'discount_amount' => $discount_amount,
                'final_amount' => $final_amount,
                'message' => 'Discount applied successfully!'
            ];

        } catch (Exception $e) {
            error_log('Discount application error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error applying discount'
            ];
        }
    }

    /**
     * Get discount code from database
     */
    private function get_discount_code($code) {
        $response = wp_remote_get(
            $this->supabase_url . '/rest/v1/discount_codes_ax9m2k1?code=eq.' . urlencode($code),
            [
                'headers' => [
                    'apikey' => $this->supabase_key,
                    'Authorization' => 'Bearer ' . $this->supabase_key,
                    'Content-Type' => 'application/json'
                ]
            ]
        );

        if (is_wp_error($response)) {
            throw new Exception('Database error: ' . $response->get_error_message());
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        return !empty($data) ? $data[0] : null;
    }

    /**
     * Increment usage count for a discount code
     */
    private function increment_usage($code) {
        $response = wp_remote_request(
            $this->supabase_url . '/rest/v1/discount_codes_ax9m2k1?code=eq.' . urlencode($code),
            [
                'method' => 'PATCH',
                'headers' => [
                    'apikey' => $this->supabase_key,
                    'Authorization' => 'Bearer ' . $this->supabase_key,
                    'Content-Type' => 'application/json'
                ],
                'body' => json_encode([
                    'uses' => 'uses + 1',
                    'updated_at' => date('c')
                ])
            ]
        );

        if (is_wp_error($response)) {
            error_log('Error incrementing discount usage: ' . $response->get_error_message());
        }
    }

    /**
     * Create a new discount code
     */
    public function create_discount_code($data) {
        try {
            // Validate input
            if (empty($data['code']) || empty($data['discount_percent'])) {
                return [
                    'success' => false,
                    'message' => 'Code and discount percentage are required'
                ];
            }

            if ($data['discount_percent'] <= 0 || $data['discount_percent'] > 100) {
                return [
                    'success' => false,
                    'message' => 'Discount percentage must be between 1 and 100'
                ];
            }

            $code_data = [
                'code' => strtoupper(trim($data['code'])),
                'discount_percent' => floatval($data['discount_percent']),
                'expires_at' => !empty($data['expires_at']) ? date('c', strtotime($data['expires_at'])) : null,
                'max_uses' => !empty($data['max_uses']) ? intval($data['max_uses']) : null,
                'is_active' => true,
                'uses' => 0,
                'created_at' => date('c'),
                'updated_at' => date('c')
            ];

            $response = wp_remote_post(
                $this->supabase_url . '/rest/v1/discount_codes_ax9m2k1',
                [
                    'headers' => [
                        'apikey' => $this->supabase_key,
                        'Authorization' => 'Bearer ' . $this->supabase_key,
                        'Content-Type' => 'application/json',
                        'Prefer' => 'return=minimal'
                    ],
                    'body' => json_encode($code_data)
                ]
            );

            if (is_wp_error($response)) {
                throw new Exception('Database error: ' . $response->get_error_message());
            }

            $status_code = wp_remote_retrieve_response_code($response);
            if ($status_code === 201) {
                return [
                    'success' => true,
                    'message' => 'Discount code created successfully'
                ];
            } else {
                $error_body = wp_remote_retrieve_body($response);
                $error_data = json_decode($error_body, true);
                
                if (isset($error_data['message']) && strpos($error_data['message'], 'duplicate') !== false) {
                    return [
                        'success' => false,
                        'message' => 'A discount code with this name already exists'
                    ];
                }
                
                return [
                    'success' => false,
                    'message' => 'Failed to create discount code'
                ];
            }

        } catch (Exception $e) {
            error_log('Discount code creation error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error creating discount code: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get all discount codes for admin
     */
    public function get_all_discount_codes() {
        $response = wp_remote_get(
            $this->supabase_url . '/rest/v1/discount_codes_ax9m2k1?order=created_at.desc',
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
        return $data ?: [];
    }

    /**
     * Deactivate a discount code
     */
    public function deactivate_discount_code($code) {
        try {
            $response = wp_remote_request(
                $this->supabase_url . '/rest/v1/discount_codes_ax9m2k1?code=eq.' . urlencode($code),
                [
                    'method' => 'PATCH',
                    'headers' => [
                        'apikey' => $this->supabase_key,
                        'Authorization' => 'Bearer ' . $this->supabase_key,
                        'Content-Type' => 'application/json'
                    ],
                    'body' => json_encode([
                        'is_active' => false,
                        'updated_at' => date('c')
                    ])
                ]
            );

            if (is_wp_error($response)) {
                throw new Exception('Database error: ' . $response->get_error_message());
            }

            return [
                'success' => true,
                'message' => 'Discount code deactivated successfully'
            ];

        } catch (Exception $e) {
            error_log('Discount code deactivation error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error deactivating discount code'
            ];
        }
    }

    /**
     * Get discount code usage statistics
     */
    public function get_usage_statistics() {
        $response = wp_remote_get(
            $this->supabase_url . '/rest/v1/discount_codes_ax9m2k1?select=code,discount_percent,uses,max_uses,created_at',
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
            'total_codes' => count($data),
            'total_uses' => 0,
            'most_used' => null,
            'codes' => $data
        ];

        $max_uses = 0;
        foreach ($data as $code) {
            $stats['total_uses'] += $code['uses'];
            if ($code['uses'] > $max_uses) {
                $max_uses = $code['uses'];
                $stats['most_used'] = $code;
            }
        }

        return $stats;
    }

    /**
     * Calculate discount for preview
     */
    public function calculate_discount_preview($code, $amount) {
        $validation = $this->validate_code($code);
        
        if (!$validation['valid']) {
            return [
                'valid' => false,
                'message' => $validation['message']
            ];
        }

        $discount_percent = $validation['discount_percent'];
        $discount_amount = ($amount * $discount_percent) / 100;
        $final_amount = max(0, $amount - $discount_amount);

        return [
            'valid' => true,
            'discount_percent' => $discount_percent,
            'discount_amount' => $discount_amount,
            'final_amount' => $final_amount,
            'savings' => $discount_amount
        ];
    }
}