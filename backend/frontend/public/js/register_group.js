const registerForm = document.getElementById('register-group-form');
const loginForm = document.getElementById('login-group-form');
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
    var username = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var bio = document.getElementById("bio").value.trim();
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    var profilePicture = document.getElementById("profile_picture").value.trim();
    $('#for_error').hide();
    $('#error-list').hide();
    if (!username || !password || !confirmPassword || !email || !bio || !age || !profilePicture) {
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

    if (bio.length > 500) {
        displayError("Bio cannot exceed 500 characters!",'for_error');
        document.getElementById("bio").focus();
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
    var flag=true;
    var membersData = [];
    var memberDivs = document.querySelectorAll('.member-fields');
    memberDivs.forEach((memberDiv, index) => {
        var memberData = {};
        var firstName = memberDiv.querySelector('input[name="firstName"]').value.trim();
        var lastName = memberDiv.querySelector('input[name="lastName"]').value.trim();
        var memberAge = memberDiv.querySelector('input[name="memberAge"]').value.trim();
        var memberEmail = memberDiv.querySelector('input[name="memberEmail"]').value.trim();
        var memberGender = memberDiv.querySelector('input[name="memberGender' + index + '"]:checked');
        
        if (!firstName || !lastName || !memberAge || !memberEmail || !memberGender) {
            displayError('Please fill in all member fields for Member ' + (index + 1),'for_error');
            flag=false;
            return ;
        }
        if (!/^[a-zA-Z]{2,25}$/.test(firstName)) {
            displayError('Invalid first name (2-25 characters, no numbers)'+ (index + 1),'for_error');
            flag=false;
            return;
        }
    
        if (!/^[a-zA-Z]{2,25}$/.test(lastName)) {
            displayError('Invalid last name (2-25 characters, no numbers)'+ (index + 1),'for_error');
            flag=false;
            return;
        }
        if (isNaN(memberAge)) {
            displayError("Age must be a number!"+ (index + 1),'for_error');
            flag=false;
            return;
        }
    
        // Check if age is greater than 18 and less than 90
        if (memberAge <= 18 || memberAge >= 90) {
            displayError("Age must be greater than 18 and less than 90!"+ (index + 1),'for_error');
            flag=false;
            return;
        }
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+(?:\.[a-zA-Z]{2,})+$/.test(memberEmail)) {
            displayError('Invalid email address'+ (index + 1),'for_error');
            flag=false;
            return;
        }
        if (!memberGender) {
            displayError("Please select a gender for Member " + (index + 1),'for_error');
            flag=false;
            return;
        }

        memberData.firstName = firstName;
        memberData.lastName = lastName;
        memberData.age = memberAge;
        memberData.email = memberEmail;
        memberData.gender = memberGender.value;
        membersData.push(memberData);
    });
    if (!flag){
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

    const username = document.getElementById('name').value.trim();
    const password = document.getElementById('password').value;
    $('#for_error1').hide();
    $('#error-list1').hide();
    if (!username || !password) {
        displayError('All fields are required', 'for_error1');
        return;
    }
    if (!/^[a-zA-Z]{5,10}$/.test(username)) {
        displayError('Invalid username or password','for_error1');
        document.getElementById('name').focus()
        return;
    }

    if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}/.test(password)) {
        displayError('Invalid username or password','for_error1');
        document.getElementById('name').focus()
        return;
    }
    event.target.submit();
}