import unittest,json
from pathlib import Path
from analyze_report import analyze,srm_probability,wilson
PLAN=json.loads((Path(__file__).parent/'contact-cta-v1/plan.json').read_text())
def report(na,ka,nb,kb,**quality):return {'experiment_id':PLAN['experiment_id'],'variants':{'A':{'exposed_visitors':na,'intent_visitors':ka},'B':{'exposed_visitors':nb,'intent_visitors':kb}},'quality':{'conflicted_visitors':0,'invalid_attribution_events':0,**quality}}
class AnalysisTests(unittest.TestCase):
 def test_empty_unknown(self):
  r=analyze(report(0,0,0,0),PLAN);self.assertIsNone(r['arms']['A']['intent_rate']);self.assertIsNone(r['planned_test_p_value']);self.assertEqual(r['status'],'not_interpretable_yet')
 def test_small_counts_not_winner(self):
  r=analyze(report(1,1,1,0),PLAN,True);self.assertIn('insufficient_sample',r['limitations']);self.assertIsNone(r['planned_test_p_value'])
 def test_full_equal_rates(self):
  r=analyze(report(4000,80,4000,80),PLAN,True);self.assertEqual(r['status'],'planned_comparison_available');self.assertEqual(r['planned_test_p_value'],1);self.assertEqual(r['absolute_difference_B_minus_A'],0)
 def test_fixed_sample_detects_meaningful_fixture_difference(self):
  r=analyze(report(4000,80,4000,120),PLAN,True);self.assertLess(r['planned_test_p_value'],.05);self.assertGreater(r['difference_interval'][0],0)
 def test_imbalanced_traffic_invalidates(self):
  r=analyze(report(5000,100,4000,120),PLAN,True);self.assertIn('sample_ratio_mismatch',r['limitations']);self.assertIsNone(r['planned_test_p_value'])
 def test_quality_issues_invalidate(self):
  r=analyze(report(4000,80,4000,120,conflicted_visitors=1),PLAN,True);self.assertIn('collection_quality_review_required',r['limitations'])
 def test_window_required(self):self.assertIn('planned_time_window_not_confirmed',analyze(report(4000,80,4000,120),PLAN)['limitations'])
 def test_count_validation(self):
  with self.assertRaises(ValueError):analyze(report(10,11,10,1),PLAN)
  with self.assertRaises(ValueError):analyze(report(True,0,10,1),PLAN)
 def test_missing_quality_is_not_assumed_clean(self):
  r=report(4000,80,4000,120);r.pop('quality');self.assertIn('collection_quality_unknown',analyze(r,PLAN,True)['limitations'])
 def test_exact_srm_small(self):self.assertEqual(srm_probability(0,4),.125);self.assertEqual(srm_probability(2,2),1)
 def test_wilson_bounds(self):self.assertIsNone(wilson(0,0));self.assertEqual(wilson(0,10)[0],0);self.assertLessEqual(wilson(10,10)[1],1)
if __name__=='__main__':unittest.main()
