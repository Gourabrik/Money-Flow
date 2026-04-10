// Add test savings data to localStorage
const testSavingsHistory = [
    { date: '2023-01-01', amount: 1000, type: 'savings-add', description: 'Initial savings' },
    { date: '2023-01-05', amount: 500, type: 'savings-add', description: 'Bonus savings' },
    { date: '2023-01-10', amount: 200, type: 'savings-withdraw', description: 'Emergency expense' },
    { date: '2023-01-15', amount: 1500, type: 'savings-add', description: 'Salary savings' },
    { date: '2023-01-20', amount: 300, type: 'savings-withdraw', description: 'Shopping expense' },
    { date: '2023-01-25', amount: 1200, type: 'savings-add', description: 'Investment return' }
];

// Save to localStorage
localStorage.setItem('savingsHistory', JSON.stringify(testSavingsHistory));
localStorage.setItem('savings', '3700');

console.log('Test savings data added to localStorage');