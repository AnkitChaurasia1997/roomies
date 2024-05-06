var isLoggedIn = false; // Change this to true if user is logged in

/*login.html*/
document.addEventListener("DOMContentLoaded", function () {
    // Get the login buttons
    const loginIndividualBtn = document.getElementById('loginIndividualBtn');
    const loginGroupBtn = document.getElementById('loginGroupBtn');

    // Add click event listeners to the login buttons
    loginIndividualBtn.addEventListener('click', function () {
        // Redirect to individual login page
        window.location.href = "login_user.html";
    });

    loginGroupBtn.addEventListener('click', function () {
        // Redirect to group login page
        window.location.href = "login_group.html";
    });
});


/*register.html*/
document.addEventListener("DOMContentLoaded", function () {
    // Get the register buttons
    const registerIndividualBtn = document.getElementById('registerIndividualBtn');
    const registerGroupBtn = document.getElementById('registerGroupBtn');

    // Add click event listeners to the register buttons
    registerIndividualBtn.addEventListener('click', function () {
        // Redirect to individual register page
        window.location.href = "register_user.html";
    });

    registerGroupBtn.addEventListener('click', function () {
        // Redirect to group register page
        window.location.href = "register_group.html";
    });
});


/*complete_profile_solo*/
// Compile the Handlebars template
const profileTemplate = Handlebars.compile(document.getElementById('profile-template').innerHTML);

// Get the form element
const profileForm = document.getElementById('profileForm');

// Add event listener for form submission
profileForm.addEventListener('submit', (event) => {
  event.preventDefault();

  // Get form values
  const formData = new FormData(event.target);
  const profileData = {
    bio: formData.get('bio'),
    age: formData.get('age'),
    budget: formData.get('budget'),
    gender: formData.get('gender'),
    profilePic: URL.createObjectURL(formData.get('profilePic')),
    location: formData.get('location'),
    foodChoice: formData.get('foodChoice'),
    profession: formData.get('profession')
  };

  // Render the profile details
  const profileDetailsHtml = profileTemplate(profileData);
  const profileDetails = document.getElementById('profileDetails');
  profileDetails.innerHTML = profileDetailsHtml;

  
  setTimeout(() => {
    window.location.href = 'index.html';
  });
});

/*complete_profile_group*/
document.addEventListener("DOMContentLoaded", function() {
    const profileForm = document.getElementById("profileForm");
    const profileTemplate = document.getElementById("profile-template").innerHTML;
    const profileDetails = document.getElementById("profileDetails");

    profileForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission

        // Get form values
        const bio = document.getElementById("bio").value;
        const members = document.getElementById("members").value;
        const budget = document.getElementById("budget").value;
        const profilePic = document.getElementById("profilePic").value; // Note: You need to handle file uploads separately
        const location = document.getElementById("location").value;
        const foodChoice = document.getElementById("foodChoice").value;

        // Create profile object
        const profile = {
            bio: bio,
            members: members,
            budget: budget,
            profilePic: profilePic, 
            location: location,
            foodChoice: foodChoice
        };

        // Render profile details using Handlebars
        const template = Handlebars.compile(profileTemplate);
        const renderedHtml = template(profile);
        profileDetails.innerHTML = renderedHtml;

        // Redirect to index page 
        window.location.href = "index.html"; 
    });
});

/*chat*/
// Compile Handlebars template
const source = document.getElementById("chat-message-template").innerHTML;
const template = Handlebars.compile(source);

// Render chat messages
const context = { messages: chatData };
const html = template(context);
document.getElementById("chat-messages").innerHTML = html;

/*add member button on profile_group*/

function toggleMemberFields(member) {
    var memberFields = document.getElementById(member + "-fields");
    if (memberFields.style.display === "none" || memberFields.style.display === "") {
      memberFields.style.display = "block";
    } else {
      memberFields.style.display = "none";
    }
}