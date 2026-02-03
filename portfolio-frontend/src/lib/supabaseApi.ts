import { supabase } from './supabase';
import { CreateAssetPayload } from './api';

export const supabaseApi = {
    // Auth
    async signUp(email: string, password: string, name: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });
        if (error) throw error;
        return data;
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Investments
    async getInvestments() {
        const { data, error } = await supabase
            .from('investments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async createInvestment(asset: CreateAssetPayload) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('investments')
            .insert([
                {
                    user_id: userData.user.id,
                    asset_type: asset.category,
                    name: asset.name,
                    symbol: asset.symbol,
                    quantity: asset.quantity,
                    purchase_price: asset.purchasePrice,
                    purchase_date: asset.purchaseDate,
                    notes: asset.notes,
                    maturity_date: asset.maturityDate,
                    expected_return: asset.interestRate,
                    metadata: asset.metadata,
                    currency: asset.currency || 'USD',
                    broker_platform: asset.platform,
                    is_liability: asset.isLiability,
                }
            ])
            .select();

        if (error) throw error;
        return data[0];
    },

    async updatePrice(investmentId: string, currentPrice: number) {
        const { data, error } = await supabase
            .from('investments')
            .update({
                current_price: currentPrice,
                updated_at: new Date().toISOString()
            })
            .eq('id', investmentId)
            .select();

        if (error) throw error;
        return data[0];
    },

    async deleteInvestment(investmentId: string) {
        const { error } = await supabase
            .from('investments')
            .delete()
            .eq('id', investmentId);

        if (error) throw error;
        return { success: true };
    }
};
