import sys
import Simulation
import yaml
import numpy as np
import json

def main():
    # Read all lines from stdin
    # lines = sys.stdin.readlines()
    # if not lines or not "".join(lines).strip():
    #     print("Error: No input provided via stdin", file=sys.stderr)
    #     sys.exit(1)

    # Prompt for simulation count in English
    try:
        n = int(input("Enter the number of Monte Carlo simulation runs (default 1): ") or 1)
    except Exception:
        n = 1

    yaml_text = """
name: Scenario Name
maritalStatus: couple
birthYears:
  - 1985
  - 1987
lifeExpectancy:
  - type: fixed
    value: 80
  - type: normal
    mean: 82
    stdev: 3
investmentTypes:
  - name: cash
    description: cash
    returnAmtOrPct: amount
    returnDistribution:
      type: fixed
      value: 0
    expenseRatio: 0
    incomeAmtOrPct: amount
    incomeDistribution:
      type: fixed
      value: 0
    taxability: true
  - name: S&P 500
    description: S&P 500 index fund
    returnAmtOrPct: percent
    returnDistribution:
      type: normal
      mean: 0.06
      stdev: 0.02
    expenseRatio: 0.001
    incomeAmtOrPct: percent
    incomeDistribution:
      type: normal
      mean: 0.01
      stdev: 0.005
    taxability: true
  - name: tax-exempt bonds
    description: NY tax-exempt bonds
    returnAmtOrPct: amount
    returnDistribution:
      type: fixed
      value: 0
    expenseRatio: 0.004
    incomeAmtOrPct: percent
    incomeDistribution:
      type: normal
      mean: 0.03
      stdev: 0.01
    taxability: false
investments:
  - investmentType: cash
    value: 100
    taxStatus: non-retirement
    id: cash non-retirement
  - investmentType: S&P 500
    value: 10000
    taxStatus: non-retirement
    id: S&P 500 non-retirement
  - investmentType: tax-exempt bonds
    value: 2000
    taxStatus: non-retirement
    id: tax-exempt bonds non-retirement
  - investmentType: S&P 500
    value: 10000
    taxStatus: pre-tax
    id: S&P 500 pre-tax
  - investmentType: S&P 500
    value: 2000
    taxStatus: after-tax
    id: S&P 500 after-tax
eventSeries:
  - name: salary
    type: income
    start:
      type: fixed
      value: 2025
    duration:
      type: fixed
      value: 40
    initialAmount: 75000
    changeAmtOrPct: amount
    changeDistribution:
      type: uniform
      lower: 500
      upper: 2000
    inflationAdjusted: false
    userFraction: 1
    socialSecurity: false
  - name: food
    type: expense
    start:
      type: startWith
      eventSeries: salary
    duration:
      type: fixed
      value: 200
    initialAmount: 5000
    changeAmtOrPct: percent
    changeDistribution:
      type: normal
      mean: 0.02
      stdev: 0.01
    inflationAdjusted: true
    userFraction: 0.5
    discretionary: false
  - name: vacation
    type: expense
    start:
      type: startWith
      eventSeries: salary
    duration:
      type: fixed
      value: 40
    initialAmount: 1200
    changeAmtOrPct: amount
    changeDistribution:
      type: fixed
      value: 0
    inflationAdjusted: true
    userFraction: 0.6
    discretionary: true
  - name: streaming services
    type: expense
    start:
      type: startWith
      eventSeries: salary
    duration:
      type: fixed
      value: 40
    initialAmount: 500
    changeAmtOrPct: amount
    changeDistribution:
      type: fixed
      value: 0
    inflationAdjusted: true
    userFraction: 1
    discretionary: true
  - name: my investments
    type: invest
    start:
      type: uniform
      lower: 2025
      upper: 2030
    duration:
      type: fixed
      value: 10
    glidePath: true
    maxCash: 1000
    assetAllocation:
      S&P 500 non-retirement: 0.6
      S&P 500 after-tax: 0.4
    assetAllocation2:
      S&P 500 non-retirement: 0.8
      S&P 500 after-tax: 0.2
  - name: rebalance
    type: rebalance
    start:
      type: uniform
      lower: 2025
      upper: 2030
    duration:
      type: fixed
      value: 10
    assetAllocation:
      S&P 500 non-retirement: 0.7
      tax-exempt bonds non-retirement: 0.3
inflationAssumption:
  type: fixed
  value: 0.03
afterTaxContributionLimit: 7000
spendingStrategy:
  - vacation
  - streaming services
expenseWithdrawalStrategy:
  - S&P 500 non-retirement
  - tax-exempt bonds non-retirement
  - S&P 500 after-tax
RMDStrategy:
  - S&P 500 pre-tax
RothConversionOpt: true
RothConversionStart: 2050
RothConversionEnd: 2060
RothConversionStrategy:
  - S&P 500 pre-tax
financialGoal: 10000
residenceState: NY
"""

    # Parse with yaml.safe_load
    yaml_data = yaml.safe_load(yaml_text)

    if not yaml_data:
        print("Error: No YAML text provided.", file=sys.stderr)
        sys.exit(1)

    all_runs = []
    final_assets = []
    all_years = set()
    yearly_assets = {}
    yearly_income = {}
    yearly_expense = {}
    yearly_tax = {}
    yearly_ewtax = {}
    yearly_discr_exp_pct = {}
    yearly_invest_breakdown = {}
    yearly_expense_breakdown = {}

    discretionary_categories = set(yaml_data.get("spendingStrategy", []))
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
            ew_tax = tax_dict.get('early_withdrawal', 0)
            discretionary_total = 0
            for cat, val in expense_dict.items():
                if cat in discretionary_categories:
                    discretionary_total += val
            discr_exp_pct = discretionary_total
            all_years.add(year)
            yearly_assets.setdefault(year, []).append(total_assets)
            yearly_income.setdefault(year, []).append(income)
            yearly_expense.setdefault(year, []).append(sum(expense_dict.values()))
            yearly_tax.setdefault(year, []).append(tax)
            yearly_ewtax.setdefault(year, []).append(ew_tax)
            yearly_discr_exp_pct.setdefault(year, []).append(discr_exp_pct)
            for k, v in invest_dict.items():
                yearly_invest_breakdown.setdefault(year, {}).setdefault(k, []).append(v)
            for k, v in expense_dict.items():
                yearly_expense_breakdown.setdefault(year, {}).setdefault(k, []).append(v)
            for k, v in tax_dict.items():
                yearly_expense_breakdown.setdefault(year, {}).setdefault(f"tax_{k}", []).append(v)
            run_result[year] = {
                'income': income,
                'expense': expense_dict,
                'tax': tax_dict,
                'net': net,
                'total_assets': total_assets,
                'invest': invest_dict
            }
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

    # 연도별 달성 금액 / 목표 금액의 평균값(0~1)
    chanceOfSuccess = {}
    for year in years:
        ratios = [run[year].get('total_assets', 0) / yaml_data.get("financialGoal", 0) if yaml_data.get("financialGoal", 0) > 0 else 0 for run in all_runs if year in run]
        chanceOfSuccess[year] = float(np.mean(ratios)) if ratios else 0

    # 전체 연도에 대한 평균값
    AvgChanceOfSuccess = float(np.mean(list(chanceOfSuccess.values()))) if chanceOfSuccess else 0

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

    def aggregate_breakdown(breakdown_dict, year):
        avg = {}
        med = {}
        other_avg = 0
        other_med = 0
        for k, vals in breakdown_dict.items():
            mean_v = float(np.mean(vals))
            med_v = float(np.median(vals))
            if mean_v < yaml_data.get("aggregationThreshold", 0) and med_v < yaml_data.get("aggregationThreshold", 0):
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
    }

    result = {
        'cashFlow': cashflow_summary,
        'chanceOfSuccess': chanceOfSuccess,
        'AvgChanceOfSuccess': AvgChanceOfSuccess,
        'quantileStats': quantileStats,
        'stackedBar': stackedBar
    }
    # 결과를 파일로 저장
    with open('test_result.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()