// Initialize data
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let income = parseFloat(localStorage.getItem('income')) || 0;
let onlineIncome = parseFloat(localStorage.getItem('onlineIncome')) || 0;
let cashIncome = parseFloat(localStorage.getItem('cashIncome')) || 0;
let savings = parseFloat(localStorage.getItem('savings')) || 0;
let debts = JSON.parse(localStorage.getItem('debts')) || [];
let chart = null;

// Date management
let currentDate = new Date();
let lastUpdateDate = localStorage.getItem('lastUpdateDate') || currentDate.toDateString();

// Function to get current date in YYYY-MM-DD format
function getCurrentDateString() {
    const now = new Date();
    // Force local timezone date
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Function to refresh date if it's a new day
function checkAndRefreshDate() {
    const now = new Date();
    const today = now.toDateString();

    if (lastUpdateDate !== today) {
        lastUpdateDate = today;
        localStorage.setItem('lastUpdateDate', today);
        currentDate = now;

        // Update all date displays
        updateDateDisplays();

        // Refresh UI to show new day's data
        updateUI();
    }
}

// Function to update all date displays
function updateDateDisplays() {
    const today = new Date();

    if (elements.todayDate) {
        elements.todayDate.textContent = today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    if (elements.currentMonth) {
        elements.currentMonth.textContent = today.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    }

    // FORCE expense date input to today
    const expenseDateInput = document.getElementById('expense-date');
    if (expenseDateInput) {
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        expenseDateInput.value = `${year}-${month}-${day}`;
    }

    // Refresh heatmap for new date
    if (heatmapInitialized) {
        currentHeatmapDate = new Date();
        renderHeatmap(currentHeatmapDate);
    }
}

// Check if user has logged in
const hasLoggedIn = localStorage.getItem('moneyflow_loggedin');
if (!hasLoggedIn) {
    // Redirect to login page if user hasn't logged in
    window.location.href = 'login.html';
}

// Add these variables at the top with other global variables

// DOM Elements
const elements = {
    balanceAmount: document.getElementById('balance-amount'),
    incomeDisplay: document.getElementById('income-display'),
    dailyTab: document.getElementById('daily-tab'),
    monthlyTab: document.getElementById('monthly-tab'),
    // Add heatmap tab element
    heatmapTab: document.getElementById('heatmap-tab'),
    insightsTab: document.getElementById('insights-tab'),
    dailyReport: document.getElementById('daily-report'),
    monthlyReport: document.getElementById('monthly-report'),
    // Add heatmap report element
    heatmapReport: document.getElementById('heatmap-report'),
    insightsReport: document.getElementById('insights-report'),
    dailyExpensesList: document.getElementById('daily-expenses-list'),
    monthlyCategories: document.getElementById('monthly-categories'),
    dailyTotal: document.getElementById('daily-total'),
    monthlyTotal: document.getElementById('monthly-total'),
    todayDate: document.getElementById('today-date'),
    currentMonth: document.getElementById('current-month'),
    addExpenseBtn: document.getElementById('add-expense-btn'),
    expenseModal: document.getElementById('expense-modal'),
    incomeModal: document.getElementById('income-modal'),
    expenseForm: document.getElementById('expense-form'),
    incomeForm: document.getElementById('income-form'),
    addIncomeBtn: document.getElementById('add-income-btn'),
    resetDataBtn: document.getElementById('reset-data-btn'),
    dailyChartBtn: document.getElementById('daily-chart-btn'),
    monthlyChartBtn: document.getElementById('monthly-chart-btn'),
    expenseChart: document.getElementById('expense-chart'),
    chartEmpty: document.getElementById('chart-empty'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message'),
    savingsBalance: document.getElementById('savings-balance'),
    addSavingsBtn: document.getElementById('add-savings-btn'),
    withdrawSavingsBtn: document.getElementById('withdraw-savings-btn'),
    addSavingsAmount: document.getElementById('add-savings-amount'),
    withdrawSavingsAmount: document.getElementById('withdraw-savings-amount'),
    savingsMessage: document.getElementById('savings-message'),
    savingsChart: document.getElementById('savings-chart'),
    savingsChartEmpty: document.getElementById('savings-chart-empty'),
    resetSavingsBtn: document.getElementById('reset-savings-btn'),
    // Goal tracker elements
    goalAmount: document.getElementById('goal-amount'),
    goalDescription: document.getElementById('goal-description'),
    addGoalBtn: document.getElementById('add-goal-btn'),
    goalsList: document.getElementById('goals-list'),
    achievements: document.getElementById('achievements'),
    achievementsList: document.getElementById('achievements-list'),
    // Price history elements
    priceHistoryChart: document.getElementById('price-history-chart'),
    historyChartEmpty: document.getElementById('history-chart-empty'),
    downloadPdfBtn: document.getElementById('download-pdf-btn'),
    historyTable: document.getElementById('history-table'),
    historyTableBody: document.getElementById('history-table-body'),
    // Heatmap elements
    heatmapDays: document.getElementById('heatmap-days'),
    heatmapMonthYear: document.getElementById('heatmap-month-year'),
    prevMonthHeatmap: document.getElementById('prev-month-heatmap'),
    nextMonthHeatmap: document.getElementById('next-month-heatmap'),

};

// Initialize
function init() {
    // Check and refresh date first
    checkAndRefreshDate();

    // Set up date refresh interval (check every 5 minutes instead of every minute)
    setInterval(checkAndRefreshDate, 300000);

    // Update all date displays
    updateDateDisplays();

    // Load custom categories
    loadCustomCategories();

    // Initialize heatmap date
    currentHeatmapDate = new Date();

    updateUI();
    setupEventListeners();

    // Show welcome message
    if (expenses.length === 0 && income === 0) {
        setTimeout(() => {
            showToast('Welcome! Start by adding some income and expenses.');
        }, 1000);
    }
}

// Event Listeners
function setupEventListeners() {

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to logout?')) {
                // Clear login state
                localStorage.removeItem('moneyflow_loggedin');
                // Redirect to login page
                window.location.href = 'login.html';
            }
        });
    }

    // Savings buttons
    if (elements.resetSavingsBtn) {
        elements.resetSavingsBtn.addEventListener('click', () => {
            if (confirm('Reset all savings data? This cannot be undone.')) {
                resetSavingsData();
            }
        });
    }



    // Goal tracker events
    if (elements.addGoalBtn) {
        elements.addGoalBtn.addEventListener('click', addSavingsGoal);
    }

    // Tab switching
    elements.dailyTab.addEventListener('click', () => switchTab('daily'));
    elements.monthlyTab.addEventListener('click', () => switchTab('monthly'));
    // Add heatmap tab event listener
    elements.heatmapTab.addEventListener('click', () => switchTab('heatmap'));

    // Analytics tabs
    const analyticsTab = document.getElementById('analytics-tab');
    const historyTab = document.getElementById('history-tab');
    const aiTab = document.getElementById('ai-tab');

    if (analyticsTab) analyticsTab.addEventListener('click', () => switchAnalyticsTab('analytics'));
    if (historyTab) historyTab.addEventListener('click', () => switchAnalyticsTab('history'));
    if (aiTab) aiTab.addEventListener('click', () => switchAnalyticsTab('ai'));

    // Debt and Savings tabs
    const debtTab = document.getElementById('debt-tab');
    const savingsTab = document.getElementById('savings-tab');
    const analysisTab = document.getElementById('analysis-tab');

    if (debtTab) debtTab.addEventListener('click', () => switchDebtSavingsTab('debt'));
    if (savingsTab) savingsTab.addEventListener('click', () => switchDebtSavingsTab('savings'));
    if (analysisTab) analysisTab.addEventListener('click', () => switchDebtSavingsTab('analysis'));

    // Notes functionality
    const notesTextarea = document.getElementById('notes-textarea');
    if (notesTextarea) {
        // Load saved notes
        notesTextarea.value = localStorage.getItem('userNotes') || '';

        // Auto-save notes
        notesTextarea.addEventListener('input', () => {
            localStorage.setItem('userNotes', notesTextarea.value);
        });
    }

    // Modal controls - FORCE today's date
    elements.addExpenseBtn.addEventListener('click', () => {
        showModal('expense');
    });

    // Hamburger menu controls
    const menuBtn = document.getElementById('menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const closeMenu = document.getElementById('close-menu');
    const menuOverlay = document.getElementById('menu-overlay');

    if (menuBtn && navMenu && closeMenu && menuOverlay) {
        menuBtn.addEventListener('click', () => {
            navMenu.classList.remove('-translate-x-full');
            menuOverlay.classList.remove('hidden');
        });

        closeMenu.addEventListener('click', () => {
            navMenu.classList.add('-translate-x-full');
            menuOverlay.classList.add('hidden');
        });

        menuOverlay.addEventListener('click', () => {
            navMenu.classList.add('-translate-x-full');
            menuOverlay.classList.add('hidden');
        });
    }
    elements.addIncomeBtn.addEventListener('click', () => showModal('income'));

    // Income type selection
    const onlineIncomeBtn = document.getElementById('online-income-btn');
    const cashIncomeBtn = document.getElementById('cash-income-btn');
    const incomeForm = document.getElementById('income-form');
    const incomeTypeInput = document.getElementById('income-type');

    if (onlineIncomeBtn && cashIncomeBtn && incomeForm && incomeTypeInput) {
        onlineIncomeBtn.addEventListener('click', () => {
            incomeTypeInput.value = 'online';
            incomeForm.classList.remove('hidden');
            onlineIncomeBtn.classList.add('bg-blue-600');
            cashIncomeBtn.classList.remove('bg-green-600');
        });

        cashIncomeBtn.addEventListener('click', () => {
            incomeTypeInput.value = 'cash';
            incomeForm.classList.remove('hidden');
            cashIncomeBtn.classList.add('bg-green-600');
            onlineIncomeBtn.classList.remove('bg-blue-600');
        });
    }
    elements.resetDataBtn.addEventListener('click', resetData);



    // Custom category functionality
    const expenseCategorySelect = document.getElementById('expense-category');
    const customCategoryContainer = document.getElementById('custom-category-container');
    const customCategoryName = document.getElementById('custom-category-name');

    if (expenseCategorySelect && customCategoryContainer) {
        expenseCategorySelect.addEventListener('change', function () {
            if (this.value === 'custom') {
                customCategoryContainer.classList.remove('hidden');
                customCategoryName.focus();
            } else {
                customCategoryContainer.classList.add('hidden');
                customCategoryName.value = '';
            }
        });
    }

    elements.expenseForm.addEventListener('submit', handleExpenseSubmit);
    elements.incomeForm.addEventListener('submit', handleIncomeSubmit);

    // Chart controls
    elements.dailyChartBtn.addEventListener('click', () => switchChart('daily'));
    elements.monthlyChartBtn.addEventListener('click', () => switchChart('monthly'));

    // Debt event listeners
    const addDebtBtn = document.getElementById('add-debt-btn');
    if (addDebtBtn) addDebtBtn.addEventListener('click', handleAddDebt);

    // Savings event listeners
    elements.addSavingsBtn.addEventListener('click', handleAddSavings);
    elements.withdrawSavingsBtn.addEventListener('click', handleWithdrawSavings);

    // AI Analysis refresh button
    const refreshAIButton = document.getElementById('refresh-ai-analysis');
    if (refreshAIButton) {
        refreshAIButton.addEventListener('click', function () {
            generateAIAnalysis();
            showToast('AI analysis refreshed!');
        });
    }

    // Price history chart and PDF download
    if (elements.downloadPdfBtn) {
        elements.downloadPdfBtn.addEventListener('click', downloadHistoryAsPDF);
    }

    // Show more button
    const showMoreBtn = document.getElementById('show-more-btn');
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', toggleShowMore);
    }

    // Close modals on outside click
    document.addEventListener('click', (e) => {
        if (e.target === elements.expenseModal) hideModal('expense');
        if (e.target === elements.incomeModal) hideModal('income');
    });

    // Initialize price history chart
    updatePriceHistoryChart();

    // Heatmap navigation
    if (elements.prevMonthHeatmap) {
        elements.prevMonthHeatmap.addEventListener('click', () => navigateHeatmapMonth(-1));
    }
    if (elements.nextMonthHeatmap) {
        elements.nextMonthHeatmap.addEventListener('click', () => navigateHeatmapMonth(1));
    }

    // Budget limit event listeners
    // if (elements.setMonthlyLimitBtn) {
    //     elements.setMonthlyLimitBtn.addEventListener('click', setMonthlyLimit);
    // }

    // Weekly limit event listener
    // if (elements.setWeeklyLimitBtn) {
    //     elements.setWeeklyLimitBtn.addEventListener('click', setWeeklyLimit);
    // }

    // FAB button in bottom nav
    const fabAddExpense = document.getElementById('fab-add-expense');
    if (fabAddExpense) {
        fabAddExpense.addEventListener('click', () => showModal('expense'));
    }

    // Bottom nav item switching
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    bottomNavItems.forEach(item => {
        item.addEventListener('click', function () {
            bottomNavItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Modal functions
function showModal(type) {
    const modal = type === 'expense' ? elements.expenseModal : elements.incomeModal;

    // FORCE current date when opening expense modal
    if (type === 'expense') {
        setTimeout(() => {
            const expenseDateInput = document.getElementById('expense-date');
            if (expenseDateInput) {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                expenseDateInput.value = `${year}-${month}-${day}`;
            }
        }, 50);
    }

    // Reset income modal when opening
    if (type === 'income') {
        const incomeForm = document.getElementById('income-form');
        const onlineBtn = document.getElementById('online-income-btn');
        const cashBtn = document.getElementById('cash-income-btn');
        if (incomeForm) incomeForm.classList.add('hidden');
        if (onlineBtn) onlineBtn.classList.remove('bg-blue-600');
        if (cashBtn) cashBtn.classList.remove('bg-green-600');
    }

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.querySelector('.transform').classList.remove('scale-95', 'opacity-0');
        modal.querySelector('.transform').classList.add('scale-100', 'opacity-100');
    }, 10);
}

function hideModal(type) {
    try {
        const modal = type === 'expense' ? elements.expenseModal : elements.incomeModal;

        if (!modal) {
            console.error(`Modal not found for type: ${type}`);
            return;
        }

        const transformElement = modal.querySelector('.transform');
        if (!transformElement) {
            console.error(`Transform element not found in ${type} modal`);
            // Fallback: just hide the modal directly
            modal.classList.add('hidden');
            return;
        }

        transformElement.classList.remove('scale-100', 'opacity-100');
        transformElement.classList.add('scale-95', 'opacity-0');

        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    } catch (error) {
        console.error(`Error hiding ${type} modal:`, error);
        // Fallback: just hide the modal directly
        try {
            const modal = type === 'expense' ? elements.expenseModal : elements.incomeModal;
            if (modal) {
                modal.classList.add('hidden');
            }
        } catch (fallbackError) {
            console.error(`Fallback error hiding ${type} modal:`, fallbackError);
        }
    }
}

// Toast notification
function showToast(message, type = 'success') {
    // Toast notification disabled by user request
    console.log('Toast suppressed:', message);
}

// Analytics tab switching
function switchAnalyticsTab(tab) {
    const analyticsTab = document.getElementById('analytics-tab');
    const historyTab = document.getElementById('history-tab');
    const aiTab = document.getElementById('ai-tab');
    const analyticsContent = document.getElementById('analytics-content');
    const historyContent = document.getElementById('history-content');
    const aiContent = document.getElementById('ai-content');

    // Remove active class from all tabs
    [analyticsTab, historyTab, aiTab].forEach(tabEl => {
        if (tabEl) tabEl.classList.remove('active');
    });

    // Hide all content
    [analyticsContent, historyContent, aiContent].forEach(content => {
        if (content) content.classList.add('hidden');
    });

    // Show selected tab and content
    if (tab === 'analytics' && analyticsTab && analyticsContent) {
        analyticsTab.classList.add('active');
        analyticsContent.classList.remove('hidden');
    } else if (tab === 'history' && historyTab && historyContent) {
        historyTab.classList.add('active');
        historyContent.classList.remove('hidden');
    } else if (tab === 'ai' && aiTab && aiContent) {
        aiTab.classList.add('active');
        aiContent.classList.remove('hidden');

    }
}

// Debt and Savings tab switching
function switchDebtSavingsTab(tab) {
    const debtTab = document.getElementById('debt-tab');
    const savingsTab = document.getElementById('savings-tab');
    const analysisTab = document.getElementById('analysis-tab');
    const debtContent = document.getElementById('debt-content');
    const savingsContent = document.getElementById('savings-content');
    const analysisContent = document.getElementById('analysis-content');

    // Reset all tabs
    debtTab.className = 'debt-savings-tab text-sm px-6 py-2 rounded-lg bg-white text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 focus:outline-none';
    savingsTab.className = 'debt-savings-tab text-sm px-6 py-2 rounded-lg bg-white text-purple-600 hover:bg-purple-50 font-medium flex items-center gap-2 focus:outline-none';
    analysisTab.className = 'debt-savings-tab text-sm px-6 py-2 rounded-lg bg-white text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2 focus:outline-none';

    // Hide all content
    debtContent.classList.add('hidden');
    savingsContent.classList.add('hidden');
    analysisContent.classList.add('hidden');

    // Show selected tab
    if (tab === 'debt') {
        debtTab.className = 'debt-savings-tab active text-sm px-6 py-2 rounded-lg bg-red-500 text-white font-medium flex items-center gap-2 focus:outline-none';
        debtContent.classList.remove('hidden');
    } else if (tab === 'savings') {
        savingsTab.className = 'debt-savings-tab active text-sm px-6 py-2 rounded-lg bg-purple-500 text-white font-medium flex items-center gap-2 focus:outline-none';
        savingsContent.classList.remove('hidden');
    } else if (tab === 'analysis') {
        analysisTab.className = 'debt-savings-tab active text-sm px-6 py-2 rounded-lg bg-blue-500 text-white font-medium flex items-center gap-2 focus:outline-none';
        analysisContent.classList.remove('hidden');
    }
}

// Tab switching
function switchTab(tab) {
    if (tab === 'daily') {
        elements.dailyTab.classList.add('active', 'text-purple-600');
        elements.dailyTab.classList.remove('text-gray-600');
        elements.monthlyTab.classList.remove('active', 'text-purple-600');
        elements.monthlyTab.classList.add('text-gray-600');
        // Remove active from heatmap tab
        elements.heatmapTab.classList.remove('active', 'text-purple-600');
        elements.heatmapTab.classList.add('text-gray-600');
        elements.insightsTab.classList.remove('active', 'text-purple-600');
        elements.insightsTab.classList.add('text-gray-600');
        elements.dailyReport.classList.remove('hidden');
        elements.monthlyReport.classList.add('hidden');
        // Hide heatmap report
        elements.heatmapReport.classList.add('hidden');
        elements.insightsReport.classList.add('hidden');
    } else if (tab === 'monthly') {
        elements.monthlyTab.classList.add('active', 'text-purple-600');
        elements.monthlyTab.classList.remove('text-gray-600');
        elements.dailyTab.classList.remove('active', 'text-purple-600');
        elements.dailyTab.classList.add('text-gray-600');
        // Remove active from heatmap tab
        elements.heatmapTab.classList.remove('active', 'text-purple-600');
        elements.heatmapTab.classList.add('text-gray-600');
        elements.insightsTab.classList.remove('active', 'text-purple-600');
        elements.insightsTab.classList.add('text-gray-600');
        elements.monthlyReport.classList.remove('hidden');
        elements.dailyReport.classList.add('hidden');
        // Hide heatmap report
        elements.heatmapReport.classList.add('hidden');
        elements.insightsReport.classList.add('hidden');
    } else if (tab === 'heatmap') {
        elements.heatmapTab.classList.add('active', 'text-purple-600');
        elements.heatmapTab.classList.remove('text-gray-600');
        elements.dailyTab.classList.remove('active', 'text-purple-600');
        elements.dailyTab.classList.add('text-gray-600');
        elements.monthlyTab.classList.remove('active', 'text-purple-600');
        elements.monthlyTab.classList.add('text-gray-600');
        elements.insightsTab.classList.remove('active', 'text-purple-600');
        elements.insightsTab.classList.add('text-gray-600');
        elements.heatmapReport.classList.remove('hidden');
        elements.dailyReport.classList.add('hidden');
        elements.monthlyReport.classList.add('hidden');
        elements.insightsReport.classList.add('hidden');
        // Initialize heatmap if not already done
        if (!heatmapInitialized) {
            initializeHeatmap();
            heatmapInitialized = true;
        }
    } else if (tab === 'insights') {
        elements.insightsTab.classList.add('active', 'text-purple-600');
        elements.insightsTab.classList.remove('text-gray-600');
        elements.dailyTab.classList.remove('active', 'text-purple-600');
        elements.dailyTab.classList.add('text-gray-600');
        elements.monthlyTab.classList.remove('active', 'text-purple-600');
        elements.monthlyTab.classList.add('text-gray-600');
        elements.heatmapTab.classList.remove('active', 'text-purple-600');
        elements.heatmapTab.classList.add('text-gray-600');
        elements.insightsReport.classList.remove('hidden');
        elements.dailyReport.classList.add('hidden');
        elements.monthlyReport.classList.add('hidden');
        elements.heatmapReport.classList.add('hidden');
        // Update insights data
        updateInsightsDashboard();
    }
}

// Form handlers
function handleExpenseSubmit(e) {
    e.preventDefault();

    try {
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const paymentMethod = document.getElementById('expense-payment-method').value || 'online';

        if (amount <= 0) {
            showToast('Please enter a valid amount greater than 0', 'error');
            return;
        }

        // Check if user has sufficient funds for the selected payment method
        const onlineExpenses = expenses.filter(exp => exp.paymentMethod === 'online').reduce((sum, exp) => sum + exp.amount, 0);
        const cashExpenses = expenses.filter(exp => exp.paymentMethod === 'cash').reduce((sum, exp) => sum + exp.amount, 0);

        const onlineBalance = onlineIncome - onlineExpenses;
        const cashBalance = cashIncome - cashExpenses;

        const availableBalance = paymentMethod === 'online' ? onlineBalance : cashBalance;
        const balanceType = paymentMethod === 'online' ? 'Online' : 'Cash';

        if (availableBalance - amount < 0) {
            // Show popup for insufficient funds
            const deficit = Math.abs(availableBalance - amount);
            const message = availableBalance <= 0
                ? `No ${balanceType} money available! You need ₹${amount.toFixed(2)} but have ₹0.00. Please add ${balanceType} income first.`
                : `Insufficient ${balanceType} funds! You need ₹${amount.toFixed(2)} but only have ₹${availableBalance.toFixed(2)}. You're short by ₹${deficit.toFixed(2)}.`;

            if (confirm(`${message}\n\nWould you like to add income first?`)) {
                hideModal('expense');
                showModal('income');
            }
            return;
        }

        // Handle custom category
        let category = document.getElementById('expense-category').value;
        let categoryName = category;

        if (category === 'custom') {
            categoryName = document.getElementById('custom-category-name').value.trim();
            if (!categoryName) {
                showToast('Please enter a custom category name', 'error');
                return;
            }
            // Save custom category to localStorage for future use
            let customCategories = JSON.parse(localStorage.getItem('customCategories')) || [];
            if (!customCategories.includes(categoryName)) {
                customCategories.push(categoryName);
                localStorage.setItem('customCategories', JSON.stringify(customCategories));
            }
        }

        // Use selected date from input or current date as fallback
        const selectedDate = document.getElementById('expense-date').value || getCurrentDateString();

        const expense = {
            date: selectedDate,
            amount: amount,
            category: categoryName,
            note: document.getElementById('expense-note').value,
            paymentMethod: paymentMethod,
            id: Date.now(),
            timestamp: new Date().toISOString()
        };

        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));

        // Hide modal and reset form immediately
        hideModal('expense');
        elements.expenseForm.reset();

        // Reset payment method toggle to default (online)
        selectPaymentMethod('online');

        // FORCE today's date after reset
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        document.getElementById('expense-date').value = `${year}-${month}-${day}`;

        // Reset category selection to Shopping
        resetCategorySelection();

        // Update UI efficiently
        updateUI();

        showToast(`₹${Math.floor(amount)} ${paymentMethod} expense added!`);
    } catch (error) {
        console.error("Error in handleExpenseSubmit:", error);
        showToast('An error occurred while adding the expense', 'error');
    }
}

