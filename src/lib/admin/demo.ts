import type { AdminDashboardData, AdminOrderRow, AdminProductRow, AdminUserRow, AuditLogRow, ContentBanner, ContentBlock, InventoryRow } from '@/types/admin';

const names = ['iPhone 17 Pro Max', 'Galaxy S26 Ultra', 'Xiaomi 16 Pro', 'Pixel 11 Pro', 'AirPods Pro 3'];

export function demoDashboard(): AdminDashboardData {
  const now = Date.now();
  const revenue = Array.from({ length: 14 }, (_, index) => {
    const d = new Date(now - (13 - index) * 86400000);
    return { date: d.toISOString().slice(0, 10), revenue: 4200000 + index * 380000 + (index % 3) * 240000, orders: 7 + (index % 5) };
  });
  return {
    metrics: [
      { key: 'revenue', label: 'فروش امروز', value: 98750000, delta: 12.8, tone: 'primary', format: 'currency' },
      { key: 'orders', label: 'سفارش‌های امروز', value: 47, delta: 8.4, tone: 'success', format: 'number' },
      { key: 'customers', label: 'مشتریان فعال', value: 12840, delta: 4.2, tone: 'info', format: 'number' },
      { key: 'conversion', label: 'نرخ تبدیل', value: 4.8, delta: 0.7, tone: 'warning', format: 'percent' },
    ],
    revenue,
    topProducts: names.map((name, i) => ({ productId: `demo-${i}`, name, units: 92 - i * 11, revenue: 27500000 - i * 3100000, stock: 14 + i * 5 })),
    lowStock: [
      { id: 'l1', name: 'AirPods Pro 3', stock: 2, threshold: 8 },
      { id: 'l2', name: 'Galaxy S26 Ultra 512GB', stock: 4, threshold: 7 },
      { id: 'l3', name: 'USB-C 240W Cable', stock: 3, threshold: 12 },
    ],
    recentOrders: Array.from({ length: 6 }, (_, i) => ({ id: `od-${i}`, orderNumber: `MX-${104820 - i}`, customerName: ['علی رضایی','سارا احمدی','محمد کریمی','مینا حسینی','امیر نادری','نگار موسوی'][i], status: (['paid','processing','shipped','delivered','pending_payment','packed'] as const)[i], paymentStatus: (['paid','paid','paid','paid','pending','paid'] as const)[i], totalAmount: 1890000 + i * 420000, createdAt: new Date(now - i * 7200000).toISOString() })),
    ordersByStatus: [
      { status: 'delivered', count: 238 }, { status: 'shipped', count: 71 }, { status: 'processing', count: 54 }, { status: 'pending_payment', count: 12 }, { status: 'cancelled', count: 18 },
    ],
  };
}

export function demoProducts(): AdminProductRow[] {
  return Array.from({ length: 18 }, (_, i) => ({ id: `p-${i}`, name: names[i % names.length], sku: `MX-${1000+i}`, price: 45000000 + i * 1750000, salePrice: i % 3 === 0 ? 43000000 + i * 1700000 : undefined, stock: 3 + ((i * 7) % 35), isActive: i % 8 !== 0, updatedAt: new Date(Date.now() - i * 3600000).toISOString(), brand: ['Apple','Samsung','Xiaomi','Google'][i%4], category: 'موبایل' }));
}
export function demoOrders(): AdminOrderRow[] { return demoDashboard().recentOrders.map((x, i) => ({ id:x.id, orderNumber:x.orderNumber, userId:`u-${i}`, customerName:x.customerName, status:x.status, paymentStatus:x.paymentStatus, paymentMethod:'online', shippingMethod:'standard', totalAmount:x.totalAmount, itemCount:1+(i%4), createdAt:x.createdAt, updatedAt:x.createdAt })); }
export function demoUsers(): AdminUserRow[] { return ['علی رضایی','سارا احمدی','محمد کریمی','مینا حسینی','امیر نادری','نگار موسوی','ادمین Mobilex','اپراتور انبار'].map((fullName,i)=>({id:`user-${i}`,email:`user${i}@example.com`,fullName,phone:`0912${(1234567+i).toString()}`,role:(['customer','customer','support','customer','warehouse','customer','admin','warehouse'] as const)[i],createdAt:new Date(Date.now()-(30-i)*86400000).toISOString()})); }
export function demoAudit(): AuditLogRow[] { return Array.from({length:14},(_,i)=>({id:`a-${i}`,actorId:`u-${i%4}`,actorName:['مدیر سیستم','اپراتور انبار','پشتیبانی'][i%3],action:['update_order_status','adjust_inventory','update_product','update_user_role'][i%4],entityType:['order','inventory','product','user'][i%4],entityId:`MX-${104830-i}`,severity:(['success','info','warning','danger'] as const)[i%4],summary:['وضعیت سفارش تغییر کرد','موجودی اصلاح شد','محصول ویرایش شد','نقش کاربر تغییر کرد'][i%4],createdAt:new Date(Date.now()-i*3600000).toISOString()})); }
export function demoBanners(): ContentBanner[] { return [{id:'b1',title:'نسل جدید موبایل رسید',subtitle:'انتخاب‌های تازه Mobilex',imageUrl:'',href:'/products',placement:'home_hero',sortOrder:1,isActive:true},{id:'b2',title:'ارسال رایگان',subtitle:'برای سفارش‌های واجد شرایط',imageUrl:'',href:'/products',placement:'home_strip',sortOrder:2,isActive:true}]; }
export function demoContent(): ContentBlock[] { return [{id:'c1',key:'home.trust',title:'خرید مطمئن با Mobilex',body:'ضمانت اصالت، ارسال سریع و پشتیبانی حرفه‌ای.',kind:'feature',isActive:true,updatedAt:new Date().toISOString()},{id:'c2',key:'home.announcement',title:'پیشنهادهای ویژه',body:'تخفیف‌های محدود هر هفته.',kind:'announcement',isActive:true,updatedAt:new Date().toISOString()}]; }
export function demoInventory(): InventoryRow[] { return demoProducts().slice(0,10).map(p=>({id:`inv-${p.id}`,productId:p.id,productName:p.name,sku:p.sku,stock:p.stock,threshold:10,updatedAt:p.updatedAt})); }
