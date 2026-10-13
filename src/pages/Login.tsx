import { useState } from "react"
import Screen from "../components/Screen"
import Input from "../components/Input"
import Button from "../components/Button"
import { useAuth } from "../lib/auth"

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password)

    setLoading(false)
    if (error) setError(error)
  }

  return (
    <Screen>
      <div className="auth-header">
        <div className="auth-logo">🏠</div>
        <h1 className="auth-title">Hearth</h1>
        <p className="auth-subtitle">
          {isSignUp ? "Create your account" : "Welcome back"}
        </p>
      </div>

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
      />

      {error && <div className="auth-error">{error}</div>}

      <Button onClick={handleSubmit} disabled={!email || !password || loading}>
        {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
      </Button>

      <button
        className="auth-toggle"
        onClick={() => {
          setIsSignUp(!isSignUp)
          setError(null)
        }}
      >
        {isSignUp
          ? "Already have an account? Sign in"
          : "Don't have an account? Sign up"}
      </button>
    </Screen>
  )
}