// Payment method selection for expense form
function selectPaymentMethod(method) {
    const onlineBtn = document.getElementById('expense-payment-online');
    const cashBtn = document.getElementById('expense-payment-cash');
    const paymentMethodInput = document.getElementById('expense-payment-method');

    if (onlineBtn && cashBtn && paymentMethodInput) {
        onlineBtn.classList.remove('active');
        cashBtn.classList.remove('active');

        if (method === 'online') {
            onlineBtn.classList.add('active');
        } else {
            cashBtn.classList.add('active');
        }

        paymentMethodInput.value = method;
    }
}

// Category selection for expense form (icon grid)
function selectCategory(category) {
    const categoryItems = document.querySelectorAll('.category-item');
    const categoryInput = document.getElementById('expense-category');

    categoryItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.category === category) {
            item.classList.add('active');
        }
    });

    if (categoryInput) {
        categoryInput.value = category;
    }
}

// Reset category selection to default
function resetCategorySelection() {
    const categoryItems = document.querySelectorAll('.category-item');
    const categoryInput = document.getElementById('expense-category');

    categoryItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.category === 'Shopping') {
            item.classList.add('active');
        }
    });

    if (categoryInput) {
        categoryInput.value = 'Shopping';
    }
}

function handleIncomeSubmit(e) {
    e.preventDefault();

    try {
        const amount = parseFloat(document.getElementById('income-amount').value);

        if (amount <= 0) {
            showToast('Please enter a valid amount greater than 0', 'error');
            return;
        }

        const source = document.getElementById('income-source').value || 'Unknown Source';
        const incomeType = document.getElementById('income-type').value || 'cash';

        // Update separate income tracking
        if (incomeType === 'online') {
            onlineIncome += amount;
            localStorage.setItem('onlineIncome', onlineIncome.toString());
        } else {
            cashIncome += amount;
            localStorage.setItem('cashIncome', cashIncome.toString());
        }

        // Update total income for backward compatibility
        income = onlineIncome + cashIncome;
        localStorage.setItem('income', income.toString());

        // Add to income history
        let incomeHistory = JSON.parse(localStorage.getItem('incomeHistory')) || [];
        const currentDate = getCurrentDateString();
        incomeHistory.push({
            date: currentDate,
            amount: amount,
            source: source,
            type: incomeType,
            timestamp: new Date().toISOString()
        });

        localStorage.setItem('incomeHistory', JSON.stringify(incomeHistory));

        // Hide modal and reset form immediately
        hideModal('income');
        elements.incomeForm.reset();

        // Reset income type selection
        const onlineBtn = document.getElementById('online-income-btn');
        const cashBtn = document.getElementById('cash-income-btn');
        if (onlineBtn) onlineBtn.classList.remove('bg-blue-600');
        if (cashBtn) cashBtn.classList.remove('bg-green-600');

        // Update UI efficiently
        updateUI();
        updatePriceHistoryChart();

        showToast(`₹${Math.floor(amount)} ${incomeType} income added from ${source}`);
    } catch (error) {
        console.error("Error in handleIncomeSubmit:", error);
        showToast('An error occurred while adding the income', 'error');
    }
}

