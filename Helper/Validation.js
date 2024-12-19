class Validation {
  strength = {
    1: "Very Weak",
    2: "Weak",
    3: "Medium",
    4: "Strong",
  };

  checkStrength(pass) {
    if (pass.length > 30) {
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
    return "Password is " + this.strength[count];
  }

  validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  validateImage(file) {
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 10 * 1024 * 1024; // 10 MB limit

    if (!allowedImageTypes.includes(file.mimetype)) {
      throw Error("Invalid image file type. Only JPEG, PNG, and GIF are allowed.");
    }

    if (file.size > maxSize) {
      throw Error("Image file size exceeds 5 MB.");
    }

    return true;
  }

  validateVideo(file) {
    const allowedVideoTypes = ["video/mp4", "video/avi", "video/mkv"];
    const maxSize = 50 * 1024 * 1024; // 50 MB limit

    if (!allowedVideoTypes.includes(file.mimetype)) {
      throw Error("Invalid video file type. Only MP4, AVI, and MKV are allowed.");
    }

    if (file.size > maxSize) {
      throw Error("Video file size exceeds 50 MB.");
    }

    return true;
  }
}

module.exports = Validation;
