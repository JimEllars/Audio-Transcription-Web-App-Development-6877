<?php
class AXiM_Analytics {
    private $supabase;
    
    public function __construct() {
        $this->supabase = new AXiM_Supabase();
        add_action('wp_ajax_axim_schedule_report', array($this, 'schedule_report'));
        add_action('axim_generate_scheduled_reports', array($this, 'generate_scheduled_reports'));
    }

    public function schedule_report() {
        check_ajax_referer('axim_admin_nonce', 'nonce');
        
        $schedule = sanitize_text_field($_POST['schedule']);
        $report_type = sanitize_text_field($_POST['report_type']);
        $recipient = sanitize_email($_POST['recipient']);

        try {
            $result = $this->supabase->from('automated_reports_ax9m2k1')
                ->insert([
                    'report_type' => $report_type,
                    'schedule' => $schedule,
                    'recipient_email' => $recipient
                ])
                ->execute();

            wp_send_json_success($result);
        } catch (Exception $e) {
            wp_send_json_error($e->getMessage());
        }
    }

    public function generate_scheduled_reports() {
        $reports = $this->get_due_reports();
        
        foreach ($reports as $report) {
            $data = $this->generate_report_data($report->report_type);
            $pdf = $this->generate_pdf_report($data);
            
            $this->send_report_email($report->recipient_email, $pdf);
            
            $this->update_report_sent_time($report->id);
        }
    }

    private function generate_pdf_report($data) {
        require_once(AXIM_TRANS_PLUGIN_DIR . 'vendor/autoload.php');
        
        $pdf = new TCPDF();
        // Add report content
        $pdf->AddPage();
        $pdf->SetFont('helvetica', '', 12);
        
        // Add charts and data
        foreach ($data as $section) {
            $pdf->Cell(0, 10, $section['title'], 0, 1);
            $pdf->WriteHTML($section['content']);
            $pdf->Ln(10);
        }
        
        return $pdf->Output('report.pdf', 'S');
    }

    private function send_report_email($recipient, $pdf) {
        $headers = array('Content-Type: application/pdf');
        $attachments = array(
            array(
                'content' => $pdf,
                'filename' => 'analytics-report.pdf'
            )
        );
        
        wp_mail(
            $recipient,
            'Your AXiM Analytics Report',
            'Please find your analytics report attached.',
            $headers,
            $attachments
        );
    }
}