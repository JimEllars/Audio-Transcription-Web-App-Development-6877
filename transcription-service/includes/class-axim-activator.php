<?php
/**
 * Fired during plugin activation
 *
 * @link       https://aximsystems.com
 * @since      1.1.0
 */

class AXiM_Activator {
    /**
     * Create necessary database tables and initialize plugin
     *
     * @since    1.1.0
     */
    public static function activate() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Create analytics table
        $table_name = $wpdb->prefix . 'axim_analytics';
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            event_type varchar(50) NOT NULL,
            event_data longtext NOT NULL,
            user_id bigint(20) DEFAULT NULL,
            ip_address varchar(100) DEFAULT NULL,
            user_agent text DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        
        // Create reports table
        $table_reports = $wpdb->prefix . 'axim_reports';
        $sql .= "CREATE TABLE $table_reports (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            report_name varchar(100) NOT NULL,
            report_type varchar(50) NOT NULL,
            schedule varchar(50) DEFAULT 'weekly',
            recipient_email varchar(100) NOT NULL,
            last_sent datetime DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        // Add version to options
        add_option('axim_transcription_db_version', '1.1.0');
    }
}