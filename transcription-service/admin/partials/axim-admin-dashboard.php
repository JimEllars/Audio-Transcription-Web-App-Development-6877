<div class="wrap axim-admin-wrap">
    <div class="axim-header">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <div class="axim-header-actions">
            <button class="axim-button">Refresh Data</button>
        </div>
    </div>

    <div class="axim-stats-grid">
        <div class="axim-stat-card">
            <h3>Total Views</h3>
            <div class="axim-stat-value" id="total-views">Loading...</div>
        </div>
        <div class="axim-stat-card">
            <h3>Conversions</h3>
            <div class="axim-stat-value" id="total-conversions">Loading...</div>
        </div>
        <div class="axim-stat-card">
            <h3>Abandoned Carts</h3>
            <div class="axim-stat-value" id="abandoned-carts">Loading...</div>
        </div>
    </div>

    <div class="axim-card">
        <h2>Recent Activity</h2>
        <div id="axim-activity-feed">Loading...</div>
    </div>

    <div class="axim-chart-container">
        <h2>Conversion Trends</h2>
        <div id="axim-conversion-chart"></div>
    </div>
</div>