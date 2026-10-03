import { useState } from 'react';
import { Check, Info, LoaderCircle, Search, Sparkles, TriangleAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { Tooltip } from '@/components/ui/Tooltip';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Progress } from '@/components/ui/Progress';
import { Avatar } from '@/components/ui/Avatar';
import { Accordion } from '@/components/ui/Accordion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StatusPill } from '@/components/ui/StatusPill';

export function UILabPage() {
  const [modal,setModal]=useState(false); const [drawer,setDrawer]=useState(false);
  return <div className="mx-page">
    <div className="mx-shell">
      <SectionHeading eyebrow="PHASE 2 · DESIGN SYSTEM" title="Mobilex UI Laboratory" description="ویترین زنده‌ی قراردادهای بصری و کامپوننت‌های قابل استفاده مجدد پروژه." />
      <div className="mx-lab-grid">
        <Card className="mx-lab-card"><h3>Buttons</h3><div className="mx-lab-row"><Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="soft">Soft</Button><Button variant="ghost">Ghost</Button><Button variant="danger">Danger</Button><Button variant="glass">Glass</Button></div><div className="mx-lab-row"><Button size="sm">Small</Button><Button size="lg">Large</Button><Button loading>Loading</Button></div></Card>
        <Card className="mx-lab-card"><h3>Badges & status</h3><div className="mx-lab-row wrap"><Badge tone="neutral">Neutral</Badge><Badge tone="primary">Primary</Badge><Badge tone="success" dot pulse>Live</Badge><Badge tone="warning">Limited</Badge><Badge tone="danger">Sale</Badge><StatusPill tone="info">Information</StatusPill><StatusPill tone="success">Healthy</StatusPill></div></Card>
        <Card className="mx-lab-card"><h3>Form controls</h3><div className="mx-form-grid"><Input label="جستجو" placeholder="iPhone 17…" leading={<Search size={16}/>} /><Select label="دسته‌بندی" defaultValue="phone"><option value="phone">گوشی موبایل</option><option value="accessory">لوازم جانبی</option></Select></div></Card>
        <Card className="mx-lab-card"><h3>Surfaces</h3><div className="mx-surface-grid"><GlassPanel intensity="soft" className="mx-surface-demo">Soft glass</GlassPanel><GlassPanel intensity="medium" className="mx-surface-demo">Medium glass</GlassPanel><GlassPanel intensity="strong" className="mx-surface-demo">Strong glass</GlassPanel></div></Card>
        <Card className="mx-lab-card"><h3>States</h3><div className="mx-state-demo"><Skeleton className="demo-avatar"/><div className="state-copy"><Skeleton className="line w-55"/><Skeleton className="line w-85"/><Skeleton className="line w-65"/></div></div><div className="mx-feedback-row"><span className="mx-feedback success"><Check size={15}/>Success</span><span className="mx-feedback info"><Info size={15}/>Info</span><span className="mx-feedback warning"><TriangleAlert size={15}/>Warning</span><span className="mx-feedback danger"><X size={15}/>Danger</span></div></Card>
        <SpotlightCard className="mx-lab-card" intensity="strong"><h3>Advanced surfaces</h3><div className="mx-lab-row"><Avatar name="Mobilex Core" status="online"/><Avatar name="UI" size="lg"/><Progress value={78} label="Design system"/></div><div style={{marginTop:12}}><Accordion single items={[{id:"motion",title:"Motion architecture",content:"Transitions, hover states and reduced-motion behavior share one contract."},{id:"theme",title:"Theme architecture",content:"Light, dark and system modes resolve through global design tokens."}]}/></div></SpotlightCard><Card className="mx-lab-card"><h3>Overlays & interaction</h3><div className="mx-lab-row"><Button icon={<Sparkles size={15}/>} onClick={()=>setModal(true)}>Open modal</Button><Button variant="secondary" onClick={()=>setDrawer(true)}>Open drawer</Button><Tooltip label="Micro interaction ready"><Button variant="ghost">Hover me</Button></Tooltip></div></Card>
      </div>
    </div>
    <Modal open={modal} onClose={()=>setModal(false)} title="Design System Modal" description="نمونه modal مرکزی برای confirm، فرم و اطلاعات تکمیلی." footer={<><Button variant="ghost" onClick={()=>setModal(false)}>انصراف</Button><Button onClick={()=>setModal(false)} icon={<Check size={15}/>}>تأیید</Button></>}><div className="mx-modal-demo"><LoaderCircle size={18} className="spin"/><p>این overlay از focus، Escape و lock کردن scroll صفحه پشتیبانی می‌کند.</p></div></Modal>
    <Drawer open={drawer} onClose={()=>setDrawer(false)} title="Quick Actions"><div className="mx-drawer-list"><button><Sparkles size={16}/> شخصی‌سازی ظاهر</button><button><Search size={16}/> مدیریت جستجو</button><button><Check size={16}/> بررسی سلامت سیستم</button></div></Drawer>
  </div>;
}
