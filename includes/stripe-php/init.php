<?php
// Stripe PHP Library - Simplified version for WordPress
// This is a minimal implementation - in production, use the official Stripe PHP library

if (!defined('ABSPATH')) {
    exit;
}

// Simple autoloader for Stripe classes
spl_autoload_register(function ($class) {
    if (strpos($class, 'Stripe\\') === 0) {
        $file = __DIR__ . '/lib/' . str_replace('\\', '/', substr($class, 7)) . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    }
});

// Initialize Stripe namespace
namespace Stripe;

class Stripe {
    public static $apiKey;
    public static $apiBase = 'https://api.stripe.com';
    
    public static function setApiKey($key) {
        self::$apiKey = $key;
    }
}

class PaymentIntent {
    public static function create($params) {
        return self::request('POST', '/v1/payment_intents', $params);
    }
    
    public static function retrieve($id) {
        return self::request('GET', '/v1/payment_intents/' . $id);
    }
    
    private static function request($method, $url, $params = []) {
        $headers = [
            'Authorization: Bearer ' . Stripe::$apiKey,
            'Content-Type: application/x-www-form-urlencoded',
            'Stripe-Version: 2020-08-27'
        ];
        
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => Stripe::$apiBase . $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => http_build_query($params),
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        
        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        
        if ($httpCode >= 400) {
            throw new \Exception('Stripe API error: ' . $response);
        }
        
        $data = json_decode($response);
        return (object) $data;
    }
}

class Customer {
    public static function create($params) {
        return self::request('POST', '/v1/customers', $params);
    }
    
    public static function all($params = []) {
        return self::request('GET', '/v1/customers', $params);
    }
    
    private static function request($method, $url, $params = []) {
        $headers = [
            'Authorization: Bearer ' . Stripe::$apiKey,
            'Content-Type: application/x-www-form-urlencoded',
            'Stripe-Version: 2020-08-27'
        ];
        
        $curl = curl_init();
        
        if ($method === 'GET' && !empty($params)) {
            $url .= '?' . http_build_query($params);
            $params = [];
        }
        
        curl_setopt_array($curl, [
            CURLOPT_URL => Stripe::$apiBase . $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => $method !== 'GET' ? http_build_query($params) : null,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        
        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        
        if ($httpCode >= 400) {
            throw new \Exception('Stripe API error: ' . $response);
        }
        
        $data = json_decode($response);
        return (object) $data;
    }
}

class Webhook {
    public static function constructEvent($payload, $sigHeader, $secret) {
        // Simplified webhook verification
        $elements = explode(',', $sigHeader);
        $signature = null;
        $timestamp = null;
        
        foreach ($elements as $element) {
            $item = explode('=', $element, 2);
            if ($item[0] === 'v1') {
                $signature = $item[1];
            } elseif ($item[0] === 't') {
                $timestamp = $item[1];
            }
        }
        
        if (!$signature || !$timestamp) {
            throw new \Exception('Invalid signature format');
        }
        
        $expectedSignature = hash_hmac('sha256', $timestamp . '.' . $payload, $secret);
        
        if (!hash_equals($expectedSignature, $signature)) {
            throw new \Exception('Invalid signature');
        }
        
        return json_decode($payload, true);
    }
}

// Exception classes
class Exception extends \Exception {}
class UnexpectedValueException extends \UnexpectedValueException {}
class SignatureVerificationException extends \Exception {}