<div class="wrap axim-admin-wrap">
    <div class="axim-header">
        <h1>Analytics & Reports</h1>
        <div class="axim-header-actions">
            <div class="axim-export-buttons">
                <button id="export-csv" class="axim-button">Export CSV</button>
                <button id="export-excel" class="axim-button">Export Excel</button>
                <button id="export-pdf" class="axim-button">Export PDF</button>
            </div>
        </div>
    </div>

    <!-- Advanced Analytics -->
    <div class="axim-analytics-grid">
        <!-- User Journey Funnel -->
        <div class="axim-card">
            <h2>User Journey Funnel</h2>
            <canvas id="funnel-chart"></canvas>
        </div>

        <!-- Cohort Analysis -->
        <div class="axim-card">
            <h2>User Retention</h2>
            <canvas id="retention-chart"></canvas>
        </div>

        <!-- Revenue Trends -->
        <div class="axim-card">
            <h2>Revenue Analytics</h2>
            <canvas id="revenue-chart"></canvas>
        </div>
    </div>

    <!-- Automated Reports -->
    <div class="axim-card">
        <h2>Schedule Automated Reports</h2>
        <form id="schedule-report-form" class="axim-form">
            <div class="axim-form-group">
                <label for="report-type">Report Type</label>
                <select id="report-type" name="report_type" class="axim-input">
                    <option value="daily">Daily Summary</option>
                    <option value="weekly">Weekly Analysis</option>
                    <option value="monthly">Monthly Report</option>
                    <option value="custom">Custom Report</option>
                </select>
            </div>

            <div class="axim-form-group">
                <label for="schedule">Schedule</label>
                <select id="schedule" name="schedule" class="axim-input">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
            </div>

            <div class="axim-form-group">
                <label for="recipient">Recipient Email</label>
                <input type="email" id="recipient" name="recipient" class="axim-input" required>
            </div>

            <button type="submit" class="axim-button">Schedule Report</button>
        </form>
    </div>
</div>