function updateSubjects() {
    const stream = document.getElementById('stream').value;
    const inputsDiv = document.getElementById('subject-inputs');
    let subjects = [];
    if (stream === 'Science') {
        subjects = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science'];
    } else if (stream === 'Commerce') {
        subjects = ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English'];
    } else if (stream === 'Arts') {
        subjects = ['History', 'Geography', 'Political Science', 'Psychology', 'English'];
    }
    inputsDiv.innerHTML = '';
    subjects.forEach((sub, idx) => {
        const div = document.createElement('div');
        div.className = 'subject';
        const label = document.createElement('label');
        label.setAttribute('for', 'marks' + (idx+1));
        label.textContent = sub + ' :';
        const input = document.createElement('input');
        input.type = 'number';
        input.id = 'marks' + (idx+1);
        input.placeholder = 'Enter marks';
        input.min = 0;
        input.max = 100;
        div.appendChild(label);
        div.appendChild(input);
        inputsDiv.appendChild(div);
    });
}

window.onload = updateSubjects;

function calculateGrade() {
    let name = document.getElementById('name').value || '-';
    let className = document.getElementById('class').value || '-';
    let section = document.getElementById('sec').value || '-';
    let roll = document.getElementById('roll').value || '-';
    let total = 0;
    let maxMarks = 500;
    for (let i = 1; i <= 7; i++) {
        let input = document.getElementById('marks' + i);
        if (input) {
            let val = parseInt(input.value) || 0;
            total += val;
        }
    }
    let percent = (total / maxMarks) * 100;
    let grade = '';
    if (percent >= 90) grade = 'A+';
    else if (percent >= 80) grade = 'A';
    else if (percent >= 70) grade = 'B+';
    else if (percent >= 60) grade = 'B';
    else if (percent >= 50) grade = 'C';
    else if (percent >= 40) grade = 'D';
    else grade = 'F';
    document.getElementById('grade-result').innerHTML =
        `<div>Name: <b>${name}</b></div>
         <div>Class: <b>${className}</b></div>
         <div>Section: <b>${section}</b></div>
         <div>Roll No: <b>${roll}</b></div>
         <div>Total Marks: <b>${total} / 500</b></div>
         <div>Percentage: <b>${percent.toFixed(2)}%</b></div>
         <div>Grade: <b>${grade}</b></div>`;
}


