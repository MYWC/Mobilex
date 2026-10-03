import { supabase } from '@/lib/supabase/client';
import { normalizeError } from '@/lib/errors/app-error';
import { getCurrentUser } from '@/services/auth/auth.service';

export async function requestPasswordReset():Promise<void>{const user=await getCurrentUser();const email=user?.email;if(!email||!supabase)throw new Error('NO_EMAIL');const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${location.origin}/forgot-password`});if(error)throw normalizeError(error)}
export async function updatePassword(password:string):Promise<void>{if(!supabase)throw new Error('SUPABASE_REQUIRED');const {error}=await supabase.auth.updateUser({password});if(error)throw normalizeError(error)}
export async function signOutAllSessions():Promise<void>{if(!supabase)throw new Error('SUPABASE_REQUIRED');const {error}=await supabase.auth.signOut({scope:'global'});if(error)throw normalizeError(error)}
