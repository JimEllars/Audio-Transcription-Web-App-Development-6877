document.addEventListener('DOMContentLoaded', function() {
    const { createRoot } = wp.element;
    
    // Analytics Dashboard Component
    function AnalyticsDashboard() {
        const [data, setData] = useState({
            views: 0,
            conversions: 0,
            abandoned: 0,
            chartData: []
        });
        const [loading, setLoading] = useState(true);
        const [dateRange, setDateRange] = useState('7d');

        useEffect(() => {
            fetchAnalyticsData();
        }, [dateRange]);

        const fetchAnalyticsData = async () => {
            try {
                const response = await fetch(aximAdminData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'axim_get_analytics',
                        nonce: aximAdminData.nonce,
                        range: dateRange
                    })
                });

                const result = await response.json();
                if (result.success) {
                    setData(result.data);
                }
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        return (
            <div className="axim-analytics-dashboard">
                <div className="axim-analytics-header">
                    <h2>Analytics Dashboard</h2>
                    <div className="axim-date-range">
                        <select 
                            value={dateRange} 
                            onChange={(e) => setDateRange(e.target.value)}
                            className="axim-select"
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 90 Days</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="axim-loading">Loading...</div>
                ) : (
                    <>
                        <div className="axim-stats-grid">
                            <StatCard 
                                title="Total Views" 
                                value={data.views}
                                icon="visibility"
                            />
                            <StatCard 
                                title="Conversions" 
                                value={data.conversions}
                                icon="trending_up"
                            />
                            <StatCard 
                                title="Abandoned Carts" 
                                value={data.abandoned}
                                icon="shopping_cart"
                            />
                        </div>

                        <div className="axim-chart-container">
                            {/* Chart implementation here */}
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Render the dashboard if container exists
    const dashboardContainer = document.getElementById('axim-analytics-dashboard');
    if (dashboardContainer) {
        const root = createRoot(dashboardContainer);
        root.render(<AnalyticsDashboard />);
    }
});