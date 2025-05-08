import supabase from '@/core/lib/supabaseClient';

export const impactService = {
  async getImpactMetrics() {
    const { data, error } = await supabase
      .from('impact_metrics')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

export default impactService; 