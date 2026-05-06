import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAnalytics() {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    const trackVisit = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

        // Check if we already tracked this user today
        const visitorId = localStorage.getItem('amrmp_visitor_id');
        const lastVisit = localStorage.getItem('amrmp_last_visit');

        if (lastVisit === today && visitorId) {
          // Already tracked today, just increment page views
          const { error } = await supabase.rpc('increment_page_views', { visit_date: today });
          if (error) {
            console.error('Analytics increment error:', error);
          }
          return;
        }

        // New visitor or new day
        const newVisitorId = visitorId || crypto.randomUUID();
        localStorage.setItem('amrmp_visitor_id', newVisitorId);
        localStorage.setItem('amrmp_last_visit', today);

        // Insert or update analytics record
        const { error } = await supabase
          .from('analytics')
          .upsert(
            {
              date: today,
              unique_visitors: 1,
              page_views: 1,
            },
            {
              onConflict: 'date',
              ignoreDuplicates: false,
            }
          );

        if (error) {
          console.error('Analytics tracking error:', error);
        }
      } catch (error) {
        console.error('Failed to track analytics:', error);
      }
    };

    trackVisit();
  }, []);
}