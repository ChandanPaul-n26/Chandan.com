const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const dataFile = path.join(__dirname, 'Data.txt');

app.use(express.json());
app.use(express.static(__dirname)); // serve HTML/JS/CSS from this folder

// helper to parse file into array of expenses
function readExpenses() {
    try {
        const text = fs.readFileSync(dataFile, 'utf8');
        if (!text) return [];
        return text.split(/\r?\n/).map(line => {
            const [name, amount, type, date] = line.split(',');
            return { name, amount, type, date };
        });
    } catch (e) {
        if (e.code === 'ENOENT') return [];
        throw e;
    }
}

function writeExpenses(arr) {
    const text = arr.map(exp => `${exp.name},${exp.amount},${exp.type},${exp.date}`).join('\n');
    fs.writeFileSync(dataFile, text, 'utf8');
}

app.get('/expenses', (req, res) => {
    try {
        const expenses = readExpenses();
        res.json(expenses);
    } catch (err) {
        console.error(err);
        res.status(500).send('Unable to read data');
    }
});

app.post('/expenses', (req, res) => {
    const expenses = req.body;
    try {
        writeExpenses(expenses);
        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(500).send('Unable to write data');
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});