// Enhanced savings chart with improved UI and animations
function updateSavingsChart() {
    console.log("Updating savings chart");
    
    let savingsHistory = JSON.parse(localStorage.getItem('savingsHistory')) || [];
    
    // Enhanced empty state with animation
    if (savingsHistory.length === 0) {
        if (elements.savingsChart && elements.savingsChart.parentNode) {
            elements.savingsChart.parentNode.innerHTML = `
                <div class="text-center py-12 animate-fade-in">
                    <div class="animate-bounce mb-4">
                        <i class="fas fa-piggy-bank text-6xl text-purple-300 opacity-60"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-600 mb-2">Start Your Savings Journey!</h3>
                    <p class="text-gray-500 mb-1">No savings data available yet</p>
                    <p class="text-sm text-gray-400">Add your first savings to see beautiful analytics</p>
                    <div class="mt-4 flex justify-center space-x-2">
                        <div class="w-3 h-3 bg-purple-300 rounded-full animate-pulse"></div>
                        <div class="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                        <div class="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                    </div>
                </div>
            `;
        }
        return;
    }
    
    // Destroy previous chart with fade effect
    if (savingsChartInstance) {
        savingsChartInstance.destroy();
        savingsChartInstance = null;
    }
    
    if (!elements.savingsChart || !elements.savingsChart.getContext) {
        console.error("Savings chart canvas not found");
        return;
    }
    
    // Enhanced data processing
    const processedData = processSavingsData(savingsHistory);
    if (!processedData) return;
    
    const { labels, cumulativeData } = processedData;
    
    try {
        // Set responsive dimensions
        elements.savingsChart.style.height = '320px';
        elements.savingsChart.style.maxWidth = '100%';
        
        // Create gradient background
        const ctx = elements.savingsChart.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 320);
        gradient.addColorStop(0, 'rgba(124, 58, 237, 0.3)');
        gradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.1)');
        gradient.addColorStop(1, 'rgba(124, 58, 237, 0.05)');
        
        savingsChartInstance = new Chart(elements.savingsChart, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Savings Progress',
                    data: cumulativeData,
                    borderColor: '#7C3AED',
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#FFFFFF',
                    pointBorderColor: '#7C3AED',
                    pointBorderWidth: 3,
                    pointHoverRadius: 10,
                    pointHoverBackgroundColor: '#F59E0B',
                    pointHoverBorderColor: '#FFFFFF',
                    pointHoverBorderWidth: 4,
                    borderWidth: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeOutCubic',
                    onComplete: function() {
                        // Add sparkle effect on completion
                        showSavingsSparkle();
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#FFFFFF',
                        bodyColor: '#FFFFFF',
                        borderColor: '#7C3AED',
                        borderWidth: 2,
                        cornerRadius: 12,
                        displayColors: false,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        padding: 12,
                        callbacks: {
                            title: function(tooltipItems) {
                                return 'Savings on ' + tooltipItems[0].label;
                            },
                            label: function(context) {
                                const value = context.parsed.y;
                                const change = getChangeFromPrevious(context.dataIndex, cumulativeData);
                                return [
                                    'Balance: ₹' + value.toLocaleString('en-IN', {minimumFractionDigits: 2}),
                                    change ? change : ''
                                ].filter(Boolean);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: { display: false, drawBorder: false },
                        title: {
                            display: true,
                            text: 'Timeline',
                            color: '#6B7280',
                            font: { size: 14, weight: '600' }
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0,
                            color: '#6B7280',
                            font: { size: 12 }
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Amount (₹)',
                            color: '#6B7280',
                            font: { size: 14, weight: '600' }
                        },
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(124, 58, 237, 0.1)',
                            drawBorder: false,
                            lineWidth: 1
                        },
                        ticks: {
                            color: '#6B7280',
                            font: { size: 12 },
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                elements: {
                    point: { hoverRadius: 12 }
                }
            }
        });
        
        console.log("Enhanced savings chart created successfully");
        
    } catch (error) {
        console.error("Error creating savings chart:", error);
        showErrorState();
    }
}

// Helper function to process savings data
function processSavingsData(savingsHistory) {
    try {
        const sortedHistory = savingsHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const labels = [];
        const transactions = [];
        const cumulativeData = [];
        let cumulativeSum = 0;
        
        sortedHistory.forEach(item => {
            const date = new Date(item.date);
            if (isNaN(date.getTime())) return;
            
            const formattedDate = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined
            });
            
            const amount = item.type === 'savings-add' ? item.amount : -item.amount;
            cumulativeSum += amount;
            
            labels.push(formattedDate);
            transactions.push({ ...item, processedAmount: amount });
            cumulativeData.push(cumulativeSum);
        });
        
        return { labels, cumulativeData, transactions };
    } catch (error) {
        console.error("Error processing savings data:", error);
        return null;
    }
}

// Helper function to calculate change from previous point
function getChangeFromPrevious(index, data) {
    if (index === 0) return 'Initial amount';
    const current = data[index];
    const previous = data[index - 1];
    const change = current - previous;
    const sign = change >= 0 ? '+' : '';
    return `Change: ${sign}₹${change.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
}

// Sparkle effect for chart completion
function showSavingsSparkle() {
    const sparkles = document.createElement('div');
    sparkles.className = 'fixed inset-0 pointer-events-none z-50';
    sparkles.innerHTML = `
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div class="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-yellow-400 opacity-75"></div>
            <div class="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></div>
        </div>
    `;
    document.body.appendChild(sparkles);
    setTimeout(() => sparkles.remove(), 1000);
}

// Error state display
function showErrorState() {
    if (elements.savingsChart && elements.savingsChart.parentNode) {
        elements.savingsChart.parentNode.innerHTML = `
            <div class="text-center py-10 animate-fade-in">
                <i class="fas fa-exclamation-triangle text-4xl mb-3 text-red-400"></i>
                <p class="text-red-500 font-semibold">Unable to load savings chart</p>
                <p class="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
            </div>
        `;
    }
}

// Enhanced savings UI update function
function updateSavingsUI() {
    console.log("Updating savings UI");
    
    // Enhanced balance display with animation
    const formattedBalance = savings.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).replace('₹', '');
    
    elements.savingsBalance.innerHTML = `
        <span class="text-purple-600">Savings Balance:</span> 
        <span class="text-green-600 font-bold animate-pulse">₹${formattedBalance}</span>
    `;
    
    // Add balance change animation
    elements.savingsBalance.classList.add('animate-bounce');
    setTimeout(() => {
        elements.savingsBalance.classList.remove('animate-bounce');
    }, 1000);
    
    updateSavingsChart();
}