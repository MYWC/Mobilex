import { Eye, EyeOff, LogIn, Mail, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthShell } from '@/components/auth/AuthShell';
import { useAuthStore } from '@/stores/useAuthStore';
import { loginSchema } from '@/lib/validation/schemas';
import { normalizeError } from '@/lib/errors/app-error';
import { appEnv } from '@/app/config/env';
import { routes } from '@/app/routes/routeConfig';
import { setPageSeo } from '@/lib/seo/seo';
import { useEffect } from 'react';
import { signInWithPassword } from '@/services/auth/auth.service';

export function LoginPage(){
  const navigate=useNavigate(); const location=useLocation();
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [show,setShow]=useState(false); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  useEffect(()=>setPageSeo('ورود | Mobilex','ورود امن به حساب Mobilex.','/login',{noindex:true}),[]);
  const next=new URLSearchParams(location.search).get('next') || routes.profile;
  const submit=async(e:FormEvent)=>{e.preventDefault();setError(''); const parsed=loginSchema.safeParse({email,password}); if(!parsed.success){setError(parsed.error.issues[0]?.message ?? 'اطلاعات ورود معتبر نیست.');return;} if(!appEnv.isSupabaseConfigured){setError('اتصال Supabase تنظیم نشده است. ابتدا متغیرهای محیطی پروژه را تنظیم کن.');return;} setBusy(true); try{await signInWithPassword(parsed.data.email,parsed.data.password); navigate(next,{replace:true});}catch(err){setError(normalizeError(err).message || 'ورود انجام نشد.');}finally{setBusy(false)}};
  return <AuthShell title="خوش آمدی 👋" subtitle="برای ادامه خرید و مدیریت حساب، وارد Mobilex شو.">
    <form className="mx-auth-form" onSubmit={submit} noValidate>
      {error&&<div className="mx-auth-error" role="alert"><AlertCircle size={16}/><span>{error}</span></div>}
      <div className="mx-auth-field"><Input label="ایمیل" value={email} onChange={e=>setEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" leading={<Mail size={16}/>} /></div>
      <label className="mx-auth-field"><span>رمز عبور</span><div className="mx-auth-input-wrap"><KeyRound size={16}/><Input value={password} onChange={e=>setPassword(e.target.value)} type={show?'text':'password'} autoComplete="current-password" placeholder="حداقل ۸ کاراکتر" aria-label="رمز عبور" /><button type="button" className="mx-auth-eye" onClick={()=>setShow(v=>!v)} aria-label={show?'مخفی کردن رمز':'نمایش رمز'}>{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label>
      <div className="mx-auth-row"><label className="mx-auth-check"><input type="checkbox"/> مرا به خاطر بسپار</label><Link to={routes.forgotPassword} className="mx-auth-link">رمز را فراموش کرده‌ای؟</Link></div>
      <Button type="submit" fullWidth size="lg" loading={busy} icon={<LogIn size={17}/>}>ورود به حساب</Button>
      <div className="mx-auth-divider"><span>یا</span></div>
      <Button type="button" variant="soft" fullWidth icon={<ArrowLeft size={16}/>} onClick={()=>navigate(routes.register)}>ساخت حساب جدید</Button>
      {!appEnv.isSupabaseConfigured&&<div className="mx-auth-demo-note">محیط فعلی بدون Supabase است؛ فرم صرفاً آماده اتصال است.</div>}
    </form>
  </AuthShell>
}
