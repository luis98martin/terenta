import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeRentaCard } from "@/components/TeRentaCard";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Auth() {
  const { mode } = useParams<{ mode: 'login' | 'register' }>();
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const isLogin = mode === 'login';
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    country: '',
    confirmPassword: ''
  });

  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: t('auth.errorSigningIn'),
            description: error.message,
            variant: "destructive",
          });
        } else {
          // If coming from an invite link, join automatically
          const pending = localStorage.getItem('pending_join_code');
          if (pending) {
            try {
              const { data: groupId, error: joinError } = await supabase.rpc('join_group', { invite_code: pending });
              if (joinError) throw joinError;
              localStorage.removeItem('pending_join_code');
              toast({ title: 'Joined group!', description: 'Welcome to your new group.' });
              navigate(`/groups/${groupId}`);
              return;
            } catch (e: any) {
              toast({ title: 'Invite join failed', description: e.message || 'Please try again', variant: 'destructive' });
            }
          }
          navigate('/');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: t('auth.passwordsDontMatch'),
            description: t('auth.passwordsMatchError'),
            variant: "destructive",
          });
          return;
        }
        
        const { error } = await signUp(formData.email, formData.password, {
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          birth_date: formData.birthDate,
          country: formData.country,
          display_name: `${formData.firstName} ${formData.lastName}`
        });
        if (error) {
          toast({
            title: t('auth.errorCreatingAccount'),
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: t('auth.accountCreated'),
            description: t('auth.checkEmailVerify'),
          });
          navigate('/auth/login');
        }
      }
    } catch (error) {
      toast({
        title: t('chat.somethingWrong'),
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Check username availability
    if (field === 'username' && value.length >= 3) {
      checkUsernameAvailability(value);
    } else if (field === 'username') {
      setUsernameAvailable(null);
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    setUsernameChecking(true);
    console.log('Checking username:', username);
    try {
      // Use RPC function for more reliable checking
      const { data, error } = await supabase.rpc('check_username_availability', {
        username_input: username.toLowerCase()
      });
      
      console.log('Username check result:', { data, error, username });
      
      if (error) {
        console.error('Database error:', error);
        // Fallback to direct query if RPC doesn't exist
        const { data: profiles, error: queryError } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', username.toLowerCase())
          .limit(1);
        
        console.log('Fallback query result:', { profiles, queryError });
        
        if (queryError) {
          console.error('Fallback query error:', queryError);
          setUsernameAvailable(null);
        } else {
          setUsernameAvailable(profiles.length === 0);
        }
      } else {
        // RPC returned result
        setUsernameAvailable(data);
      }
    } catch (error) {
      console.error('Network error:', error);
      setUsernameAvailable(null);
    } finally {
      setUsernameChecking(false);
    }
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
            {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
          </h1>
        </div>

        {/* Form Card */}
        <TeRentaCard className="animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-card-foreground">
                    {t('auth.username')}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
                    <Input
                      id="username"
                      type="text"
                      placeholder={t('auth.usernamePlaceholder')}
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="pl-10 h-12 rounded-xl"
                      required
                    />
                    {usernameChecking && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      </div>
                    )}
                  </div>
                  {usernameAvailable === false && (
                    <p className="text-xs text-red-500">{t('auth.usernameUnavailable')}</p>
                  )}
                  {usernameAvailable === true && (
                    <p className="text-xs text-green-500">{t('auth.usernameAvailable')}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-card-foreground">
                      {t('auth.firstName')}
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder={t('auth.firstNamePlaceholder')}
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-card-foreground">
                      {t('auth.lastName')}
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder={t('auth.lastNamePlaceholder')}
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-card-foreground">
                    {t('auth.birthDate')}
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-card-foreground">
                    {t('auth.country')}
                  </Label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-3 border border-border rounded-xl bg-background"
                    required
                  >
                    <option value="">{t('auth.selectCountry')}</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="ES">Spain</option>
                    <option value="IT">Italy</option>
                    <option value="AU">Australia</option>
                    <option value="NZ">New Zealand</option>
                    <option value="JP">Japan</option>
                    <option value="KR">South Korea</option>
                    <option value="CN">China</option>
                    <option value="IN">India</option>
                    <option value="BR">Brazil</option>
                    <option value="MX">Mexico</option>
                    <option value="AR">Argentina</option>
                    <option value="ZA">South Africa</option>
                    <option value="EG">Egypt</option>
                    <option value="NG">Nigeria</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">
                {t('auth.email')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-foreground">
                {t('auth.password')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
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
                  {t('auth.confirmPassword')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t('auth.confirmPasswordPlaceholder')}
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
              variant="brand-hero"
              size="lg"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? t('auth.loading') : (isLogin ? t('auth.signIn') : t('auth.createAccount'))}
            </Button>
          </form>

          {/* Switch mode */}
          <div className="mt-6 text-center">
            <p className="text-text-secondary text-sm">
              {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
              {' '}
              <Link
                to={isLogin ? '/auth/register' : '/auth/login'}
                className="text-accent font-medium active:underline"
              >
                {isLogin ? t('auth.signUp') : t('auth.signIn')}
              </Link>
            </p>
          </div>
        </TeRentaCard>
      </div>
    </div>
  );
}