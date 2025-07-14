jQuery(document).ready(function($) {
  console.log('AXiM Admin v' + aximAdminData.version + ' loaded');
  
  // Initialize admin functionality
  initializeAnalytics();

  function initializeAnalytics() {
    // Load analytics data
    $.post(aximAdminData.ajaxUrl, {
      action: 'axim_get_analytics',
      nonce: aximAdminData.nonce
    }, function(response) {
      if (response.success) {
        updateStatCards(response.data);
        updateAnalyticsTable(response.data);
      } else {
        console.error('Failed to load analytics:', response.data);
      }
    }).fail(function() {
      console.log('Failed to load analytics data');
    });
  }

  function updateStatCards(data) {
    $('#total-views').text(data.views || 0);
    $('#total-orders').text(data.orders || 0);
    $('#total-revenue').text('$' + (data.revenue || 0).toFixed(2));

    // Add animation
    $('.axim-stat-value').each(function() {
      $(this).addClass('animate-count');
    });
  }

  function updateAnalyticsTable(data) {
    const table = $('#analytics-table');
    let html = '';

    if (data.events && Object.keys(data.events).length > 0) {
      Object.keys(data.events).forEach(function(eventType) {
        html += '<tr>';
        html += '<td>' + eventType.replace('_', ' ').toUpperCase() + '</td>';
        html += '<td>' + data.events[eventType] + '</td>';
        html += '<td>Recent</td>';
        html += '</tr>';
      });
    } else {
      html = '<tr><td colspan="3">No events recorded yet</td></tr>';
    }

    table.html(html);
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

  // Add CSS for animations
  const animationCSS = `
    <style>
      .animate-count {
        animation: countUp 0.5s ease-out;
      }
      
      @keyframes countUp {
        from {
          transform: scale(0.8);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
    </style>
  `;
  $('head').append(animationCSS);
});