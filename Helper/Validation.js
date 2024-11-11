class Validation {
  strength = {
    1: "Very Weak",
    2: "Weak",
    3: "Medium",
    4: "Strong",
  };

  checkStrength(pass) {
    if (pass.length > 15) {
      return "Password is too lengthy";
    } else if (pass.length < 8) {
      return "Password is too short";
    }

    let strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!^%*?&]{8,15}$/;

    if (strongRegex.test(pass)) {
      return "Password is strong";
    }

    let count = 0;

    if (/[a-z]/.test(pass)) count++; // Contains lowercase letters
    if (/[A-Z]/.test(pass)) count++; // Contains uppercase letters
    if (/\d/.test(pass)) count++; // Contains numbers
    if (/[!@#$%^&*.?]/.test(pass)) count++; // Contains special characters

    // Return password and strength level based on `count`
    return "Password is " + strength[count];
  }

  validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };
}

module.exports = Validation;
