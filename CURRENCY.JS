// rates will be populated dynamically on page load using an external API
let rates = { USD: 1 };

// store last fetch date to avoid unnecessary repeated calls during same day
let lastFetchDate = null;

async function updateRates() {
    const today = new Date().toISOString().slice(0, 10);
    if (lastFetchDate === today) {
        return; // already updated today
    }

    try {
        // using free exchange rate API
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.result === 'success') {
            rates = data.rates;
            rates.USD = 1; // ensure base
            lastFetchDate = today;
            console.log('Currency rates updated', rates);
        } else {
            console.warn('Failed to fetch rates:', data);
        }
    } catch (err) {
        console.error('Error fetching currency rates:', err);
    }
}

// call update when the script loads
updateRates();

// schedule a daily refresh (milliseconds)
setInterval(updateRates, 24 * 60 * 60 * 1000);

document.getElementById('convert').onclick = async function() {
	// ensure we have the latest rates before converting
	await updateRates();

	const from = document.getElementById('dropdown1').value;
	const to = document.getElementById('dropdown2').value;
	const amount = parseFloat(document.getElementById('c1').value);
	if (isNaN(amount)) {
		document.getElementById('c2').value = '';
		alert('Please enter a valid amount.');
		return;
	}
	// Convert to USD first, then to target
	const usdAmount = amount / rates[from];
	const converted = usdAmount * rates[to];
	document.getElementById('c2').value = converted.toFixed(2);
};

document.getElementById('reset').onclick = function() {
	document.getElementById('c1').value = '';
	document.getElementById('c2').value = '';
	document.getElementById('dropdown1').selectedIndex = 0;
	document.getElementById('dropdown2').selectedIndex = 0;
};
