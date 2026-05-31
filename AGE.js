function getDOB() {
    
    const dobInput = document.getElementById('dob').value;
    const currentDateInput = document.getElementById('today').value;
   
    if (!dobInput || !currentDateInput) {
        alert('Please enter both Date of Birth and Current Date.');
        return;
    }
    
    const dob = new Date(dobInput);
    const currentDate = new Date(currentDateInput);
    
    let age = currentDate.getFullYear() - dob.getFullYear();
    // getMonth returns month index (0-11)
    let monthDifference = currentDate.getMonth() - dob.getMonth();

    let dayDifference = currentDate.getDate() - dob.getDate();
    
    // adjust if days are negative
    if (dayDifference < 0) {
        // borrow one month
        monthDifference--;
        // get number of days in the previous month of currentDate
        const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        dayDifference += prevMonth.getDate();
    }
    
    if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < dob.getDate())) {
        age--;
    }
    
    // if we subtracted a year, adjust month difference accordingly
    if (monthDifference < 0) {
        monthDifference += 12;
    }
    
    document.getElementById('result').textContent = `Your age is ${age} years ${monthDifference} months ${dayDifference} days.`;
}