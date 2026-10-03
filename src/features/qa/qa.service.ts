import { supabase } from '@/lib/supabase/client';
import { normalizeError } from '@/lib/errors/app-error';
import { getCurrentUser } from '@/services/auth/auth.service';
import type { ProductAnswer, ProductQuestion } from './qa.types';

const mapQuestion=(r:any):ProductQuestion=>({id:String(r.id),productId:String(r.product_id),userId:r.user_id?String(r.user_id):undefined,userName:r.profile?.full_name||undefined,question:String(r.question||''),answerCount:Number(r.answer_count??(r.product_answers?.length??0)),createdAt:String(r.created_at)});
const mapAnswer=(r:any):ProductAnswer=>({id:String(r.id),questionId:String(r.question_id),userId:r.user_id?String(r.user_id):undefined,userName:r.profile?.full_name||undefined,body:String(r.body||''),isOfficial:Boolean(r.is_official),createdAt:String(r.created_at)});

export async function listQuestions(productId:string):Promise<ProductQuestion[]> {
  if(!supabase) return [{id:'demo-q1',productId,userName:'خریدار Mobilex',question:'آیا این محصول گارانتی دارد؟',answerCount:1,createdAt:new Date(Date.now()-86400000*4).toISOString()}];
  const {data,error}=await supabase.from('product_questions').select('id,product_id,user_id,question,answer_count,created_at,profile:profiles(full_name)').eq('product_id',productId).eq('status','published').order('created_at',{ascending:false}).limit(50);
  if(error) throw normalizeError(error); return (data??[]).map(mapQuestion);
}

export async function listAnswers(questionId:string):Promise<ProductAnswer[]> {
  if(!supabase) return [{id:'demo-a1',questionId,userName:'پشتیبانی Mobilex',body:'شرایط گارانتی در صفحه محصول و هنگام Checkout نمایش داده می‌شود.',isOfficial:true,createdAt:new Date(Date.now()-86400000*3).toISOString()}];
  const {data,error}=await supabase.from('product_answers').select('id,question_id,user_id,body,is_official,created_at,profile:profiles(full_name)').eq('question_id',questionId).eq('status','published').order('created_at',{ascending:true});
  if(error) throw normalizeError(error); return (data??[]).map(mapAnswer);
}

export async function createQuestion(productId:string,question:string):Promise<ProductQuestion>{
  const user=await getCurrentUser(); if(!user) throw new Error('AUTH_REQUIRED');
  if(!supabase) return {id:`local-q-${Date.now()}`,productId,userId:user.id,userName:user.email,question:question.trim(),answerCount:0,createdAt:new Date().toISOString()};
  const {data,error}=await supabase.from('product_questions').insert({product_id:productId,user_id:user.id,question:question.trim(),status:'pending'}).select('id,product_id,user_id,question,answer_count,created_at').single();
  if(error) throw normalizeError(error); return mapQuestion(data);
}
