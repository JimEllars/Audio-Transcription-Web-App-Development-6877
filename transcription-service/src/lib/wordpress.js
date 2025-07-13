// WordPress integration utilities
export const wpData = window.aximTranscriptionData || {
    ajaxUrl: '',
    nonce: '',
    siteUrl: '',
    pluginUrl: ''
};

// AJAX helper function
export async function wpAjax(action, data = {}) {
    try {
        const response = await fetch(wpData.ajaxUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action,
                nonce: wpData.nonce,
                ...data
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success === false) {
            throw new Error(result.data || 'Unknown error occurred');
        }

        return result.data;
    } catch (error) {
        console.error('WordPress AJAX Error:', error);
        throw error;
    }
}