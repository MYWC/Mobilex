import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthShell } from '@/components/auth/AuthShell';
import { emailSchema } from '@/lib/validation/schemas';
import { sendPasswordReset } from '@/services/auth/auth.service';
import { appEnv } from '@/app/config/env';
import { routes } from '@/app/routes/routeConfig';
import { normalizeError } from '@/lib/errors/app-error';
import { setPageSeo } from '@/lib/seo/seo';
import { resolveAppUrl } from '@/lib/ux/paths';

export function ForgotPasswordPage(){
 const [email,setEmail]=useState(''); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [success,setSuccess]=useState(false);
 useEffect(()=>setPageSeo('بازیابی رمز عبور | Mobilex','بازیابی دسترسی به حساب Mobilex.','/forgot-password',{noindex:true}),[]);
 const submit=async(e:FormEvent)=>{e.preventDefault();setError('');setSuccess(false);const parsed=emailSchema.safeParse(email);if(!parsed.success){setError('یک ایمیل معتبر وارد کن.');return;}if(!appEnv.isSupabaseConfigured){setError('اتصال Supabase تنظیم نشده است.');return;}setBusy(true);try{await sendPasswordReset(parsed.data,resolveAppUrl(routes.security));setSuccess(true)}catch(err){setError(normalizeError(err).message||'ارسال لینک بازیابی ناموفق بود.')}finally{setBusy(false)}};
 return <AuthShell title="رمز عبورت یادت رفته؟" subtitle="ایمیل حساب را وارد کن تا لینک بازیابی برایت ارسال شود.">
  <form className="mx-auth-form" onSubmit={submit} noValidate>
   {error&&<div className="mx-auth-error" role="alert"><AlertCircle size={16}/><span>{error}</span></div>}
   {success&&<div className="mx-auth-success" role="status"><CheckCircle2 size={16}/><span>لینک بازیابی ارسال شد. صندوق ورودی و Spam را بررسی کن.</span></div>}
   <div className="mx-auth-field"><Input label="ایمیل حساب" value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@example.com" leading={<Mail size={16}/>} /></div>
   <Button type="submit" fullWidth size="lg" loading={busy} icon={<Send size={17}/>}>ارسال لینک بازیابی</Button>
   <p className="mx-auth-bottom"><Link to={routes.login} className="mx-auth-link">بازگشت به ورود</Link></p>
  </form>
 </AuthShell>
}
