document.addEventListener("DOMContentLoaded", () => {
    // script.js

    console.log("All countries:", COUNTRIES.length);

    const steps = document.querySelectorAll(".step-form");
    const formContainer = document.querySelector(".bazaar-csform");
    let currentStepIndex = 0;

    // Object to store collected data
    const formData = {};

    // Elements for password validation (Step 10)
    const passwordInput = document.getElementById("password");
    const phoneEle = document.getElementById("cs_phone");
    const confirmPasswordInput = document.getElementById("confirm_password");
    const passwordRequirements = {
        length: document.getElementById("length"),
        special: document.getElementById("special"),
        uppercaseLowercase: document.getElementById("uppercase-lowercase"),
    };
    const confirmPasswordGroup = document.getElementById("confirm-password-group");
    const countryCodeSelect = document.getElementById("country_code");
    const phoneNumberInput = document.querySelector(".phone-field #phone");

    // Country-specific digit requirements
    const phoneDigitsByCountry = {
        "+1": 10, // USA
        "+91": 10, // India
        "+44": 10, // UK
        "+92": 11, // Pakistan
    };

    // Fetch user's country using GeoJS API
    async function fetchUserCountry() {
        try {
            const response = await fetch("https://get.geojs.io/v1/ip/country.json");
            const data = await response.json();

            // Match detected country with the dropdown options
            const countryCodeOption = Array.from(countryCodeSelect.options).find(
                (option) => option.getAttribute("data-country") === data.country
            );

            // Auto-select the detected country code
            if (countryCodeOption) {
                countryCodeSelect.value = countryCodeOption.value;
            }
        } catch (error) {
            console.error("Failed to fetch user location:", error);
        }
    }

    // Call fetchUserCountry to set default country code
    fetchUserCountry();

    // Show the first step after a delay
    setTimeout(() => formContainer.classList.remove("hide"), 3000);

    // Function to show a specific step
    function showStep(index) {
        steps.forEach((step, i) => {
            if (i === index) {
                step.classList.remove("hide");
            } else {
                step.classList.add("hide");
            }
        });
        currentStepIndex = index;
    }

    // Handle "Next" button clicks
    document.querySelectorAll(".next").forEach((btn) => {
        btn.addEventListener("click", () => {
            const currentForm = steps[currentStepIndex];
            const nextStepId = btn.getAttribute("data-next");
            if (currentForm.id === "step-8") {
                if (!validateStep8(currentForm)) return; // Stop if validation fails
            }
            if (currentForm.id === "step-9") {
                if (!validateStep9(currentForm)) return; // Stop if validation fails
            }
            if (currentForm.id === "step-10") {
                if (!validatePasswordStep(currentForm)) return; // Stop if password validation fails
            }
            if (currentForm.id !== "step-login" && currentForm.id !== "step-8") {
                if (validateForm(currentForm)) {
                    // Collect data only if it's not the login form
                    collectFormData(currentForm);

                    if (nextStepId === "done") {
                        showStep(steps.length - 1); // Show the done screen
                    } else {
                        const nextStepIndex = Array.from(steps).findIndex(
                            (step) => step.id === nextStepId
                        );
                        showStep(nextStepIndex);
                    }
                }
            } else {
                const nextStepIndex = Array.from(steps).findIndex(
                    (step) => step.id === nextStepId
                );
                showStep(nextStepIndex);
            }
        });
    });

    // Handle "Prev" button clicks
    document.querySelectorAll(".prev").forEach((btn) => {
        btn.addEventListener("click", () => {
            const prevStepId = btn.getAttribute("data-prev");
            const prevStepIndex = Array.from(steps).findIndex(
                (step) => step.id === prevStepId
            );
            resetForm(steps[currentStepIndex]); // Reset the current form
            showStep(prevStepIndex);
        });
    });
    phoneEle.addEventListener('input', function() {
        let num = this.value
        let code = this.closest('.input-group').querySelector('#country_code').value
        let phone = this.closest('.input-group').querySelector('#phone')
        let fullNum = code + num;
        phone.setAttribute('value',fullNum)
    })

    // Password input validation (Step 10)
    passwordInput.addEventListener("input", () => {
        const password = passwordInput.value;

        // Validate password requirements
        validatePasswordRequirement(password.length >= 8, passwordRequirements.length);
        validatePasswordRequirement(
            /[!@#$%^&*(),.?":{}|<>]/.test(password),
            passwordRequirements.special
        );
        validatePasswordRequirement(
            /[a-z]/.test(password) && /[A-Z]/.test(password),
            passwordRequirements.uppercaseLowercase
        );

        // Show confirm password field if all requirements are met
        const allValid = document.querySelectorAll("#password-requirements .invalid").length === 0;
        confirmPasswordGroup.classList.toggle("hide", !allValid);
    });

    // Validate password requirements
    function validatePasswordRequirement(isValid, element) {
        if (isValid) {
            element.classList.remove("invalid");
            element.classList.add("valid");
        } else {
            element.classList.remove("valid");
            element.classList.add("invalid");
        }
    }

    // Validate the entire password step
    function validatePasswordStep(form) {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const errorDiv = form.querySelector(".error");
        // Check if all requirements are met
        const allValid = document.querySelectorAll("#password-requirements .invalid").length === 0;
        if (!allValid) {
            errorDiv.textContent = "Your password does not meet the required criteria.";
            errorDiv.classList.add("active");
            return false;
        }else {
            errorDiv.textContent = "";
            errorDiv.classList.remove("active");
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            errorDiv.textContent = "Passwords do not match. Please try again.";
            errorDiv.classList.add("active");
            return false;
        }else {
            errorDiv.textContent = "";
            errorDiv.classList.remove("active");
        }

        return true;
    }

    // Validate Step 8 (at least one checkbox must be selected, but no data is collected)
    function validateStep8(form) {
        const checkboxes = form.querySelectorAll("input[type='checkbox']");
        const errorDiv = form.querySelector(".error");

        // Find if at least one checkbox is selected
        const atLeastOneChecked = Array.from(checkboxes).some(
            (checkbox) => checkbox.checked
        );

        if (!atLeastOneChecked) {
            errorDiv.textContent = "Please select at least one option.";
            errorDiv.classList.add("active");
            return false;
        } else {
            errorDiv.textContent = "";
            errorDiv.classList.remove("active");

            // Configure Step 9 based on Step 8 selections
            const selectedOptions = Array.from(checkboxes)
                .filter((checkbox) => checkbox.checked)
                .map((checkbox) => checkbox.value);
            setupStep9(selectedOptions);
        }

        return true;
    }

    // Configure Step 9 based on Step 8 selections
    function setupStep9(selectedOptions) {
        const phoneField = document.querySelector(".phone-field");
        const emailField = document.querySelector(".email-field");

        // Reset Step 9 fields
        phoneField.classList.add("hide");
        emailField.classList.add("hide");
        document.getElementById("cs_phone").removeAttribute("required");
        document.getElementById("email").removeAttribute("required");

        // Show and set required attributes based on selections
        if (selectedOptions.includes("phone")) {
            phoneField.classList.remove("hide");
            document.getElementById("cs_phone").setAttribute("required", "true");
        }
        if (selectedOptions.includes("email")) {
            emailField.classList.remove("hide");
            document.getElementById("email").setAttribute("required", "true");
        }
    }

    // Validate Step 9 (ensure at least one field is filled if shown)
    function validateStep9(form) {
        const phoneInput = document.getElementById("cs_phone");
        const emailInput = document.getElementById("email");
        const errorDiv = form.querySelector(".error");

        let isValid = false;
        if (phoneInput && !phoneInput.classList.contains("hide") && phoneInput.value.trim()) {
            if (!validatePhoneNumber(form)) {
                return; // Stop navigation if validation fails
            }
            isValid = true;
        }
        if (emailInput && !emailInput.classList.contains("hide") && emailInput.value.trim()) {
            isValid = true;
        }

        if (!isValid) {
            errorDiv.textContent = "Please fill out the required field(s).";
            errorDiv.classList.add("active");
            return false;
        } else {
            errorDiv.textContent = "";
            errorDiv.classList.remove("active");
        }

        return true;
    }

    // Validate the current form
    function validateForm(form) {
        const checkboxes = form.querySelectorAll("input[type='checkbox']");
        const errorDiv = form.querySelector(".error");

        // For checkbox validation
        if (checkboxes.length > 0) {
            const atLeastOneChecked = Array.from(checkboxes).some(
                (checkbox) => checkbox.checked
            );
            if (!atLeastOneChecked) {
                errorDiv.textContent = "Please select at least one option.";
                errorDiv.classList.add("active");
                return false;
            } else {
                errorDiv.textContent = "";
                errorDiv.classList.remove("active");
            }
        }

        const inputs = form.querySelectorAll("input, select");
        for (let input of inputs) {
            if (!input.checkValidity()) {
                input.reportValidity();
                return false;
            }
        }
        return true;
    }

    // Reset the current form
    function resetForm(form) {
        const inputs = form.querySelectorAll("input, select");
        inputs.forEach((input) => {
            if (input.type === "checkbox") {
                const label = input.closest("label");
                if (label) label.classList.remove("checked");
            }
            input.value = "";
            input.checked = false;
        });

        const errorDiv = form.querySelector(".error");
        if (errorDiv) {
            errorDiv.textContent = "";
            errorDiv.classList.remove("active");
        }
    }

    // Validate the phone number
    function validatePhoneNumber(form) {
        const countryCode = countryCodeSelect.value;
        const phoneError = form.querySelector('.error')
        const phoneNumber = phoneNumberInput.value.trim();
        const requiredDigits = phoneDigitsByCountry[countryCode] + countryCode.length;

        if (!countryCode) {
            phoneError.textContent = "Please select your country code.";
            phoneError.classList.add("active");
            return false;
        }

        if (!phoneNumber || phoneNumber.length !== requiredDigits) {
            phoneError.textContent = `Phone number must be valid.`;
            phoneError.classList.add("active");
            return false;
        }

        phoneError.textContent = "";
        phoneError.classList.remove("active");
        return true;
    }

    // Collect data from the current form
    function collectFormData(form) {
        const inputs = form.querySelectorAll("input, select");
        inputs.forEach((input) => {
            if (input.name) {
                if (input.type === "checkbox") {
                    // Collect checked checkbox values
                    if (!formData[input.name]) formData[input.name] = [];
                    if (input.checked) {
                        formData[input.name].push(input.value);
                    }
                } else {
                    formData[input.name] = input.value;
                }
            }
        });

        // Convert arrays (checkboxes) to comma-separated strings
        Object.keys(formData).forEach((key) => {
            if (Array.isArray(formData[key])) {
                formData[key] = formData[key].join(", ");
            }
        });
    }

    // Add or remove the "checked" class for checkbox labels
    document.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
        checkbox.addEventListener("change", function () {
            const label = this.closest("label");
            if (label) {
                if (this.checked) {
                    label.classList.add("checked");
                } else {
                    label.classList.remove("checked");
                }
            }
        });
    });

    // Handle final submit
    document.getElementById("submit").addEventListener("click", () => {
        // console.log(formData); // Log all collected form data
        const doneForm = document.querySelector("#done");
        const successMessage = document.createElement("p");
        const loader = doneForm.querySelector('.loader')
        const innerContent = doneForm.querySelector('.inner')
        const errorDiv = doneForm.querySelector('.error')
        innerContent.classList.add('hide')
        loader.classList.remove('hide')
        // fetch(`http://localhost:3000/submit-form`, {
        fetch(`/submit-form`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(response => {
            console.log(response)
            loader.classList.add('hide')
            if (!response.ok) {
                errorDiv.textContent = 'Something went wrong! please try again.'
                errorDiv.classList.add('active')
                setTimeout(() => {
                    formContainer.classList.add('hide')
                }, 2000);
                throw new Error('Network response was not ok');
            }
            successMessage.textContent = "Form submitted successfully!";
            successMessage.classList.add("success-message");
            doneForm.prepend(successMessage);
            console.log('Form Submit successfully!')
            setTimeout(() => {
                formContainer.classList.add('hide')
            }, 2000);
            return response.json();
        })
        .catch(error => {
            errorDiv.textContent = 'Something went wrong! please try again.'
            errorDiv.classList.add('active')
            loader.classList.add('hide')
            setTimeout(() => {
                formContainer.classList.add('hide')
            }, 2000);
            console.error(error)
        });
    });
});
