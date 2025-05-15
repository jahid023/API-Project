// DOM Elements
const amountEl = document.getElementById('amount');
const fromCurrencyEl = document.getElementById('from-currency');
const toCurrencyEl = document.getElementById('to-currency');
const convertedAmountEl = document.getElementById('converted-amount');
const swapBtn = document.getElementById('swap-btn');
const convertBtn = document.getElementById('convert-btn');
const rateEl = document.getElementById('rate-info');

// API URL with your API key
const API_URL = 'https://v6.exchangerate-api.com/v6/e4192c4c8be27e7c0a4e52fd/latest/';

// Fetch exchange rates and update the DOM
async function calculate() {
    const fromCurrency = fromCurrencyEl.value;
    const toCurrency = toCurrencyEl.value;
    const amount = parseFloat(amountEl.value) || 0;

    try {
        // Show loading state
        convertedAmountEl.value = 'Loading...';
        
        // Fetch exchange rates
        const response = await fetch(`${API_URL}${fromCurrency}`);
        const data = await response.json();
        
        if (data.result === 'error') {
            throw new Error(data['error-type']);
        }
        
        const rate = data.conversion_rates[toCurrency];
        const convertedAmount = (amount * rate).toFixed(4);
        
        // Update the UI
        convertedAmountEl.value = convertedAmount;
        rateEl.textContent = `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        convertedAmountEl.value = 'Error';
        rateEl.textContent = 'Failed to fetch exchange rates. Please try again later.';
    }
}

// Swap the currencies
function swapCurrencies() {
    const temp = fromCurrencyEl.value;
    fromCurrencyEl.value = toCurrencyEl.value;
    toCurrencyEl.value = temp;
    calculate();
}

// Event Listeners
amountEl.addEventListener('input', calculate);
fromCurrencyEl.addEventListener('change', calculate);
toCurrencyEl.addEventListener('change', calculate);
swapBtn.addEventListener('click', swapCurrencies);
convertBtn.addEventListener('click', calculate);

// Initial calculation
calculate();

// Show the converter box immediately when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const converterBox = document.querySelector('.converter-box');
    converterBox.style.opacity = '1';
    converterBox.style.transform = 'translateY(0)';
});