function resetData() {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        expenses = [];
        income = 0;
        onlineIncome = 0;
        cashIncome = 0;
        localStorage.removeItem('expenses');
        localStorage.removeItem('income');
        localStorage.removeItem('onlineIncome');
        localStorage.removeItem('cashIncome');
        localStorage.removeItem('incomeHistory');
        localStorage.removeItem('savingsHistory');
        updateUI();
        showToast('All data has been reset');
    }
}

// Update UI - optimized version
function updateUI() {
    try {
        updateBalance();
        updateDailyReport();
        updateMonthlyReport();
        updateChart('daily');
        updateDebtUI();
        updateSavingsUI();

        // Only update heavy components when needed
        requestAnimationFrame(() => {
            updatePriceHistoryChart();
            generateAIAnalysis();
            if (heatmapInitialized) {
                renderHeatmap(currentHeatmapDate);
            }
            updateBudgetLimitsUI();
        });
    } catch (error) {
        console.error("Error in updateUI:", error);
    }
}

function updateSavingsUI() {
    if (elements.savingsBalance) {
        elements.savingsBalance.textContent = `₹${Math.floor(savings)}`;
    }

    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
        updateSavingsChart();
        updateAllGoalsProgress();
        loadSavingsGoals();
    });
}

// Function to add test savings data
function addTestSavingsData() {
    // Clear existing savings data
    savings = 0;
    localStorage.removeItem('savingsHistory');

    // Create test savings history for the last 30 days
    const savingsHistory = [];
    const today = new Date();

    // Add various savings transactions over the past month
    for (let i = 30; i >= 0; i -= 3) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Add savings (random amount between 500-2000)
        const addAmount = Math.floor(Math.random() * 1500) + 500;
        savingsHistory.push({
            date: dateStr,
            amount: addAmount,
            type: 'savings-add',
            description: `Added ₹${addAmount.toFixed(2)} to savings`
        });
        savings += addAmount;

        // Occasionally add a withdrawal (30% chance)
        if (Math.random() < 0.3 && savings > 1000) {
            const withdrawAmount = Math.floor(Math.random() * 800) + 200;
            if (withdrawAmount < savings) {
                const withdrawDate = new Date(date);
                withdrawDate.setDate(withdrawDate.getDate() + 1);
                const withdrawDateStr = withdrawDate.toISOString().split('T')[0];

                savingsHistory.push({
                    date: withdrawDateStr,
                    amount: withdrawAmount,
                    type: 'savings-withdraw',
                    description: `Withdrawn ₹${withdrawAmount.toFixed(2)} from savings`
                });
                savings -= withdrawAmount;
            }
        }
    }

    // Save to localStorage
    localStorage.setItem('savings', savings.toString());
    localStorage.setItem('savingsHistory', JSON.stringify(savingsHistory));

    // Update UI
    updateSavingsUI();
    updatePriceHistoryChart();

    // Show success message
    elements.savingsMessage.textContent = 'Test savings data added successfully! Chart is now functional.';
    elements.savingsMessage.className = 'text-green-500 text-center mb-4 text-lg';

    showToast('Test savings data added! Check out the chart below.');

    // Clear message after 5 seconds
    setTimeout(() => {
        elements.savingsMessage.textContent = '';
    }, 5000);
}

// Reset savings data
function resetSavingsData() {
    savings = 0;
    localStorage.removeItem('savings');
    localStorage.removeItem('savingsHistory');
    localStorage.removeItem('savingsGoals');
    localStorage.removeItem('achievements');
    updateSavingsUI();
    showToast('All savings data reset!');
}

// Motivational quotes array
const motivationalQuotes = [
    { quote: "A goal without a plan is just a wish.", author: "Antoine de Saint-Exupéry" },
    { quote: "Save money and money will save you.", author: "Jamaican Proverb" },
    { quote: "It's not how much money you make, but how much you save.", author: "Warren Buffett" },
    { quote: "The habit of saving is itself an education.", author: "T.T. Munger" },
    { quote: "Every rupee saved is a rupee earned.", author: "Benjamin Franklin" },
    { quote: "Small amounts saved daily add up to huge investments over time.", author: "Unknown" },
    { quote: "Financial peace isn't the acquisition of stuff. It's learning to live on less.", author: "Dave Ramsey" },
    { quote: "The real measure of your wealth is how much you'd be worth if you lost all your money.", author: "Anonymous" }
];

// Add savings goal
function addSavingsGoal() {
    const amount = parseFloat(elements.goalAmount.value);
    const description = elements.goalDescription.value.trim();
    const goalDate = document.getElementById('goal-date').value;

    if (isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid goal amount', 'error');
        return;
    }

    if (!description) {
        showToast('Please enter a goal description', 'error');
        return;
    }

    if (!goalDate) {
        showToast('Please select a target date', 'error');
        return;
    }

    const goals = JSON.parse(localStorage.getItem('savingsGoals')) || [];
    const newGoal = {
        id: Date.now(),
        amount,
        description,
        targetDate: goalDate,
        createdDate: new Date().toISOString(),
        completed: false
    };

    goals.push(newGoal);
    localStorage.setItem('savingsGoals', JSON.stringify(goals));

    elements.goalAmount.value = '';
    elements.goalDescription.value = '';
    document.getElementById('goal-date').value = '';

    loadSavingsGoals();
    showToast('Savings goal added successfully!');
}

// Load savings goals
function loadSavingsGoals() {
    const goals = JSON.parse(localStorage.getItem('savingsGoals')) || [];

    if (goals.length === 0) {
        elements.goalsList.innerHTML = '<p class="text-gray-500 text-center py-4">No goals set yet. Add your first savings goal!</p>';
        return;
    }

    // Calculate available savings for each goal (subtract completed goals)
    let usedSavings = 0;

    elements.goalsList.innerHTML = goals.map(goal => {
        // Calculate available savings for this goal
        const availableSavings = Math.max(0, savings - usedSavings);
        const progress = Math.min((availableSavings / goal.amount) * 100, 100);
        const isCompleted = progress >= 100 && !goal.completed;

        // If goal is completed, add its amount to used savings
        if (goal.completed) {
            usedSavings += goal.amount;
        }

        // Calculate remaining days and weekly savings needed
        const today = new Date();
        const targetDate = new Date(goal.targetDate);
        const remainingDays = Math.max(0, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));
        const remainingAmount = Math.max(0, goal.amount - availableSavings);
        const weeksRemaining = Math.max(1, remainingDays / 7);
        const weeklyNeeded = remainingAmount / weeksRemaining;

        let timeInfo = '';
        if (!goal.completed && remainingDays > 0) {
            timeInfo = `
                <div class="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <div class="flex justify-between">
                        <span><i class="fas fa-calendar"></i> ${remainingDays} days left</span>
                        <span><i class="fas fa-piggy-bank"></i> ₹${weeklyNeeded.toFixed(0)}/week needed</span>
                    </div>
                </div>
            `;
        } else if (!goal.completed && remainingDays <= 0) {
            timeInfo = '<div class="mt-2 p-2 bg-red-50 rounded text-sm text-red-600"><i class="fas fa-exclamation-triangle"></i> Target date passed!</div>';
        }

        return `
            <div class="p-4 bg-white rounded-lg border ${goal.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'}">
                <div class="flex justify-between items-center mb-3">
                    <h4 class="font-semibold ${goal.completed ? 'text-green-800' : 'text-gray-800'} flex items-center gap-2">
                        ${goal.completed ? '<i class="fas fa-check-circle text-green-500"></i>' : ''}
                        ${goal.description}
                    </h4>
                    <div class="flex gap-2">
                        <span class="text-sm text-gray-600">₹${goal.amount.toLocaleString()}</span>
                        <button onclick="deleteGoal(${goal.id})" class="text-red-500 hover:text-red-700">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>
                <div class="mb-2">
                    <div class="flex justify-between text-sm mb-1">
                        <span>₹${availableSavings.toLocaleString()} of ₹${goal.amount.toLocaleString()}</span>
                        <span>${progress.toFixed(1)}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div class="h-3 rounded-full transition-all duration-1000 ${goal.completed ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                </div>
                ${timeInfo}
                ${isCompleted ? '<div class="text-green-600 font-semibold text-sm">🎉 Goal Achieved!</div>' : ''}
            </div>
        `;
    }).join('');
}

