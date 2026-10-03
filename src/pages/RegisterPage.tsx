import { Eye, EyeOff, User, Mail, KeyRound, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthShell } from '@/components/auth/AuthShell';
import { registerSchema } from '@/lib/validation/schemas';
import { appEnv } from '@/app/config/env';
import { normalizeError } from '@/lib/errors/app-error';
import { routes } from '@/app/routes/routeConfig';
import { registerWithPassword } from '@/services/auth/auth.service';
import { setPageSeo } from '@/lib/seo/seo';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  useEffect(
    () => setPageSeo('ساخت حساب | Mobilex', 'ساخت حساب کاربری در Mobilex.', '/register', { noindex: true }),
    [],
  );
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirm) {
      setError('رمز عبور و تکرار آن یکسان نیست.');
      return;
    }
    const parsed = registerSchema.safeParse({ fullName: name, email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'اطلاعات ثبت‌نام معتبر نیست.');
      return;
    }
    if (!appEnv.isSupabaseConfigured) {
      setError('اتصال Supabase تنظیم نشده است.');
      return;
    }
    setBusy(true);
    try {
      const result = await registerWithPassword(parsed.data.email, parsed.data.password, {
        full_name: parsed.data.fullName,
      });
      if (result.session) {
        navigate(routes.profile, { replace: true });
      } else {
        setSuccess('حساب ساخته شد. اگر تأیید ایمیل فعال باشد، لینک تأیید را بررسی کن.');
      }
    } catch (err) {
      setError(normalizeError(err).message || 'ثبت‌نام انجام نشد.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthShell
      title="حساب خودت را بساز"
      subtitle="چند ثانیه زمان می‌برد؛ بعد همه چیز یکجا در حساب تو خواهد بود."
    >
      <form className="mx-auth-form" onSubmit={submit} noValidate>
        {error && (
          <div className="mx-auth-error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mx-auth-success" role="status">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}
        <div className="mx-auth-field">
          <Input
            label="نام و نام خانوادگی"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="مثلاً علی رضایی"
            leading={<User size={16} />}
          />
        </div>
        <div className="mx-auth-field">
          <Input
            label="ایمیل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            leading={<Mail size={16} />}
          />
        </div>
        <div className="mx-auth-field">
          <Input
            label="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="حداقل ۸ کاراکتر"
            leading={<KeyRound size={16} />}
            trailing={
              <button
                type="button"
                className="mx-auth-eye"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? 'مخفی کردن رمز' : 'نمایش رمز'}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <div className="mx-password-meter">
            <span className={`level-${strength}`}></span>
          </div>
          <small>{strength >= 3 ? 'رمز عبور مناسب' : 'برای امنیت بیشتر، عدد و علامت هم اضافه کن.'}</small>
        </div>
        <div className="mx-auth-field">
          <Input
            label="تکرار رمز عبور"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="تکرار رمز"
            leading={<KeyRound size={16} />}
          />
        </div>
        <label className="mx-auth-check">
          <input required type="checkbox" /> قوانین و حریم خصوصی Mobilex را می‌پذیرم.
        </label>
        <Button type="submit" fullWidth size="lg" loading={busy} icon={<UserPlus size={17} />}>
          ساخت حساب
        </Button>
        <p className="mx-auth-bottom">
          قبلاً حساب ساخته‌ای؟{' '}
          <Link to={routes.login} className="mx-auth-link">
            ورود
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
