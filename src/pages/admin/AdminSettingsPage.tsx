import { useEffect, useState } from 'react';
import { BellRing, Save, ShieldCheck, Store, Truck } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
const KEY = 'mobilex-admin-settings-v1';
export function AdminSettingsPage() {
  const [name, setName] = useState('Mobilex');
  const [phone, setPhone] = useState('021-12345678');
  const [support, setSupport] = useState('پشتیبانی همه‌روزه ۹ تا ۲۱');
  const [free, setFree] = useState('5000000');
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      const x = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (x.name) setName(x.name);
      if (x.phone) setPhone(x.phone);
      if (x.support) setSupport(x.support);
      if (x.free) setFree(x.free);
    } catch {}
  }, []);
  const save = () => {
    localStorage.setItem(KEY, JSON.stringify({ name, phone, support, free }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };
  return (
    <AdminShell title="تنظیمات سیستم">
      <div className="mx-settings-grid">
        <Card>
          <div className="mx-settings-head">
            <div className="mx-settings-icon">
              <Store />
            </div>
            <div>
              <h3>هویت فروشگاه</h3>
              <p>اطلاعات عمومی و تماس</p>
            </div>
          </div>
          <div className="mx-admin-form">
            <Input label="نام فروشگاه" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="شماره تماس" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="متن پشتیبانی" value={support} onChange={(e) => setSupport(e.target.value)} />
          </div>
        </Card>
        <Card>
          <div className="mx-settings-head">
            <div className="mx-settings-icon">
              <Truck />
            </div>
            <div>
              <h3>ارسال و سفارش</h3>
              <p>قواعد نمایشی کسب‌وکار</p>
            </div>
          </div>
          <div className="mx-admin-form">
            <Input
              label="آستانه ارسال رایگان"
              value={free}
              onChange={(e) => setFree(e.target.value)}
              inputMode="numeric"
            />
            <label className="mx-switch">
              <input type="checkbox" defaultChecked /> فعال‌بودن سفارش فوری
            </label>
            <label className="mx-switch">
              <input type="checkbox" defaultChecked /> نمایش ETA ارسال
            </label>
          </div>
        </Card>
        <Card>
          <div className="mx-settings-head">
            <div className="mx-settings-icon">
              <BellRing />
            </div>
            <div>
              <h3>اعلان‌ها</h3>
              <p>سیاست اطلاع‌رسانی داخلی</p>
            </div>
          </div>
          <div className="mx-admin-form">
            <label className="mx-switch">
              <input type="checkbox" defaultChecked /> هشدار موجودی کم
            </label>
            <label className="mx-switch">
              <input type="checkbox" defaultChecked /> اعلان سفارش جدید
            </label>
            <label className="mx-switch">
              <input type="checkbox" defaultChecked /> اعلان خطای پرداخت
            </label>
          </div>
        </Card>
        <Card>
          <div className="mx-settings-head">
            <div className="mx-settings-icon">
              <ShieldCheck />
            </div>
            <div>
              <h3>امنیت پنل</h3>
              <p>مقادیر امنیتی در این صفحه ذخیره نمی‌شوند.</p>
            </div>
          </div>
          <div className="mx-admin-form">
            <label className="mx-switch">
              <input type="checkbox" defaultChecked /> ثبت Audit Log برای Actionها
            </label>
            <label className="mx-switch">
              <input type="checkbox" defaultChecked /> جلوگیری از عملیات بدون تأیید
            </label>
          </div>
        </Card>
      </div>
      <div className="mx-settings-save">
        <Button onClick={save} icon={<Save size={14} />}>
          {saved ? 'ذخیره شد ✓' : 'ذخیره تنظیمات'}
        </Button>
      </div>
    </AdminShell>
  );
}
