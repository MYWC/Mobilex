import { Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { ProductImage } from '@/types/catalog';
import { Modal } from '@/components/ui/Modal';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/ui/cn';
export function ProductGallery({images,name}:{images:ProductImage[];name:string}){
 const safe=images.length?images:[{url:'',isMain:true}]; const [index,setIndex]=useState(0); const [open,setOpen]=useState(false); const current=safe[index];
 const step=(delta:number)=>setIndex((i)=>(i+delta+safe.length)%safe.length);
 return <div className="mx-gallery"><div className="mx-gallery-main">{current.url?<img src={current.url} alt={name}/>:<div className="mx-gallery-empty">Mobilex</div>}<button type="button" className="mx-gallery-expand" onClick={()=>setOpen(true)}><Maximize2 size={17}/></button>{safe.length>1&&<><IconButton label="Previous" className="mx-gallery-prev" onClick={()=>step(-1)}><ChevronLeft size={18}/></IconButton><IconButton label="Next" className="mx-gallery-next" onClick={()=>step(1)}><ChevronRight size={18}/></IconButton></>}</div>{safe.length>1&&<div className="mx-gallery-thumbs">{safe.map((img,i)=><button key={`${img.url}-${i}`} type="button" className={cn('mx-gallery-thumb',i===index&&'is-active')} onClick={()=>setIndex(i)}>{img.url?<img src={img.url} alt=""/>:<span/>}</button>)}</div>}<Modal open={open} onClose={()=>setOpen(false)} title={name} size="xl"><div className="mx-gallery-lightbox">{current.url&&<img src={current.url} alt={name}/>}</div></Modal></div>
}
