jQuery(document).ready(function($) {
    // Initialize admin functionality
    initializeAnalytics();
    
    function initializeAnalytics() {
        // Load analytics data
        $.post(ajaxurl, {
            action: 'axim_get_analytics',
            nonce: aximAdminData.nonce
        }, function(response) {
            if (response.success) {
                updateStatCards(response.data);
                loadActivityFeed();
                loadUsageStats();
            }
        }).fail(function() {
            console.log('Failed to load analytics data');
        });
    }
    
    function updateStatCards(data) {
        $('#total-views').text(data.views || 0);
        $('#total-clicks').text(data.clicks || 0);
        
        // Add animation
        $('.axim-stat-value').each(function() {
            $(this).addClass('animate-count');
        });
    }
    
    function loadActivityFeed() {
        const activityFeed = $('#axim-activity-feed');
        
        // Simulate activity data
        const activities = [
            { type: 'Widget View', time: '2 minutes ago', page: 'Homepage' },
            { type: 'Widget View', time: '5 minutes ago', page: 'Services Page' },
            { type: 'Settings Updated', time: '1 hour ago', user: 'Admin' }
        ];
        
        let html = '<ul class="activity-list">';
        activities.forEach(function(activity) {
            html += '<li class="activity-item">';
            html += '<span class="activity-type">' + activity.type + '</span>';
            html += '<span class="activity-time">' + activity.time + '</span>';
            if (activity.page) {
                html += '<span class="activity-meta">on ' + activity.page + '</span>';
            }
            html += '</li>';
        });
        html += '</ul>';
        
        activityFeed.html(html);
    }
    
    function loadUsageStats() {
        const usageStats = $('#usage-stats');
        
        if (usageStats.length) {
            // Load usage statistics
            $.post(ajaxurl, {
                action: 'axim_get_usage_stats',
                nonce: aximAdminData.nonce
            }, function(response) {
                if (response.success) {
                    updateUsageTable(response.data);
                } else {
                    usageStats.html('<tr><td colspan="3">No data available</td></tr>');
                }
            }).fail(function() {
                usageStats.html('<tr><td colspan="3">Error loading data</td></tr>');
            });
        }
    }
    
    function updateUsageTable(data) {
        const usageStats = $('#usage-stats');
        let html = '';
        
        if (data && data.length > 0) {
            data.forEach(function(stat) {
                html += '<tr>';
                html += '<td>' + stat.event_type + '</td>';
                html += '<td>' + stat.count + '</td>';
                html += '<td>' + stat.last_occurrence + '</td>';
                html += '</tr>';
            });
        } else {
            html = '<tr><td colspan="3">No events recorded yet</td></tr>';
        }
        
        usageStats.html(html);
    }
    
    // Auto-refresh data every 30 seconds
    setInterval(function() {
        initializeAnalytics();
    }, 30000);
    
    // Add some interactive elements
    $('.axim-stat-card').hover(
        function() {
            $(this).css('transform', 'translateY(-2px)');
        },
        function() {
            $(this).css('transform', 'translateY(0)');
        }
    );
});

// Add CSS for activity feed
jQuery(document).ready(function($) {
    const activityCSS = `
        <style>
        .activity-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .activity-item {
            padding: 0.75rem;
            border-bottom: 1px solid #333333;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .activity-item:last-child {
            border-bottom: none;
        }
        .activity-type {
            font-weight: 600;
            color: #44DDA0;
        }
        .activity-time {
            color: #A9A9A9;
            font-size: 0.875rem;
        }
        .activity-meta {
            color: #7F00FF;
            font-size: 0.875rem;
        }
        .animate-count {
            animation: countUp 0.5s ease-out;
        }
        @keyframes countUp {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        </style>
    `;
    $('head').append(activityCSS);
});