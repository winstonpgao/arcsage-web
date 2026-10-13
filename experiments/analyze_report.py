"""Offline analysis of a saved collector report; no network or model calls."""
import argparse,json,math
from pathlib import Path
from statistics import NormalDist

def wilson(successes, total, alpha=0.05):
    if not total:return None
    p=successes/total;z=NormalDist().inv_cdf(1-alpha/2);denom=1+z*z/total
    center=(p+z*z/(2*total))/denom
    half=z*math.sqrt(p*(1-p)/total+z*z/(4*total*total))/denom
    return [0.0 if successes==0 else max(0,center-half), 1.0 if successes==total else min(1,center+half)]

def srm_probability(a,b):
    n=a+b
    if not n:return None
    # Exact two-sided Binomial(n, .5) tail. A balanced pair has probability one.
    k=min(a,b)
    if k==n//2:return 1.0
    logs=[];lp=-n*math.log(2)
    for i in range(k+1):
        logs.append(lp)
        if i<k:lp+=math.log(n-i)-math.log(i+1)
    biggest=max(logs)
    return min(1.0,2*math.exp(biggest)*sum(math.exp(x-biggest) for x in logs))

def analyze(report,plan,window_completed=False):
    if report.get('experiment_id')!=plan['experiment_id']:raise ValueError('Experiment IDs differ')
    arms={}
    for variant in ('A','B'):
        raw=report['variants'][variant];n=raw['exposed_visitors'];k=raw['intent_visitors']
        if type(n) is not int or type(k) is not int or not 0<=k<=n:raise ValueError('Invalid unique visitor counts')
        arms[variant]={'exposed_visitors':n,'intent_visitors':k,'intent_rate':k/n if n else None,'wilson_interval':wilson(k,n,plan['alpha'])}
    a,b=arms['A'],arms['B'];srm=srm_probability(a['exposed_visitors'],b['exposed_visitors'])
    quality=report.get('quality',{})
    problems=[]
    quality_keys=('conflicted_visitors','invalid_attribution_events')
    if any(type(quality.get(k)) is not int or quality[k]<0 for k in quality_keys):problems.append('collection_quality_unknown')
    elif any(quality[k] for k in quality_keys):problems.append('collection_quality_review_required')
    if srm is not None and srm<plan['srm_alpha']:problems.append('sample_ratio_mismatch')
    if min(a['exposed_visitors'],b['exposed_visitors'])<plan['minimum_exposed_visitors_per_variant']:problems.append('insufficient_sample')
    if not window_completed:problems.append('planned_time_window_not_confirmed')
    diff=None;interval=None;pvalue=None
    if a['exposed_visitors'] and b['exposed_visitors']:
        pa,pb=a['intent_rate'],b['intent_rate'];diff=pb-pa
        la,ua=a['wilson_interval'];lb,ub=b['wilson_interval']
        interval=[diff-math.hypot(pb-lb,ua-pa),diff+math.hypot(ub-pb,pa-la)]
        pooled=(a['intent_visitors']+b['intent_visitors'])/(a['exposed_visitors']+b['exposed_visitors'])
        expected=[pooled*x['exposed_visitors'] for x in (a,b)]+[(1-pooled)*x['exposed_visitors'] for x in (a,b)]
        if min(expected)<5:problems.append('normal_test_expected_counts_too_small')
        if not problems:
            se=math.sqrt(pooled*(1-pooled)*(1/a['exposed_visitors']+1/b['exposed_visitors']))
            pvalue=math.erfc(abs(diff/se)/math.sqrt(2)) if se else 1.0
    status='not_interpretable_yet' if problems else 'planned_comparison_available'
    conclusion='insufficient evidence for a decision'
    if not problems:
        conclusion='no detected difference in contact intent'
        if pvalue<plan['alpha']:conclusion='higher contact intent for B' if diff>0 else 'higher contact intent for A'
    return {'experiment_id':plan['experiment_id'],'status':status,'arms':arms,'absolute_difference_B_minus_A':diff,'difference_interval':interval,
            'sample_ratio_p_value':srm,'planned_test_p_value':pvalue,'limitations':problems,'conclusion':conclusion,
            'scope':'Contact intent under this browser experiment, not delivered enquiries, sales or GEO exposure. Collection and human traffic validity need operator review.',
            'methods':{'arm_intervals':'Wilson','difference_interval':'Newcombe combination of Wilson intervals','planned_test':'two-sided pooled proportion z test at fixed sample; withheld until gates pass','srm':'exact two-sided Binomial(n, 0.5)'}}

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('report',type=Path)
    parser.add_argument('--plan',type=Path,default=Path(__file__).parent/'contact-cta-v1/plan.json')
    parser.add_argument('--window-completed',action='store_true',help='Confirm the locked minimum calendar window has actually completed; not a bypass for sample/quality checks.')
    args=parser.parse_args()
    print(json.dumps(analyze(json.loads(args.report.read_text()),json.loads(args.plan.read_text()),args.window_completed),indent=2))
if __name__=='__main__':main()
