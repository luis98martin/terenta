import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeRentaCard } from "@/components/TeRentaCard";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";

export default function Auth() {
  const { mode } = useParams<{ mode: 'login' | 'register' }>();
  const navigate = useNavigate();
  const isLogin = mode === 'login';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement authentication with Supabase
    // For now, redirect to main app
    navigate('/');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-foreground mr-3"
            asChild
          >
            <Link to="/">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          
          <h1 className="text-2xl font-semibold text-foreground">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
        </div>

        {/* Form Card */}
        <TeRentaCard className="animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-card-foreground">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-card-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    required
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="mustard"
              size="lg"
              className="w-full mt-6"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Switch mode */}
          <div className="mt-6 text-center">
            <p className="text-text-secondary text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              {' '}
              <Link
                to={isLogin ? '/auth/register' : '/auth/login'}
                className="text-accent font-medium hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </Link>
            </p>
          </div>
        </TeRentaCard>
      </div>
    </div>
  );
}