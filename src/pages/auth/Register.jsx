import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/auth";
import "./AuthForm.css";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasMinLength = password.length >= 6;
  const hasNumberAndSymbol =
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>_\-+=[\]/\\~`]/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);

  const isPasswordValid = hasMinLength && hasLetter && hasNumberAndSymbol;

  const isFormValid =
    name.trim() !== "" && email.trim() !== "" && isPasswordValid;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await registerUser({ name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Register</h1>

        {error && <p className="auth-error">{error}</p>}

        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          placeholder="Enter your name here"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {password.length > 0 && (
          <ul className="password-rules">
            <li className={hasMinLength ? "valid" : "invalid"}>
              Password must be at least 6 characters
            </li>
            <li className={hasLetter ? "valid" : "invalid"}>
              Must include alphabets
            </li>
            <li className={hasNumberAndSymbol ? "valid" : "invalid"}>
              Must contain numbers &amp; special characters (!@#$%...)
            </li>
          </ul>
        )}

        <button type="submit" disabled={!isFormValid || isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </button>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}