// Update all goals progress
function updateAllGoalsProgress() {
    const goals = JSON.parse(localStorage.getItem('savingsGoals')) || [];
    let newAchievements = [];

    goals.forEach(goal => {
        const progress = Math.min((savings / goal.amount) * 100, 100);
        if (progress >= 100 && !goal.completed) {
            goal.completed = true;
            goal.completedDate = new Date().toISOString();
            newAchievements.push(goal);
        }
    });

    if (newAchievements.length > 0) {
        localStorage.setItem('savingsGoals', JSON.stringify(goals));
        addAchievements(newAchievements);
        showCelebration(newAchievements);
    }

    loadSavingsGoals();
    loadAchievements();
}

// Add achievements
function addAchievements(newGoals) {
    const achievements = JSON.parse(localStorage.getItem('achievements')) || [];

    newGoals.forEach(goal => {
        achievements.push({
            id: Date.now() + Math.random(),
            type: 'goal_completed',
            title: `Goal Achieved: ${goal.description}`,
            description: `Completed ₹${goal.amount.toLocaleString()} savings goal`,
            date: new Date().toISOString(),
            icon: 'trophy'
        });
    });

    localStorage.setItem('achievements', JSON.stringify(achievements));
}

// Load achievements
function loadAchievements() {
    const achievements = JSON.parse(localStorage.getItem('achievements')) || [];

    if (achievements.length === 0) {
        elements.achievements.classList.add('hidden');
        return;
    }

    elements.achievements.classList.remove('hidden');
    elements.achievementsList.innerHTML = achievements.slice(-3).reverse().map(achievement => `
        <div class="flex items-center gap-3 p-2 bg-yellow-100 rounded-lg">
            <i class="fas fa-${achievement.icon} text-yellow-600"></i>
            <div>
                <div class="font-semibold text-yellow-800">${achievement.title}</div>
                <div class="text-sm text-yellow-700">${achievement.description}</div>
            </div>
        </div>
    `).join('');
}

// Delete goal
function deleteGoal(goalId) {
    if (confirm('Are you sure you want to delete this goal?')) {
        const goals = JSON.parse(localStorage.getItem('savingsGoals')) || [];
        const updatedGoals = goals.filter(goal => goal.id !== goalId);
        localStorage.setItem('savingsGoals', JSON.stringify(updatedGoals));
        loadSavingsGoals();
        showToast('Goal deleted successfully!');
    }
}

// Show celebration animation
function showCelebration(achievements) {
    achievements.forEach((goal, index) => {
        setTimeout(() => {
            showToast(`🎉 Goal Achieved: ${goal.description}! 🎉`);
        }, index * 1000);
    });
}

// Savings Analysis Chart
let savingsChartInstance = null;

function handleAddSavings() {
    const amount = parseFloat(elements.addSavingsAmount.value);
    if (isNaN(amount) || amount <= 0) {
        elements.savingsMessage.textContent = 'Please enter a valid amount.';
        return;
    }

    savings += amount;
    localStorage.setItem('savings', savings.toString());

    const savingsHistory = JSON.parse(localStorage.getItem('savingsHistory')) || [];
    const currentDate = getCurrentDateString();
    savingsHistory.push({
        date: currentDate,
        amount,
        type: 'savings-add'
    });

    localStorage.setItem('savingsHistory', JSON.stringify(savingsHistory));

    updateSavingsUI();
    updatePriceHistoryChart();
    elements.addSavingsAmount.value = '';
    elements.savingsMessage.textContent = '';
    showToast(`₹${amount.toFixed(2)} added to savings!`);
}

function handleWithdrawSavings() {
    const amount = parseFloat(elements.withdrawSavingsAmount.value);
    if (isNaN(amount) || amount <= 0) {
        elements.savingsMessage.textContent = 'Please enter a valid amount.';
        elements.savingsMessage.className = 'text-red-500 text-center mb-4 text-lg';
        return;
    }
    if (amount > savings) {
        const message = savings === 0
            ? `No savings available! You need ₹${amount.toFixed(2)} but have ₹0.00.`
            : `Insufficient savings! You need ₹${amount.toFixed(2)} but only have ₹${savings.toFixed(2)}.`;

        elements.savingsMessage.textContent = message;
        elements.savingsMessage.className = 'text-red-500 text-center mb-4 text-lg';

        // Show popup for insufficient savings
        alert(message + '\n\nPlease add more savings first.');
        return;
    }

    savings -= amount;
    localStorage.setItem('savings', savings.toString());

    const savingsHistory = JSON.parse(localStorage.getItem('savingsHistory')) || [];
    const currentDate = getCurrentDateString();
    savingsHistory.push({
        date: currentDate,
        amount,
        type: 'savings-withdraw'
    });

    localStorage.setItem('savingsHistory', JSON.stringify(savingsHistory));

    updateSavingsUI();
    updatePriceHistoryChart();
    elements.withdrawSavingsAmount.value = '';
    elements.savingsMessage.textContent = '';
    showToast(`₹${amount.toFixed(2)} withdrawn!`);
}

function updateBalance() {
    // Calculate expenses by payment method
    const onlineExpenses = expenses.filter(exp => exp.paymentMethod === 'online').reduce((sum, exp) => sum + exp.amount, 0);
    const cashExpenses = expenses.filter(exp => exp.paymentMethod === 'cash').reduce((sum, exp) => sum + exp.amount, 0);
    // Legacy expenses without paymentMethod - split evenly or assign to online
    const legacyExpenses = expenses.filter(exp => !exp.paymentMethod).reduce((sum, exp) => sum + exp.amount, 0);

    const totalExpenses = onlineExpenses + cashExpenses + legacyExpenses;
    const totalIncome = onlineIncome + cashIncome;
    const balance = totalIncome - totalExpenses;

    // Calculate remaining balances for each payment method
    const onlineRemaining = onlineIncome - onlineExpenses - legacyExpenses;
    const cashRemaining = cashIncome - cashExpenses;

    // Update balance display (can show negative)
    elements.balanceAmount.textContent = `₹${Math.floor(balance)}`;
    elements.balanceAmount.className = `text-xl sm:text-2xl lg:text-3xl font-bold mb-2 ${balance >= 0 ? '' : 'text-red-600'}`;

    // Update separate balance displays (showing REMAINING after expenses)
    const onlineElement = document.getElementById('online-income');
    const cashElement = document.getElementById('cash-income');
    if (onlineElement) onlineElement.textContent = Math.floor(onlineRemaining);
    if (cashElement) cashElement.textContent = Math.floor(cashRemaining);

    // Show warning if balance is low
    if (balance > 0 && balance < 100) {
        elements.balanceAmount.classList.add('low-balance-pulse');
    } else {
        elements.balanceAmount.classList.remove('low-balance-pulse');
    }
}

function updateDailyReport() {
    const today = getCurrentDateString();
    const todayExpenses = expenses.filter(exp => exp.date === today);

    if (todayExpenses.length === 0) {
        elements.dailyExpensesList.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-receipt text-4xl mb-3 opacity-50"></i>
                <p>No expenses recorded today</p>
                <p class="text-sm mt-2">Click the + button to add your first expense!</p>
            </div>
        `;
    } else {
        elements.dailyExpensesList.innerHTML = todayExpenses
            .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))
            .map(exp => {
                const displayTime = exp.timestamp ? new Date(exp.timestamp).toLocaleTimeString() : 'Today';
                return `
                <div class="glass-card p-4 flex justify-between items-center">
                    <div>
                        <div class="font-semibold">${exp.category}</div>
                        <div class="text-sm text-gray-600">${exp.note || 'No description'}</div>
                        <div class="text-xs text-gray-500">${displayTime}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-semibold text-red-600">₹${Math.floor(exp.amount)}</div>

                    </div>
                </div>
            `;
            }).join('');
    }

    const dailyTotal = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    elements.dailyTotal.textContent = `₹${Math.floor(dailyTotal)}`;
}

function updateSavingsChart() {
    const savingsHistory = JSON.parse(localStorage.getItem('savingsHistory')) || [];
    const chartEmpty = document.getElementById('savings-chart-empty');

    if (savingsHistory.length === 0) {
        if (chartEmpty) chartEmpty.classList.remove('hidden');
        if (savingsChartInstance) {
            savingsChartInstance.destroy();
            savingsChartInstance = null;
        }
        return;
    }

    if (chartEmpty) chartEmpty.classList.add('hidden');

    if (savingsChartInstance) {
        savingsChartInstance.destroy();
    }

    const labels = [];
    const data = [];
    let balance = 0;

    savingsHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

    savingsHistory.forEach(item => {
        labels.push(new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        balance += item.type === 'savings-add' ? item.amount : -item.amount;
        data.push(Math.max(0, balance));
    });

    if (!elements.savingsChart) return;

    savingsChartInstance = new Chart(elements.savingsChart, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: '💰 Savings Growth',
                data,
                borderColor: 'rgba(168, 85, 247, 1)',
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                fill: true,
                tension: 0.2,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
                pointBackgroundColor: '#FFFFFF',
                pointBorderColor: 'rgba(168, 85, 247, 1)',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 300 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `Balance: ₹${context.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: (value) => `₹${value}` }
                }
            }
        }
    });
}

// Function to add test expenses for heatmap demo
function addTestExpenses() {
    // Clear existing expenses
    expenses = [];

    // Add sample expenses for the current month
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    // Add expenses for various days with different amounts
    for (let i = 1; i <= 28; i++) {
        const day = String(i).padStart(2, '0');
        const date = year + '-' + month + '-' + day;

        // Add 1-3 expenses per day with random amounts
        const numExpenses = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numExpenses; j++) {
            const amount = Math.floor(Math.random() * 500) + 50; // Random amount between 50-550
            const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Other'];
            const category = categories[Math.floor(Math.random() * categories.length)];

            expenses.push({
                date: date,
                amount: amount,
                category: category,
                note: 'Test expense ' + (j + 1),
                id: Date.now() + i * 100 + j,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Save to localStorage
    localStorage.setItem('expenses', JSON.stringify(expenses));

    // Update UI
    updateUI();

    showToast('Test expenses added successfully!');
}



// Modify the updateMonthlyReport function to include the Wants vs Needs chart
function updateMonthlyReport() {
    const currentMonth = getCurrentDateString().slice(0, 7);
    const monthlyExpenses = expenses.filter(exp => exp.date.startsWith(currentMonth));

    const categoryTotals = {};
    monthlyExpenses.forEach(exp => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    if (Object.keys(categoryTotals).length === 0) {
        document.getElementById('monthly-categories').innerHTML = '<div class="col-span-2 text-center py-8 text-gray-500">' +
            '<i class="fas fa-calendar-times text-4xl mb-3 opacity-50"></i>' +
            '<p>No expenses this month yet</p>' +
            '</div>';
    } else {
        document.getElementById('monthly-categories').innerHTML = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .map(([category, total]) => {
                const percentage = (total / monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0)) * 100;
                return '<div class="glass-card p-4">' +
                    '<div class="flex justify-between items-center mb-3">' +
                    '<span class="category-badge category-' + category + '">' +
                    '<i class="fas ' + getCategoryIcon(category) + '"></i>' +
                    category +
                    '</span>' +
                    '<span class="text-red-600 font-semibold">₹' + Math.floor(total) + '</span>' +
                    '</div>' +
                    '<div class="w-full bg-gray-200 rounded-full h-3">' +
                    '<div class="progress-bar h-3 rounded-full category-' + category + '" style="width: ' + percentage + '%"></div>' +
                    '</div>' +
                    '<div class="text-xs text-gray-600 mt-2 text-right">' + percentage.toFixed(1) + '% of total</div>' +
                    '</div>';
            }).join('');
    }

    const monthlyTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    elements.monthlyTotal.textContent = '₹' + Math.floor(monthlyTotal);


}


// Stub functions for missing functionality
function updateBudgetLimitsUI() {
    // Placeholder for budget limits functionality
}



// Chart functions
function switchChart(type) {
    updateChart(type);
    if (type === 'daily') {
        elements.dailyChartBtn.classList.remove('bg-gray-200', 'text-gray-700');
        elements.dailyChartBtn.classList.add('bg-purple-600', 'text-white');
        elements.monthlyChartBtn.classList.remove('bg-purple-600', 'text-white');
        elements.monthlyChartBtn.classList.add('bg-gray-200', 'text-gray-700');
    } else {
        elements.monthlyChartBtn.classList.remove('bg-gray-200', 'text-gray-700');
        elements.monthlyChartBtn.classList.add('bg-purple-600', 'text-white');
        elements.dailyChartBtn.classList.remove('bg-purple-600', 'text-white');
        elements.dailyChartBtn.classList.add('bg-gray-200', 'text-gray-700');
    }
}

function updateChart(type) {
    let chartData;

    if (type === 'daily') {
        const today = getCurrentDateString();
        const todayExpenses = expenses.filter(exp => exp.date === today);
        chartData = aggregateDataByCategory(todayExpenses);
    } else {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyExpenses = expenses.filter(exp => exp.date.startsWith(currentMonth));
        chartData = aggregateDataByCategory(monthlyExpenses);
    }

    // Show/hide empty state
    if (chartData.categories.length === 0) {
        elements.chartEmpty.classList.remove('hidden');
        if (chart) {
            chart.destroy();
            chart = null;
        }
        return;
    }
    elements.chartEmpty.classList.add('hidden');

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(elements.expenseChart, {
        type: 'doughnut',
        data: {
            labels: chartData.categories,
            datasets: [{
                data: chartData.amounts,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#C9CBCF', '#FF6384'
                ],
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: { size: 12, family: 'Inter' },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ₹' + context.parsed.toFixed(2) + ' (' + percentage + '%)';
                        }
                    }
                }
            },
            animation: {
                duration: 300
            }
        }
    });
}

