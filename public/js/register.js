function checkConfirmPassword(formId) {
  const password = document.querySelector(`#${formId} [name=password]`);
  const confirmPassword = document.querySelector(
    `#${formId} [name=confirmPassword]`
  );

  if (password.value != confirmPassword.value) {
    confirmPassword.setCustomValidity("Passwords not match!");
    confirmPassword.reportValidity();
  } else {
    confirmPassword.setCustomValidity("");
  }
}
