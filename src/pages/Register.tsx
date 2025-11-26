import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [mobile_no, setMobileNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // ⭐ Friendly Error Mapper Function
  const friendlyMessage = (msg: string) => {
    msg = msg?.toLowerCase() || "";

    if (msg.includes("email") && msg.includes("invalid"))
      return "Please enter a valid email address.";

    if (msg.includes("email") && msg.includes("exist"))
      return "This email is already registered.";

    if (msg.includes("mobile") && msg.includes("exist"))
      return "This mobile number is already in use.";

    if (msg.includes("password") && msg.includes("short"))
      return "Password must be at least 6 characters.";

    if (msg.includes("password") && msg.includes("not match"))
      return "Passwords do not match.";

    return "Something went wrong. Please try again.";
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend Validation
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await signup(email, mobile_no, password, confirmPassword);

      toast.success("Account created! Please verify your OTP.");
      navigate("/verify-otp", { state: { email } });

    } catch (error: any) {
      const backendMsg = error.response?.data?.error || error.response?.data?.message || error.message;
      toast.error(friendlyMessage(backendMsg));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <Camera className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Get started with Photolelo today</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile_no">Mobile Number</Label>
              <Input
                id="mobile_no"
                type="tel"
                placeholder="9876543210"
                value={mobile_no}
                onChange={(e) => setMobileNo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </a>
            </div>

          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
