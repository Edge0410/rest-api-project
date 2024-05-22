const isValidEmailAndPassword = (req, res, next) => {
    const { email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^.{6,}$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: "Invalid password format. Password should have at least 6 characters" });
    }

    next();
}

module.exports = isValidEmailAndPassword;