function aggregateDataByCategory(expenses) {
    const categories = {};
    expenses.forEach(exp => {
        categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });

    return {
        categories: Object.keys(categories),
        amounts: Object.values(categories)
    };
}

// Helper functions
function getCategoryIcon(category) {
    const icons = {
        'Food': 'fa-utensils',
        'Travel': 'fa-plane',
        'Shopping': 'fa-shopping-bag',
        'Bills': 'fa-file-invoice-dollar',
        'Entertainment': 'fa-film',
        'Healthcare': 'fa-heartbeat',
        'Other': 'fa-cube'
    };
    return icons[category] || 'fa-tag';
}

// Function to load custom categories into the dropdown
function loadCustomCategories() {
    const customCategories = JSON.parse(localStorage.getItem('customCategories')) || [];
    const categorySelect = document.getElementById('expense-category');

    // Clear existing custom options (except the "Add Custom Category" option)
    const customOptions = categorySelect.querySelectorAll('option[data-custom]');
    customOptions.forEach(option => option.remove());

    // Add custom categories to the dropdown
    customCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = '🏷️ ' + category;
        option.setAttribute('data-custom', 'true');
        categorySelect.insertBefore(option, categorySelect.querySelector('option[value="custom"]'));
    });
}

// Initialize the app
function init() {
    try {
        // Set Chart.js defaults for dark theme
        if (typeof Chart !== 'undefined') {
            Chart.defaults.color = '#ffffff';
            Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
        }

        const today = new Date();

        if (elements.todayDate) {
            elements.todayDate.textContent = today.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        if (elements.currentMonth) {
            elements.currentMonth.textContent = today.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
        }

        const expenseDateInput = document.getElementById('expense-date');
        if (expenseDateInput) {
            expenseDateInput.value = today.toISOString().split('T')[0];
        }

        loadCustomCategories();
        setupEventListeners();

        // Add listener for PDF download button
        const downloadPdfBtn = document.getElementById('download-pdf-btn');
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', downloadHistoryAsPDF);
        }
        updateUI();

        if (expenses.length === 0 && income === 0) {
            setTimeout(() => {
                showToast('Welcome! Start by adding some income and expenses.');
            }, 1000);
        }
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Price History Chart
let priceHistoryChartInstance = null;

// Function to update the price history chart - optimized
function updatePriceHistoryChart() {
    const transactions = getAllTransactions();

    // Show/hide empty state
    if (transactions.length === 0) {
        if (elements.historyChartEmpty) {
            elements.historyChartEmpty.classList.remove('hidden');
        }
        if (priceHistoryChartInstance) {
            priceHistoryChartInstance.destroy();
            priceHistoryChartInstance = null;
        }
        return;
    }

    if (elements.historyChartEmpty) {
        elements.historyChartEmpty.classList.add('hidden');
    }

    // Sort transactions by date (oldest first)
    transactions.sort((a, b) => new Date(a.date || getCurrentDateString()) - new Date(b.date || getCurrentDateString()));

    // Group transactions by date and sum amounts
    const groupedData = {};
    transactions.forEach(item => {
        const date = item.date || getCurrentDateString();
        if (!groupedData[date]) {
            groupedData[date] = { income: 0, expense: 0, savings: 0 };
        }

        if (item.type === 'income') {
            groupedData[date].income += item.amount;
        } else if (item.type === 'expense') {
            groupedData[date].expense += item.amount;
        } else if (item.type === 'savings-add') {
            groupedData[date].savings += item.amount;
        } else if (item.type === 'savings-withdraw') {
            groupedData[date].savings -= item.amount;
        }
    });

    // Convert to arrays for chart
    const sortedDates = Object.keys(groupedData).sort();
    const labels = sortedDates.map(date => formatDate(date));
    const incomeData = sortedDates.map(date => groupedData[date].income);
    const expenseData = sortedDates.map(date => groupedData[date].expense);
    const savingsData = sortedDates.map(date => groupedData[date].savings);

    // Destroy previous chart
    if (priceHistoryChartInstance) {
        priceHistoryChartInstance.destroy();
    }

    // Ensure canvas exists
    if (!elements.priceHistoryChart) {
        return;
    }

    // Create new chart with reduced animation
    priceHistoryChartInstance = new Chart(elements.priceHistoryChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.2,
                    pointRadius: 3,
                    pointBackgroundColor: '#10B981',
                    pointBorderColor: '#ffffff',
                    pointHoverRadius: 6,
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.2,
                    pointRadius: 3,
                    pointBackgroundColor: '#EF4444',
                    pointBorderColor: '#ffffff',
                    pointHoverRadius: 6,
                },
                {
                    label: 'Savings',
                    data: savingsData,
                    borderColor: '#7C3AED',
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    fill: true,
                    tension: 0.2,
                    pointRadius: 3,
                    pointBackgroundColor: '#7C3AED',
                    pointBorderColor: '#ffffff',
                    pointHoverRadius: 6,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 300
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#ffffff',
                        font: { size: 12, family: 'Inter' },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': ₹' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: { display: true, text: 'Date', color: '#9ca3af' },
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    display: true,
                    title: { display: true, text: 'Amount (₹)', color: '#9ca3af' },
                    beginAtZero: true,
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });

    // Update history table
    updateHistoryTable(transactions);
}

// Function to get all transactions
function getAllTransactions() {
    const transactions = [];

    // Add expense transactions
    expenses.forEach(expense => {
        if (expense.date && expense.amount) {
            transactions.push({
                date: expense.date,
                amount: expense.amount,
                type: 'expense',
                description: (expense.category || 'Other') + ': ' + (expense.note || 'No description')
            });
        }
    });

    // Add income transactions
    const incomeHistory = JSON.parse(localStorage.getItem('incomeHistory')) || [];
    incomeHistory.forEach(income => {
        if (income.date && income.amount) {
            transactions.push({
                date: income.date,
                amount: income.amount,
                type: 'income',
                description: income.source || 'Income'
            });
        }
    });

    // Add savings transactions
    const savingsHistory = JSON.parse(localStorage.getItem('savingsHistory')) || [];
    savingsHistory.forEach(entry => {
        if (entry.date && entry.amount) {
            transactions.push({
                date: entry.date,
                amount: entry.amount,
                type: entry.type || 'savings-add',
                description: entry.description || 'Savings transaction'
            });
        }
    });

    return transactions;
}

let currentDisplayCount = 5;
let allTransactions = [];

// Function to update history table
function updateHistoryTable(transactions) {
    allTransactions = transactions;
    currentDisplayCount = 5;

    if (transactions.length === 0) {
        elements.historyTable.classList.add('hidden');
        document.getElementById('show-more-btn').classList.add('hidden');
        return;
    }

    elements.historyTable.classList.remove('hidden');

    // Sort transactions by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderHistoryTable();
}

function renderHistoryTable() {
    const displayTransactions = allTransactions.slice(0, currentDisplayCount);
    const showMoreBtn = document.getElementById('show-more-btn');

    // Generate table rows with proper date handling
    const tableRows = displayTransactions.map((transaction, index) => {
        const typeClass = getTypeClass(transaction.type);
        const typeText = getTypeText(transaction.type);
        const amountClass = getAmountClass(transaction.type);
        const amountText = getAmountText(transaction.type, transaction.amount);
        const displayDate = transaction.date || getCurrentDateString();

        return '<tr class="border-b border-gray-200 hover:bg-gray-50">' +
            '<td class="py-3 px-4">' + formatDate(displayDate) + '</td>' +
            '<td class="py-3 px-4"><span class="px-2 py-1 rounded-full text-xs font-semibold ' + typeClass + '">' + typeText + '</span></td>' +
            '<td class="py-3 px-4">' + (transaction.description || 'No description') + '</td>' +
            '<td class="py-3 px-4 text-right font-medium ' + amountClass + '">' + amountText + '</td>' +
            '<td class="py-3 px-4 text-center"><button onclick="deleteTransaction(' + index + ', \'' + transaction.type + '\', \'' + transaction.date + '\', ' + transaction.amount + ')" class="text-red-500 hover:text-red-700 text-lg"><i class="fas fa-times"></i></button></td>' +
            '</tr>';
    }).join('');

    elements.historyTableBody.innerHTML = tableRows;

    // Show/hide and update button
    if (allTransactions.length > currentDisplayCount) {
        showMoreBtn.classList.remove('hidden');
        showMoreBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Show More (' + (allTransactions.length - currentDisplayCount) + ' more)';
    } else if (currentDisplayCount > 5 && allTransactions.length <= currentDisplayCount) {
        showMoreBtn.classList.remove('hidden');
        showMoreBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Show Less';
    } else {
        showMoreBtn.classList.add('hidden');
    }
}

function toggleShowMore() {
    if (currentDisplayCount >= allTransactions.length) {
        currentDisplayCount = 5;
    } else {
        currentDisplayCount += 5;
    }
    renderHistoryTable();
}

// Helper functions for table formatting
function getTypeClass(type) {
    switch (type) {
        case 'income': return 'bg-green-100 text-green-800';
        case 'expense': return 'bg-red-100 text-red-800';
        case 'savings-add': return 'bg-purple-100 text-purple-800';
        case 'savings-withdraw': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getTypeText(type) {
    switch (type) {
        case 'income': return 'Income';
        case 'expense': return 'Expense';
        case 'savings-add': return 'Savings Add';
        case 'savings-withdraw': return 'Savings Withdraw';
        default: return type;
    }
}

function getAmountClass(type) {
    switch (type) {
        case 'income': return 'text-green-600';
        case 'expense': return 'text-red-600';
        case 'savings-add': return 'text-purple-600';
        case 'savings-withdraw': return 'text-yellow-600';
        default: return 'text-gray-600';
    }
}

function getAmountText(type, amount) {
    switch (type) {
        case 'income': return '+₹' + amount.toFixed(2);
        case 'expense': return '-₹' + amount.toFixed(2);
        case 'savings-add': return '+₹' + amount.toFixed(2);
        case 'savings-withdraw': return '-₹' + amount.toFixed(2);
        default: return '₹' + amount.toFixed(2);
    }
}

// Function to format date for display
function formatDate(dateString) {
    // Handle invalid or missing dates
    if (!dateString) return getCurrentDateString();

    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return getCurrentDateString();
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Function to format date to ISO format
function formatDateToISO(dateString) {
    // Handle invalid or missing dates
    if (!dateString) return getCurrentDateString();

    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return getCurrentDateString();
    }

    return date.toISOString().split('T')[0];
}

// Function to download history as PDF
function downloadHistoryAsPDF() {
    // Check if jsPDF is available
    if (typeof window.jspdf === 'undefined') {
        showToast('PDF library not loaded. Please try again.', 'error');
        return;
    }

    const { jsPDF } = window.jspdf;

    // Get all transactions
    const transactions = getAllTransactions();

    // Sort transactions by date
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Create PDF document
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text('MoneyFlow - Transaction History', 105, 20, null, null, 'center');

    // Add generation date
    doc.setFontSize(12);
    doc.text('Generated on: ' + new Date().toLocaleDateString(), 105, 30, null, null, 'center');

    // Prepare table data
    const tableData = transactions.map(transaction => [
        formatDate(transaction.date),
        getTypeText(transaction.type),
        transaction.description,
        getAmountText(transaction.type, transaction.amount)
    ]);

    // Add table
    doc.autoTable({
        head: [['Date', 'Type', 'Description', 'Amount']],
        body: tableData,
        startY: 40,
        styles: {
            fontSize: 10
        },
        headStyles: {
            fillColor: [255, 106, 136],
            textColor: 255
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        }
    });

    // Add summary
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalSavingsAdded = transactions
        .filter(t => t.type === 'savings-add')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalSavingsWithdrawn = transactions
        .filter(t => t.type === 'savings-withdraw')
        .reduce((sum, t) => sum + t.amount, 0);

    const finalY = doc.lastAutoTable.finalY || 40;

    doc.setFontSize(12);
    doc.text('Summary:', 14, finalY + 10);
    doc.setFontSize(10);
    doc.text('Total Income: ₹' + totalIncome.toFixed(2), 14, finalY + 20);
    doc.text('Total Expenses: ₹' + totalExpenses.toFixed(2), 14, finalY + 30);
    doc.text('Total Savings Added: ₹' + totalSavingsAdded.toFixed(2), 14, finalY + 40);
    doc.text('Total Savings Withdrawn: ₹' + totalSavingsWithdrawn.toFixed(2), 14, finalY + 50);

    // Save the PDF
    if (typeof doc.output === 'function') {
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'moneyflow-history.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    } else {
        doc.save('moneyflow-history.pdf');
    }

    showToast('PDF downloaded successfully!');
}

// Delete transaction function
function deleteTransaction(index, type, date, amount) {
    if (confirm('Delete this transaction?')) {
        if (type === 'expense') {
            const expenseIndex = expenses.findIndex(exp => exp.date === date && exp.amount === amount);
            if (expenseIndex > -1) {
                expenses.splice(expenseIndex, 1);
                localStorage.setItem('expenses', JSON.stringify(expenses));
            }
        } else if (type === 'income') {
            let incomeHistory = JSON.parse(localStorage.getItem('incomeHistory')) || [];
            const incomeIndex = incomeHistory.findIndex(inc => inc.date === date && inc.amount === amount);
            if (incomeIndex > -1) {
                const deletedIncome = incomeHistory[incomeIndex];
                incomeHistory.splice(incomeIndex, 1);
                localStorage.setItem('incomeHistory', JSON.stringify(incomeHistory));

                // Update the correct income type
                if (deletedIncome.type === 'online') {
                    onlineIncome -= amount;
                    localStorage.setItem('onlineIncome', onlineIncome.toString());
                } else {
                    cashIncome -= amount;
                    localStorage.setItem('cashIncome', cashIncome.toString());
                }

                // Update total income
                income = onlineIncome + cashIncome;
                localStorage.setItem('income', income.toString());
            }
        } else if (type === 'savings-add' || type === 'savings-withdraw') {
            let savingsHistory = JSON.parse(localStorage.getItem('savingsHistory')) || [];
            const savingsIndex = savingsHistory.findIndex(sav => sav.date === date && sav.amount === amount && sav.type === type);
            if (savingsIndex > -1) {
                savingsHistory.splice(savingsIndex, 1);
                localStorage.setItem('savingsHistory', JSON.stringify(savingsHistory));
                if (type === 'savings-add') {
                    savings -= amount;
                } else {
                    savings += amount;
                }
                localStorage.setItem('savings', savings.toString());
            }
        }

        updateUI();
        showToast('Transaction deleted successfully!');
    }
}

// Navigation function
function navigateToSection(section) {
    // Close menu immediately
    const navMenu = document.getElementById('nav-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    if (navMenu && menuOverlay) {
        navMenu.classList.add('-translate-x-full');
        menuOverlay.classList.add('hidden');
    }

    // Use setTimeout to ensure DOM updates before navigation
    setTimeout(() => {
        switch (section) {
            case 'balance':
                document.querySelector('.glass-card').scrollIntoView({ behavior: 'smooth' });
                break;
            case 'expenses':
                showModal('expense');
                break;
            case 'debt':
                switchDebtSavingsTab('debt');
                setTimeout(() => document.getElementById('debt-savings-section').scrollIntoView({ behavior: 'smooth' }), 50);
                break;
            case 'savings':
                switchDebtSavingsTab('savings');
                setTimeout(() => document.getElementById('debt-savings-section').scrollIntoView({ behavior: 'smooth' }), 50);
                break;
            case 'analytics':
                switchAnalyticsTab('analytics');
                setTimeout(() => {
                    const section = document.querySelector('.glass-card:nth-of-type(3)');
                    if (section) section.scrollIntoView({ behavior: 'smooth' });
                }, 50);
                break;
            case 'history':
                switchAnalyticsTab('history');
                setTimeout(() => {
                    const section = document.querySelector('.glass-card:nth-of-type(3)');
                    if (section) section.scrollIntoView({ behavior: 'smooth' });
                }, 50);
                break;
            case 'heatmap':
                switchTab('heatmap');
                setTimeout(() => {
                    const section = document.querySelector('.glass-card:nth-of-type(2)');
                    if (section) section.scrollIntoView({ behavior: 'smooth' });
                }, 50);
                break;
            case 'ai':
                switchAnalyticsTab('ai');
                setTimeout(() => {
                    const section = document.querySelector('.glass-card:nth-of-type(3)');
                    if (section) section.scrollIntoView({ behavior: 'smooth' });
                }, 50);
                break;
        }
    }, 100);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);

// AI Expense Analysis Functions
function generateAIAnalysis() {
    const currentMonth = getCurrentDateString().slice(0, 7);
    const currentMonthExpenses = expenses.filter(exp => exp.date.startsWith(currentMonth));

    const aiAnalysisContent = document.getElementById('ai-analysis-content');



    if (currentMonthExpenses.length === 0) {
        aiAnalysisContent.innerHTML = '<div class="absolute inset-0 flex items-center justify-center">' +
            '<div class="text-center text-gray-500">' +
            '<i class="fas fa-brain text-4xl mb-3 opacity-50"></i>' +
            '<p>No expenses recorded this month yet</p>' +
            '<p class="text-sm mt-2">Add some expenses to get AI analysis</p>' +
            '</div>' +
            '</div>';
        return;
    }

    // Get previous month data
    const prevMonth = new Date();
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthStr = prevMonth.toISOString().slice(0, 7);
    const prevMonthExpenses = expenses.filter(exp => exp.date.startsWith(prevMonthStr));

    // Calculate totals
    const currentTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const prevTotal = prevMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate category totals for current month
    const categoryTotals = {};
    currentMonthExpenses.forEach(exp => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    // Find highest spending category
    let highestCategory = '';
    let highestAmount = 0;
    for (const [category, amount] of Object.entries(categoryTotals)) {
        if (amount > highestAmount) {
            highestAmount = amount;
            highestCategory = category;
        }
    }

    // Generate insights
    const insights = generateFinancialInsights(currentTotal, prevTotal, categoryTotals, prevMonthStr);

    // Generate recommendations
    const recommendations = generateRecommendations(categoryTotals, currentTotal);

    // Display analysis
    const monthlyComparisonClass = currentTotal > prevTotal ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200';
    const monthlyComparisonTextClass = currentTotal > prevTotal ? 'text-red-600' : 'text-green-600';
    const percentageChange = prevTotal > 0 ? Math.abs(((currentTotal - prevTotal) / prevTotal * 100)).toFixed(1) : '0';
    const moreOrLess = currentTotal > prevTotal ? 'more' : 'less';

    let topCategoryHtml = '';
    if (highestCategory) {
        const widthPercent = currentTotal > 0 ? (highestAmount / currentTotal * 100) : 100;
        topCategoryHtml = '<div class="p-3 rounded-lg bg-blue-50 border border-blue-200">' +
            '<div class="font-semibold mb-2">Top Spending Category:</div>' +
            '<div class="flex justify-between">' +
            '<span>' + highestCategory + '</span>' +
            '<span class="font-bold">₹' + highestAmount.toFixed(2) + '</span>' +
            '</div>' +
            '<div class="w-full bg-gray-200 rounded-full h-2 mt-2">' +
            '<div class="h-2 rounded-full bg-blue-500" style="width: ' + widthPercent + '%"></div>' +
            '</div>' +
            '</div>';
    }

    const insightsHtml = insights.map(insight => '<li>' + insight + '</li>').join('');
    const recommendationsHtml = recommendations.map(rec => '<li>' + rec + '</li>').join('');

    aiAnalysisContent.innerHTML = '<div class="space-y-4 h-full overflow-y-auto pr-2" style="max-height: 300px;">' +
        '<div class="p-3 rounded-lg ' + monthlyComparisonClass + '">' +
        '<div class="flex justify-between items-center">' +
        '<span class="font-semibold">Monthly Comparison:</span>' +
        '<span class="font-bold ' + monthlyComparisonTextClass + '">' +
        percentageChange + '% ' + moreOrLess + ' than last month' +
        '</span>' +
        '</div>' +
        '<div class="text-sm mt-1">' +
        'This month: ₹' + currentTotal.toFixed(2) + ' | Last month: ₹' + prevTotal.toFixed(2) +
        '</div>' +
        '</div>' +
        topCategoryHtml +
        '<div class="p-3 rounded-lg bg-purple-50 border border-purple-200">' +
        '<div class="font-semibold mb-2">AI Insights:</div>' +
        '<ul class="list-disc pl-5 space-y-1 text-sm">' +
        insightsHtml +
        '</ul>' +
        '</div>' +
        '<div class="p-3 rounded-lg bg-yellow-50 border border-yellow-200">' +
        '<div class="font-semibold mb-2">Recommendations:</div>' +
        '<ul class="list-disc pl-5 space-y-1 text-sm">' +
        recommendationsHtml +
        '</ul>' +
        '</div>' +
        '</div>';
}

function generateFinancialInsights(currentTotal, prevTotal, categoryTotals, prevMonthStr) {
    const insights = [];

    // Overall spending comparison
    if (prevTotal > 0) {
        const changePercent = ((currentTotal - prevTotal) / prevTotal * 100);
        if (changePercent > 10) {
            insights.push('You\'re spending ' + changePercent.toFixed(1) + '% more this month compared to ' + prevMonthStr + '. Consider reviewing your expenses.');
        } else if (changePercent < -10) {
            insights.push('Great job! You\'re spending ' + Math.abs(changePercent).toFixed(1) + '% less this month compared to ' + prevMonthStr + '.');
        } else {
            insights.push('Your spending is relatively stable compared to last month.');
        }
    } else {
        insights.push('This is your first month of tracking expenses. Great start!');
    }

    // Category insights
    for (const [category, amount] of Object.entries(categoryTotals)) {
        const percentage = (amount / currentTotal) * 100;
        if (amount > currentTotal * 0.3) {
            insights.push('Your ' + category + ' expenses (' + percentage.toFixed(1) + '% of total) seem high. Consider setting a budget.');
        }
    }

    // Spending patterns
    const dailyAvg = currentTotal / new Date().getDate();
    insights.push('Your daily average spending is ₹' + dailyAvg.toFixed(2) + '.');

    return insights;
}

function generateRecommendations(categoryTotals, total) {
    const recommendations = [];

    // Generic recommendations
    recommendations.push("Set monthly budgets for each category to avoid overspending");
    recommendations.push("Review subscriptions and cancel unused services");
    recommendations.push("Consider cooking at home more often to reduce food expenses");

    // Category-specific recommendations
    for (const [category, amount] of Object.entries(categoryTotals)) {
        const percentage = (amount / total) * 100;

        if (category === 'Food' && percentage > 25) {
            recommendations.push("Try meal planning to reduce food costs by up to 20%");
        } else if (category === 'Shopping' && percentage > 20) {
            recommendations.push("Create a shopping list to avoid impulse purchases");
        } else if (category === 'Entertainment' && percentage > 15) {
            recommendations.push("Look for free or low-cost entertainment options");
        } else if (category === 'Travel' && percentage > 15) {
            recommendations.push("Consider carpooling or public transport to reduce travel costs");
        } else if (percentage > 30) {
            recommendations.push('Consider setting a budget for ' + category + ' as it\'s a large portion of your spending');
        }
    }

    // General financial health recommendations
    recommendations.push("Aim to save at least 20% of your income if possible");
    recommendations.push("Build an emergency fund covering 3-6 months of expenses");

    return recommendations;
}

// Heatmap functionality
let heatmapInitialized = false;
let currentHeatmapDate = new Date();

// Function to refresh heatmap date
function refreshHeatmapDate() {
    currentHeatmapDate = new Date();
    if (heatmapInitialized) {
        renderHeatmap(currentHeatmapDate);
    }
}

function initializeHeatmap() {
    renderHeatmap(currentHeatmapDate);
}

function navigateHeatmapMonth(direction) {
    currentHeatmapDate.setMonth(currentHeatmapDate.getMonth() + direction);
    renderHeatmap(currentHeatmapDate);
}

function renderHeatmap(date) {
    if (!elements.heatmapDays || !elements.heatmapMonthYear) return;

    const renderDate = date || new Date();
    const year = renderDate.getFullYear();
    const month = renderDate.getMonth();

    // Update the month/year display
    elements.heatmapMonthYear.textContent = renderDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    // Get expenses grouped by date
    const expensesByDate = {};
    let maxExpense = 0;

    expenses.forEach(expense => {
        if (expense.date) {
            expensesByDate[expense.date] = (expensesByDate[expense.date] || 0) + expense.amount;
            if (expensesByDate[expense.date] > maxExpense) {
                maxExpense = expensesByDate[expense.date];
            }
        }
    });

    // Get calendar bounds
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = new Date(firstDay);
    firstDayOfWeek.setDate(firstDay.getDate() - firstDay.getDay());
    const lastDayOfWeek = new Date(lastDay);
    lastDayOfWeek.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    const todayStr = getCurrentDateString();
    const fragment = document.createDocumentFragment();

    // Create days efficiently
    const currentDate = new Date(firstDayOfWeek);
    while (currentDate <= lastDayOfWeek) {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        const isCurrentMonth = currentDate.getMonth() === month;
        const isToday = dateStr === todayStr;

        const dayElement = document.createElement('div');
        dayElement.className = 'heatmap-day';
        dayElement.textContent = currentDate.getDate();

        if (!isCurrentMonth) dayElement.classList.add('other-month');
        if (isToday) dayElement.classList.add('today');

        if (expensesByDate[dateStr]) {
            dayElement.classList.add('has-expense');
            const expenseAmount = expensesByDate[dateStr];

            // Calculate intensity level
            let intensity = 1;
            if (maxExpense > 0) {
                const percentage = (expenseAmount / maxExpense) * 100;
                if (percentage <= 20) intensity = 1;
                else if (percentage <= 40) intensity = 2;
                else if (percentage <= 60) intensity = 3;
                else if (percentage <= 80) intensity = 4;
                else if (percentage <= 95) intensity = 5;
                else intensity = 6;
            }

            dayElement.classList.add('level-' + intensity);
            dayElement.title = '₹' + expenseAmount.toFixed(2);
        } else {
            dayElement.classList.add('empty');
        }

        fragment.appendChild(dayElement);
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    // Update DOM once
    elements.heatmapDays.innerHTML = '';
    elements.heatmapDays.appendChild(fragment);
}

// Function to add test expenses for heatmap demo
function addTestExpenses() {
    // Clear existing expenses
    expenses = [];

    // Add sample expenses for the current month
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    // Add expenses for various days with different amounts
    for (let i = 1; i <= 28; i++) {
        const day = String(i).padStart(2, '0');
        const date = year + '-' + month + '-' + day;

        // Add 1-3 expenses per day with random amounts
        const numExpenses = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numExpenses; j++) {
            const amount = Math.floor(Math.random() * 500) + 50; // Random amount between 50-550
            const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Other'];
            const category = categories[Math.floor(Math.random() * categories.length)];

            expenses.push({
                date: date,
                amount: amount,
                category: category,
                note: 'Test expense ' + (j + 1),
                id: Date.now() + i * 100 + j,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Save to localStorage
    localStorage.setItem('expenses', JSON.stringify(expenses));

    // Update UI
    updateUI();

    showToast('Test expenses added successfully!');
}

// Debt Management Functions
function handleAddDebt() {
    const amount = parseFloat(document.getElementById('debt-amount').value);
    const description = document.getElementById('debt-description').value.trim();
    const dueDate = document.getElementById('debt-due-date').value;

    if (isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid debt amount', 'error');
        return;
    }

    if (!description) {
        showToast('Please enter a debt description', 'error');
        return;
    }

    if (!dueDate) {
        showToast('Please select a due date', 'error');
        return;
    }

    const newDebt = {
        id: Date.now(),
        amount: amount,
        originalAmount: amount,
        description: description,
        dueDate: dueDate,
        createdDate: new Date().toISOString()
    };

    debts.push(newDebt);
    localStorage.setItem('debts', JSON.stringify(debts));

    document.getElementById('debt-amount').value = '';
    document.getElementById('debt-description').value = '';
    document.getElementById('debt-due-date').value = '';

    updateDebtUI();
    showToast('Debt added successfully!');
}

function handlePayDebt(debtId, paymentAmount) {
    const debt = debts.find(d => d.id === debtId);
    if (!debt || debt.amount === 0) {
        showToast('Debt not found or already paid', 'error');
        return;
    }

    const payment = Math.min(paymentAmount, debt.amount);
    debt.amount -= payment;

    localStorage.setItem('debts', JSON.stringify(debts));
    updateDebtUI();
    showToast(`₹${payment.toFixed(2)} paid towards ${debt.description}`);
}

function updateDebtUI() {
    const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
    document.getElementById('total-debt').textContent = `₹${Math.floor(totalDebt)}`;

    const debtList = document.getElementById('debt-list');

    if (debts.length === 0) {
        debtList.innerHTML = '<p class="text-gray-500 text-center py-4">No debts recorded. Great job!</p>';
        return;
    }

    debtList.innerHTML = debts.map(debt => {
        const today = new Date();
        const dueDate = new Date(debt.dueDate);
        const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        const progress = ((debt.originalAmount - debt.amount) / debt.originalAmount) * 100;

        let statusClass = 'text-gray-600';
        let statusText = `${daysLeft} days left`;

        if (debt.amount === 0) {
            statusClass = 'text-green-600';
            statusText = 'Paid Off!';
        } else if (daysLeft < 0) {
            statusClass = 'text-red-600';
            statusText = `${Math.abs(daysLeft)} days overdue`;
        } else if (daysLeft <= 7) {
            statusClass = 'text-orange-600';
            statusText = `${daysLeft} days left (Due Soon!)`;
        }

        return `
            <div class="p-4 bg-white rounded-lg border ${debt.amount === 0 ? 'border-green-200 bg-green-50' : daysLeft < 0 ? 'border-red-200 bg-red-50' : 'border-gray-200'}">
                <div class="flex justify-between items-center mb-3">
                    <h4 class="font-semibold text-gray-800 flex items-center gap-2">
                        ${debt.amount === 0 ? '<i class="fas fa-check-circle text-green-500"></i>' : ''}
                        ${debt.description}
                    </h4>
                    <div class="flex gap-2 items-center">
                        <span class="text-lg font-bold text-red-600">₹${Math.floor(debt.amount)}</span>
                        ${debt.amount > 0 ? `<button onclick="showPaymentModal(${debt.id})" class="btn btn-success text-xs px-2 py-1">
                            <i class="fas fa-money-bill-wave"></i> Pay
                        </button>` : ''}
                        <button onclick="deleteDebt(${debt.id})" class="text-red-500 hover:text-red-700">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>
                <div class="mb-2">
                    <div class="flex justify-between text-sm mb-1">
                        <span>Paid: ₹${Math.floor(debt.originalAmount - debt.amount)} of ₹${Math.floor(debt.originalAmount)}</span>
                        <span>${progress.toFixed(1)}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div class="h-3 rounded-full transition-all duration-1000 ${debt.amount === 0 ? 'bg-green-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                </div>
                <div class="text-sm ${statusClass}">
                    <i class="fas fa-calendar"></i> Due: ${new Date(debt.dueDate).toLocaleDateString()} - ${statusText}
                </div>
            </div>
        `;
    }).join('');
}

function showPaymentModal(debtId) {
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    // Create modal HTML
    const modalHtml = `
        <div id="payment-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-80 max-w-sm mx-4">
                <h3 class="text-lg font-semibold mb-4">Pay Debt</h3>
                <p class="text-gray-600 mb-2">${debt.description}</p>
                <p class="text-sm text-gray-500 mb-4">Outstanding: ₹${Math.floor(debt.amount)}</p>
                <input type="number" id="payment-amount" class="w-full p-2 border rounded mb-4" placeholder="Enter payment amount" max="${debt.amount}" step="0.01">
                <div class="flex gap-2">
                    <button onclick="processPayment(${debtId})" class="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Pay</button>
                    <button onclick="closePaymentModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400">Cancel</button>
                </div>
            </div>
        </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Focus on input
    setTimeout(() => {
        document.getElementById('payment-amount').focus();
    }, 100);
}

function processPayment(debtId) {
    const paymentAmount = parseFloat(document.getElementById('payment-amount').value);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        showToast('Please enter a valid payment amount', 'error');
        return;
    }

    const debt = debts.find(d => d.id === debtId);
    if (paymentAmount > debt.amount) {
        showToast('Payment amount cannot exceed outstanding debt', 'error');
        return;
    }

    handlePayDebt(debtId, paymentAmount);
    closePaymentModal();
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.remove();
    }
}

function deleteDebt(debtId) {
    if (confirm('Are you sure you want to delete this debt?')) {
        debts = debts.filter(debt => debt.id !== debtId);
        localStorage.setItem('debts', JSON.stringify(debts));
        updateDebtUI();
        showToast('Debt deleted successfully!');
    }
}

// ============================================
// ANALYSIS SECTION FUNCTIONS
// ============================================

let currentAnalysisPeriod = 'month';
let currentPeriodOffset = 0;
let analysisDonutChart = null;
let analysisLineChart = null;

// Show Analysis Section
function showAnalysisSection() {
    const analysisSection = document.getElementById('analysis-section');
    if (analysisSection) {
        analysisSection.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Update bottom nav
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        bottomNavItems.forEach(i => i.classList.remove('active'));
        const analysisBtn = document.querySelector('[data-section="analysis"]');
        if (analysisBtn) analysisBtn.classList.add('active');

        // Initialize with current period
        setAnalysisPeriod('month');
    }
}

// Hide Analysis Section
function hideAnalysisSection() {
    const analysisSection = document.getElementById('analysis-section');
    if (analysisSection) {
        analysisSection.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Set Analysis Period (week/month/year)
function setAnalysisPeriod(period) {
    currentAnalysisPeriod = period;
    currentPeriodOffset = 0;

    // Update period tabs
    const periodTabs = document.querySelectorAll('.period-tab');
    periodTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.period === period) {
            tab.classList.add('active');
        }
    });

    // Update sub-period labels
    updateSubperiodLabels();

    // Update analysis data
    updateAnalysisData();
}

// Navigate to previous/next period
function navigatePeriod(direction) {
    currentPeriodOffset += direction;
    updateSubperiodLabels();
    updateAnalysisData();

    // Update active subperiod button
    const subperiodBtns = document.querySelectorAll('.subperiod-btn');
    subperiodBtns.forEach(btn => btn.classList.remove('active'));
    if (currentPeriodOffset === 0) {
        document.getElementById('current-period-btn').classList.add('active');
    }
}

// Update sub-period labels based on current period
function updateSubperiodLabels() {
    const now = new Date();
    const prevLabel = document.getElementById('prev-period-label');
    const lastLabel = document.getElementById('last-period-label');
    const currentLabel = document.getElementById('current-period-label');

    if (currentAnalysisPeriod === 'week') {
        const weekNum = getWeekNumber(now);
        prevLabel.textContent = `Week ${weekNum - 2}`;
        lastLabel.textContent = 'Last Week';
        currentLabel.textContent = `This Week`;
    } else if (currentAnalysisPeriod === 'month') {
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevLabel.textContent = prevMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        lastLabel.textContent = 'Last Month';
        currentLabel.textContent = 'This Month';
    } else if (currentAnalysisPeriod === 'year') {
        prevLabel.textContent = (now.getFullYear() - 2).toString();
        lastLabel.textContent = 'Last Year';
        currentLabel.textContent = 'This Year';
    }
}

// Get week number
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Get expenses for current analysis period
function getExpensesForPeriod() {
    const now = new Date();
    let startDate, endDate;

    if (currentAnalysisPeriod === 'week') {
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek + (currentPeriodOffset * 7));
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
    } else if (currentAnalysisPeriod === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth() + currentPeriodOffset, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1 + currentPeriodOffset, 0);
    } else if (currentAnalysisPeriod === 'year') {
        startDate = new Date(now.getFullYear() + currentPeriodOffset, 0, 1);
        endDate = new Date(now.getFullYear() + currentPeriodOffset, 11, 31);
    }

    return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
    });
}

// Update Analysis Data
function updateAnalysisData() {
    const periodExpenses = getExpensesForPeriod();
    const total = periodExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Update total display
    document.getElementById('analysis-total').textContent = `${Math.floor(total)}`;

    // Group by category
    const categoryTotals = {};
    periodExpenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });

    // Sort categories by amount
    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);

    // Update donut chart
    updateAnalysisDonutChart(sortedCategories, total);

    // Update category breakdown
    updateCategoryBreakdown(sortedCategories, total);

    // Update line chart data
    updateAnalysisLineChart(periodExpenses);
}

// Category icons mapping
const categoryIcons = {
    'Shopping': 'fa-shopping-cart',
    'Food': 'fa-utensils',
    'Phone': 'fa-mobile-alt',
    'Entertainment': 'fa-tv',
    'Education': 'fa-graduation-cap',
    'Beauty': 'fa-cut',
    'Sports': 'fa-running',
    'Social': 'fa-users',
    'Transportation': 'fa-bus',
    'Clothing': 'fa-tshirt',
    'Car': 'fa-car',
    'Alcohol': 'fa-wine-glass-alt',
    'Electronics': 'fa-laptop',
    'Travel': 'fa-plane',
    'Health': 'fa-heartbeat',
    'Pets': 'fa-paw',
    'Repairs': 'fa-wrench',
    'Housing': 'fa-home',
    'Gifts': 'fa-gift',
    'Bills': 'fa-file-invoice-dollar',
    'Other': 'fa-box'
};

// Update Donut Chart
function updateAnalysisDonutChart(categories, total) {
    const ctx = document.getElementById('analysis-donut-chart');
    if (!ctx) return;

    if (analysisDonutChart) {
        analysisDonutChart.destroy();
    }

    const colors = ['#FFD700', '#ff6b6b', '#4ecdc4', '#a855f7', '#f59e0b', '#22c55e', '#3b82f6', '#ec4899'];

    if (categories.length === 0) {
        // Empty state
        analysisDonutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [1],
                    backgroundColor: ['#333333'],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '70%',
                plugins: { legend: { display: false } }
            }
        });
        return;
    }

    analysisDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories.map(c => c[0]),
            datasets: [{
                data: categories.map(c => c[1]),
                backgroundColor: colors.slice(0, categories.length),
                borderWidth: 0
            }]
        },
        options: {
            cutout: '70%',
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Update Category Breakdown
function updateCategoryBreakdown(categories, total) {
    const container = document.getElementById('analysis-categories');
    if (!container) return;

    const colors = ['#FFD700', '#ff6b6b', '#4ecdc4', '#a855f7', '#f59e0b', '#22c55e', '#3b82f6', '#ec4899'];

    if (categories.length === 0) {
        container.innerHTML = `
            <div class="category-item-row empty-state">
                <span>No expenses in this period</span>
            </div>
        `;
        return;
    }

    container.innerHTML = categories.map((cat, index) => {
        const [name, amount] = cat;
        const percent = total > 0 ? ((amount / total) * 100).toFixed(0) : 0;
        const icon = categoryIcons[name] || 'fa-box';
        const color = colors[index % colors.length];

        return `
            <div class="category-item-row">
                <div class="cat-icon" style="background: ${color}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="cat-info">
                    <div class="cat-name">${name} <span class="cat-percent">${percent}%</span></div>
                    <div class="cat-bar">
                        <div class="cat-bar-fill" style="width: ${percent}%; background: ${color}"></div>
                    </div>
                </div>
                <div class="cat-amount">₹${Math.floor(amount)}</div>
            </div>
        `;
    }).join('');
}

// Update Line Chart
function updateAnalysisLineChart(periodExpenses) {
    const ctx = document.getElementById('analysis-line-chart');
    if (!ctx) return;

    const total = periodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avg = periodExpenses.length > 0 ? total / 7 : 0; // Approximate daily average

    document.getElementById('line-chart-total').textContent = `₹${Math.floor(total)}`;
    document.getElementById('line-chart-avg').textContent = `₹${avg.toFixed(2)}`;

    // Group by date
    const dailyTotals = {};
    periodExpenses.forEach(expense => {
        const date = expense.date;
        if (!dailyTotals[date]) {
            dailyTotals[date] = 0;
        }
        dailyTotals[date] += expense.amount;
    });

    const sortedDates = Object.keys(dailyTotals).sort();
    const colors = ['#FFD700', '#ff6b6b', '#4ecdc4', '#a855f7', '#f59e0b'];

    if (analysisLineChart) {
        analysisLineChart.destroy();
    }

    analysisLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates.map(d => {
                const date = new Date(d);
                return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            }),
            datasets: [{
                data: sortedDates.map(d => dailyTotals[d]),
                borderColor: '#22c55e',
                backgroundColor: 'transparent',
                tension: 0.3,
                pointBackgroundColor: colors,
                pointBorderColor: colors,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#666' }
                },
                y: {
                    grid: { color: '#333' },
                    ticks: { color: '#666' }
                }
            }
        }
    });
}

// Insights Dashboard Functions
function updateInsightsDashboard() {
    // Calculate average daily spending (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentExpenses = expenses.filter(exp => new Date(exp.date) >= thirtyDaysAgo);
    const totalRecentExpenses = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avgDailySpending = recentExpenses.length > 0 ? totalRecentExpenses / 30 : 0;
    
    document.getElementById('avg-daily-spending').textContent = `₹${avgDailySpending.toFixed(2)}`;
    
    // Calculate top category
    const categoryTotals = {};
    expenses.forEach(exp => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });
    
    let topCategory = 'None';
    let topAmount = 0;
    for (const [category, amount] of Object.entries(categoryTotals)) {
        if (amount > topAmount) {
            topAmount = amount;
            topCategory = category;
        }
    }
    
    document.getElementById('top-category').textContent = topCategory;
    document.getElementById('top-category-amount').textContent = `₹${topAmount.toFixed(2)}`;
    
    // Calculate financial health score
    const totalIncome = onlineIncome + cashIncome;
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const savingsAmount = savings;
    
    let healthScore = 0;
    let healthStatus = 'Poor';
    
    // Scoring criteria
    if (totalIncome > 0) {
        const savingsRate = (savingsAmount / totalIncome) * 100;
        const expenseRatio = (totalExpenses / totalIncome) * 100;
        
        if (savingsRate >= 20) healthScore += 40;
        else if (savingsRate >= 10) healthScore += 20;
        
        if (expenseRatio <= 70) healthScore += 30;
        else if (expenseRatio <= 90) healthScore += 15;
        
        if (debts.length === 0) healthScore += 30;
        else if (debts.reduce((sum, debt) => sum + debt.amount, 0) < totalIncome * 0.5) healthScore += 15;
    }
    
    if (healthScore >= 80) healthStatus = 'Excellent';
    else if (healthScore >= 60) healthStatus = 'Good';
    else if (healthScore >= 40) healthStatus = 'Fair';
    else healthStatus = 'Poor';
    
    document.getElementById('health-score').textContent = `${healthScore}/100`;
    document.getElementById('health-status').textContent = healthStatus;
    
    // Calculate savings rate
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
    document.getElementById('savings-rate').textContent = `${savingsRate.toFixed(1)}%`;
    
    // Calculate expense trend (compare current month vs previous month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    }).reduce((sum, exp) => sum + exp.amount, 0);
    
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const prevMonthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === prevMonth && expDate.getFullYear() === prevYear;
    }).reduce((sum, exp) => sum + exp.amount, 0);
    
    let trend = 'Stable';
    let trendPercentage = '0% change';
    
    if (prevMonthExpenses > 0) {
        const change = ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100;
        if (change > 10) {
            trend = 'Increasing';
            trendPercentage = `+${change.toFixed(1)}%`;
        } else if (change < -10) {
            trend = 'Decreasing';
            trendPercentage = `${change.toFixed(1)}%`;
        }
    }
    
    document.getElementById('expense-trend').textContent = trend;
    document.getElementById('trend-percentage').textContent = trendPercentage;
    
    // Budget status (placeholder - would need budget data)
    document.getElementById('budget-status').textContent = 'Feature Coming Soon';
    document.getElementById('budget-details').textContent = 'Budget planning to be implemented';
    
    // Generate insights list
    const insightsList = document.getElementById('insights-list');
    insightsList.innerHTML = '';
    
    const insights = [];
    
    if (avgDailySpending > 0) {
        insights.push(`Your average daily spending is ₹${avgDailySpending.toFixed(2)} over the last 30 days.`);
    }
    
    if (topCategory !== 'None') {
        insights.push(`${topCategory} is your biggest expense category with ₹${topAmount.toFixed(2)} spent.`);
    }
    
    if (savingsRate > 0) {
        insights.push(`You're saving ${savingsRate.toFixed(1)}% of your income - ${healthStatus.toLowerCase()} financial health!`);
    } else if (savingsRate < 0) {
        insights.push(`You're spending ${Math.abs(savingsRate).toFixed(1)}% more than you earn. Consider reducing expenses.`);
    }
    
    if (trend === 'Increasing') {
        insights.push(`Your expenses are trending upward. Review your spending patterns.`);
    } else if (trend === 'Decreasing') {
        insights.push(`Great job! Your expenses are trending downward.`);
    }
    
    if (debts.length > 0) {
        const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
        insights.push(`You have ₹${totalDebt.toFixed(2)} in outstanding debts. Focus on debt reduction.`);
    }
    
    if (insights.length === 0) {
        insights.push('Start adding expenses and income to see personalized insights!');
    }
    
    insights.forEach(insight => {
        const li = document.createElement('li');
        li.className = 'flex items-start gap-2';
        li.innerHTML = `
            <i class="fas fa-info-circle text-blue-500 mt-0.5"></i>
            <span>${insight}</span>
        `;
        insightsList.appendChild(li);
    });
}

// Switch between donut and line chart
function switchAnalysisChart(chartType) {
    const dots = document.querySelectorAll('.chart-dots .dot');
    const donutSection = document.querySelector('.analysis-chart-section');
    const lineSection = document.getElementById('line-chart-section');

    dots.forEach(dot => dot.classList.remove('active'));

    if (chartType === 'donut') {
        dots[0].classList.add('active');
        donutSection.classList.remove('hidden');
        lineSection.classList.add('hidden');
    } else if (chartType === 'line') {
        dots[1].classList.add('active');
        donutSection.classList.add('hidden');
        lineSection.classList.remove('hidden');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);

