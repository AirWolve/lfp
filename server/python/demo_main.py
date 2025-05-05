import sys
import Simulation
import yaml
import numpy as np
import json

def main():
    # Read all lines from stdin
    lines = sys.stdin.readlines()
    if not lines or not "".join(lines).strip():
        print(json.dumps({"error": "No input provided via stdin"}))
        sys.exit(1)

    # 첫 줄: email, 두 번째 줄부터: YAML
    n = 100  # 고정
    email = lines[0].strip()
    yaml_text = "".join(lines[1:])
    
    yaml_data = yaml.safe_load(yaml_text)
    if not yaml_data:
        print(json.dumps({"error": "No YAML text provided"}))
        sys.exit(1)

    financial_goal = yaml_data.get("financialGoal", 0)
    aggregation_threshold = yaml_data.get("aggregationThreshold", 0)  # threshold for stacked bar aggregation

    all_runs = []  # List of [{year: {income, expense, tax, net, ...}}, ...]
    final_assets = []
    all_expense_categories = set()
    all_years = set()

    # 추가: 연도별 값 누적용 dicts
    yearly_assets = {}
    yearly_income = {}
    yearly_expense = {}
    yearly_tax = {}
    yearly_ewtax = {}
    yearly_discr_exp_pct = {}
    yearly_invest_breakdown = {}
    yearly_expense_breakdown = {}

    for i in range(n):
        sim = Simulation.Simulation(yaml_text)
        sim.simulation(None, emailNeed=False)
        yearly = getattr(sim, 'yearly_data', {})
        run_result = {}
        for year, data in yearly.items():
            income = data.get('income', 0)
            expense_dict = data.get('expense', {}) or {}
            tax_dict = data.get('tax', {}) or {}
            tax = sum(tax_dict.values())
            net = income - sum(expense_dict.values()) - tax
            total_assets = data.get('total_assets', 0)
            invest_dict = data.get('invest', {}) or {}
            # early withdrawal tax
            ew_tax = tax_dict.get('early_withdrawal', 0)
            # discretionary expense pct
            discretionary_total = 0
            discretionary_possible = 0
            for cat, val in expense_dict.items():
                if 'discretionary' in cat.lower():
                    discretionary_total += val
                discretionary_possible += val
            discr_exp_pct = (discretionary_total / discretionary_possible) if discretionary_possible > 0 else 0
            # breakdowns
            # 투자 breakdown: invest_dict (카테고리별)
            # 소득 breakdown: income은 event series별 breakdown이 필요하나, 현재 구조상 income 전체만 있음(추후 확장)
            # 지출 breakdown: expense_dict (카테고리별), tax_dict (세금)
            # 연도별 누적
            all_years.add(year)
            yearly_assets.setdefault(year, []).append(total_assets)
            yearly_income.setdefault(year, []).append(income)
            yearly_expense.setdefault(year, []).append(sum(expense_dict.values()))
            yearly_tax.setdefault(year, []).append(tax)
            yearly_ewtax.setdefault(year, []).append(ew_tax)
            yearly_discr_exp_pct.setdefault(year, []).append(discr_exp_pct)
            # breakdown 누적
            for k, v in invest_dict.items():
                yearly_invest_breakdown.setdefault(year, {}).setdefault(k, []).append(v)
            for k, v in expense_dict.items():
                yearly_expense_breakdown.setdefault(year, {}).setdefault(k, []).append(v)
            for k, v in tax_dict.items():
                yearly_expense_breakdown.setdefault(year, {}).setdefault(f"tax_{k}", []).append(v)
            # income breakdown은 구조상 생략(추후 event series별로 확장 가능)
            run_result[year] = {
                'income': income,
                'expense': expense_dict,
                'tax': tax_dict,
                'net': net,
                'total_assets': total_assets,
                'invest': invest_dict
            }
            all_expense_categories.update(expense_dict.keys())
        all_runs.append(run_result)
        if yearly:
            last_year = max(yearly.keys())
            final_assets.append(yearly[last_year].get('total_assets', 0))

    years = sorted(list(all_years))
    cashflow_summary = []
    for year in years:
        income_list = yearly_income.get(year, [])
        assets_list = yearly_assets.get(year, [])
        net_list = [run[year].get('net', 0) for run in all_runs if year in run]
        expense_dict = {}
        for run in all_runs:
            if year in run and 'expense' in run[year]:
                for cat, val in run[year]['expense'].items():
                    expense_dict.setdefault(cat, []).append(val)
        tax_dict = {}
        for run in all_runs:
            if year in run and 'tax' in run[year]:
                for ttype, val in run[year]['tax'].items():
                    tax_dict.setdefault(ttype, []).append(val)
        invest_dict = {}
        for run in all_runs:
            if year in run and 'invest' in run[year]:
                for cat, val in run[year]['invest'].items():
                    invest_dict.setdefault(cat, []).append(val)
        expense_avg = {cat: float(np.mean(vals)) for cat, vals in expense_dict.items()}
        tax_avg = {ttype: float(np.mean(vals)) for ttype, vals in tax_dict.items()}
        invest_avg = {cat: float(np.mean(vals)) for cat, vals in invest_dict.items()}
        cashflow_summary.append({
            'year': year,
            'income': float(np.mean(income_list)) if income_list else 0,
            'tax': tax_avg,
            'net': float(np.mean(net_list)) if net_list else 0,
            'assets': float(np.mean(assets_list)) if assets_list else 0,
            'expense': expense_avg,
            'invest': invest_avg
        })

    # 4.1: 연도별 성공확률
    successProbabilityByYear = {}
    for year in years:
        count = sum(run[year].get('total_assets', 0) >= financial_goal for run in all_runs if year in run)
        successProbabilityByYear[year] = float(count) / len(all_runs) if all_runs else 0

    # 4.2: 분위수 통계량
    def quantiles(arr):
        arr = np.array(arr)
        return {
            'median': float(np.percentile(arr, 50)),
            'p10': float(np.percentile(arr, 10)),
            'p20': float(np.percentile(arr, 20)),
            'p30': float(np.percentile(arr, 30)),
            'p40': float(np.percentile(arr, 40)),
            'p60': float(np.percentile(arr, 60)),
            'p70': float(np.percentile(arr, 70)),
            'p80': float(np.percentile(arr, 80)),
            'p90': float(np.percentile(arr, 90)),
        }
    quantileStats = {
        'total_investments': {year: quantiles(yearly_assets[year]) for year in years},
        'total_income': {year: quantiles(yearly_income[year]) for year in years},
        'total_expenses': {year: quantiles(yearly_expense[year]) for year in years},
        'early_withdrawal_tax': {year: quantiles(yearly_ewtax[year]) for year in years},
        'discretionary_expense_pct': {year: quantiles(yearly_discr_exp_pct[year]) for year in years}
    }

    # 4.3: stacked bar breakdown (평균/중앙값, aggregation threshold 적용)
    def aggregate_breakdown(breakdown_dict, year):
        # breakdown_dict: {카테고리: [값, ...]}
        # 평균/중앙값 계산, threshold 이하 카테고리는 Other로 묶음
        avg = {}
        med = {}
        other_avg = 0
        other_med = 0
        for k, vals in breakdown_dict.items():
            mean_v = float(np.mean(vals))
            med_v = float(np.median(vals))
            if mean_v < aggregation_threshold and med_v < aggregation_threshold:
                other_avg += mean_v
                other_med += med_v
            else:
                avg[k] = mean_v
                med[k] = med_v
        if other_avg > 0:
            avg['Other'] = other_avg
        if other_med > 0:
            med['Other'] = other_med
        return {'average': avg, 'median': med}

    stackedBar = {
        'investments': {year: aggregate_breakdown(yearly_invest_breakdown.get(year, {}), year) for year in years},
        'expenses': {year: aggregate_breakdown(yearly_expense_breakdown.get(year, {}), year) for year in years},
        # income breakdown은 구조상 생략(추후 event series별로 확장 가능)
    }

    # 연도별 평균 달성률
    chanceOfSuccess = {}
    for year in years:
        ratios = [run[year].get('total_assets', 0) / financial_goal if financial_goal > 0 else 0 for run in all_runs if year in run]
        chanceOfSuccess[year] = float(np.mean(ratios)) if ratios else 0

    # 전체 연도 평균 달성률
    AvgChanceOfSuccess = float(np.mean(list(chanceOfSuccess.values()))) if chanceOfSuccess else 0

    result = {
        'cashFlow': cashflow_summary,
        'chanceOfSuccess': chanceOfSuccess,
        'AvgChanceOfSuccess': AvgChanceOfSuccess,
        'quantileStats': quantileStats,
        'stackedBar': stackedBar
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()