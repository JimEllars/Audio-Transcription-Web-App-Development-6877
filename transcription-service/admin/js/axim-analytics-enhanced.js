import { Chart } from 'chart.js';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

class AXiMAnalytics {
    constructor() {
        this.charts = {};
        this.initializeCharts();
        this.setupExportHandlers();
        this.setupReportScheduling();
    }

    async initializeCharts() {
        // User Journey Funnel
        this.charts.funnel = new Chart('funnel-chart', {
            type: 'bar',
            data: await this.getFunnelData(),
            options: {
                indexAxis: 'y',
                plugins: {
                    title: {
                        display: true,
                        text: 'Conversion Funnel'
                    }
                }
            }
        });

        // Retention Cohort Analysis
        this.charts.retention = new Chart('retention-chart', {
            type: 'heatmap',
            data: await this.getRetentionData(),
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'User Retention by Cohort'
                    }
                }
            }
        });

        // Revenue Trends
        this.charts.revenue = new Chart('revenue-chart', {
            type: 'line',
            data: await this.getRevenueData(),
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Revenue Trends'
                    }
                }
            }
        });
    }

    setupExportHandlers() {
        document.getElementById('export-csv').addEventListener('click', () => this.exportData('csv'));
        document.getElementById('export-excel').addEventListener('click', () => this.exportData('excel'));
        document.getElementById('export-pdf').addEventListener('click', () => this.exportData('pdf'));
    }

    setupReportScheduling() {
        const scheduleForm = document.getElementById('schedule-report-form');
        scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.scheduleReport(new FormData(scheduleForm));
        });
    }

    async exportData(format) {
        const data = await this.getAllAnalyticsData();
        
        switch(format) {
            case 'csv':
                this.exportCSV(data);
                break;
            case 'excel':
                this.exportExcel(data);
                break;
            case 'pdf':
                this.exportPDF(data);
                break;
        }
    }

    async scheduleReport(formData) {
        try {
            const response = await fetch(aximAdminData.ajaxUrl, {
                method: 'POST',
                body: new URLSearchParams({
                    action: 'axim_schedule_report',
                    nonce: aximAdminData.nonce,
                    schedule: formData.get('schedule'),
                    report_type: formData.get('report_type'),
                    recipient: formData.get('recipient')
                })
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Report scheduled successfully!');
            }
        } catch (error) {
            console.error('Error scheduling report:', error);
            toast.error('Failed to schedule report');
        }
    }
}

// Initialize analytics when document is ready
document.addEventListener('DOMContentLoaded', () => {
    new AXiMAnalytics();
});