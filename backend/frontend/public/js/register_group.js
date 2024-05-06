const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
if(registerForm){
registerForm.addEventListener('submit', validateRegisterForm);
}
if(loginForm){
loginForm.addEventListener('submit', validateLoginForm);}

document.querySelectorAll('input').forEach(function(input) {
    input.addEventListener('paste', function(event) {
        event.preventDefault();
    });
});

function validateRegisterForm(event) {
    event.preventDefault(); 
    var username = document.getElementById("username").value.trim();
    var email = document.getElementById("email").value.trim();
    var firstName = document.getElementById("firstName").value.trim();
    var lastName = document.getElementById("lastName").value.trim();
    var bio = document.getElementById("bio").value.trim();
    var age = document.getElementById("age").value.trim();
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    var profilePicture = document.getElementById("profile_picture").value.trim();
    $('#for_error').hide();
    $('#error-list').hide();
    if (!firstName || !lastName || !username || !password || !confirmPassword || !email || !bio || !age || !profilePicture) {
        displayError('All fields are required','for_error');
        return;
    }
    if (!/^[a-zA-Z]{5,10}$/.test(username)) {
        displayError('Invalid username (5-10 characters, no numbers)','for_error');
        document.getElementById("username").focus();
        return;
    } 
    
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+(?:\.[a-zA-Z]{2,})+$/.test(email)) {
        displayError('Invalid email address','for_error');
        document.getElementById("email").focus();
        return;
    }

    if (!/^[a-zA-Z]{2,25}$/.test(firstName)) {
        displayError('Invalid first name (2-25 characters, no numbers)','for_error');
        document.getElementById("firstName").focus();
        return;
    }

    if (!/^[a-zA-Z]{2,25}$/.test(lastName)) {
        displayError('Invalid last name (2-25 characters, no numbers)','for_error');
        document.getElementById("lastName").focus();
        return;
    }

    if (bio.length > 500) {
        displayError("Bio cannot exceed 500 characters!",'for_error');
        document.getElementById("bio").focus();
        return;
    }


     // Check if age is a number
     if (isNaN(age)) {
        displayError("Age must be a number!",'for_error');
        document.getElementById("age").focus();
        return;
    }

    // Check if age is greater than 18 and less than 90
    if (age <= 18 || age >= 90) {
        displayError("Age must be greater than 18 and less than 90!",'for_error');
        document.getElementById("age").focus();
        return;
    }

    if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}/.test(password)) {
        displayError('Invalid password (at least 8 characters with uppercase, number, special character)','for_error');
        document.getElementById("password").focus();
        return;
    }

    if (password !== confirmPassword) {
        displayError('Passwords do not match','for_error');
        document.getElementById("confirmPassword").focus();
        return;
    }

   

   
    

    event.target.submit();
}

function displayError(message,id) {
   if(id==='for_error'){
    $('#for_error').show();
   }else{
    $('#for_error1').show();
   }
    const errorElement = document.getElementById(id);
    errorElement.textContent = message;
    errorElement.focus();
}

function validateLoginForm(event) {
    event.preventDefault(); 

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    $('#for_error1').hide();
    $('#error-list').hide();
    if (!username || !password) {
        displayError('All fields are required', 'for_error1');
        return;
    }
    if (!/^[a-zA-Z]{5,10}$/.test(username)) {
        displayError('Invalid username or password','for_error1');
        document.getElementById('username').focus()
        return;
    }

    if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}/.test(password)) {
        displayError('Invalid username or password','for_error1');
        document.getElementById('username').focus()
        return;
    }
    event.target.submit();
}
    