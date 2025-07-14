(function($) {
    'use strict';

    // Initialize widget functionality
    function initWidget() {
        $('.axim-widget').each(function() {
            const widget = $(this);
            const defaultPlan = widget.data('plan');

            // Track widget view
            trackEvent('widget_view', {
                plan: defaultPlan,
                page: window.location.href
            });

            // Handle CTA click
            widget.find('.axim-cta').on('click', function() {
                trackEvent('widget_click', {
                    plan: defaultPlan,
                    page: window.location.href
                });
            });
        });
    }

    // Track events
    function trackEvent(eventType, eventData) {
        $.ajax({
            url: aximTransData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'axim_track_event',
                nonce: aximTransData.nonce,
                event_type: eventType,
                event_data: JSON.stringify(eventData)
            }
        });
    }

    // Initialize on document ready
    $(document).ready(initWidget);

    // Initialize when Elementor frontend is ready
    $(window).on('elementor/frontend/init', function() {
        if (window.elementorFrontend) {
            elementorFrontend.hooks.addAction('frontend/element_ready/global', initWidget);
        }
    });

})(jQuery);