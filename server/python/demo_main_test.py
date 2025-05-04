import sys
import Simulation
import yaml
import numpy as np

def main():
    # Read all lines from stdin
    # lines = sys.stdin.readlines()
    # if not lines or not "".join(lines).strip():
    #     print("Error: No input provided via stdin", file=sys.stderr)
    #     sys.exit(1)

    # Prompt for simulation count in English
    try:
        n = int(input("Enter the number of Monte Carlo simulation runs (default 10): ") or 10)
    except Exception:
        n = 10

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
    for i in range(n):
        sim = Simulation.Simulation(yaml_text)
        sim.simulation(None, emailNeed=False)
        yearly = getattr(sim, 'yearly_data', {})
        all_runs.append(yearly)
        if yearly:
            last_year = max(yearly.keys())
            final_assets.append(yearly[last_year].get('total_assets', 0))

    # Aggregate by year
    years = sorted(all_runs[0].keys())
    print(f"\n===== Monte Carlo Simulation Summary ({n} runs) =====\n")
    for year in years:
        assets_list = [run[year].get('total_assets', 0) for run in all_runs if year in run]
        income_list = [run[year].get('income', 0) for run in all_runs if year in run]
        # tax, expense, invest: dict averages
        tax_dict = {}
        expense_dict = {}
        invest_dict = {}
        for run in all_runs:
            if year in run:
                for t, v in run[year].get('tax', {}).items():
                    tax_dict.setdefault(t, []).append(v)
                for c, v in run[year].get('expense', {}).items():
                    expense_dict.setdefault(c, []).append(v)
                for inv, v in run[year].get('invest', {}).items():
                    invest_dict.setdefault(inv, []).append(v)
        tax_avg = {k: float(np.mean(v)) for k, v in tax_dict.items()}
        expense_avg = {k: float(np.mean(v)) for k, v in expense_dict.items()}
        invest_avg = {k: float(np.mean(v)) for k, v in invest_dict.items()}
        tax_med = {k: float(np.median(v)) for k, v in tax_dict.items()}
        expense_med = {k: float(np.median(v)) for k, v in expense_dict.items()}
        invest_med = {k: float(np.median(v)) for k, v in invest_dict.items()}
        print(f"--- Year: {year} ---")
        print(f"  Avg Total Assets: ${np.mean(assets_list):,.2f}")
        print(f"  Med Total Assets: ${np.median(assets_list):,.2f}")
        print(f"  Avg Income: ${np.mean(income_list):,.2f}")
        print(f"  Med Income: ${np.median(income_list):,.2f}")
        print(f"  Avg Tax: {tax_avg}")
        print(f"  Avg Expense: {expense_avg}")
        print(f"  Avg Invest: {invest_avg}\n")
        print(f"  Med Tax: {tax_med}")
        print(f"  Med Expense: {expense_med}")
        print(f"  Med Invest: {invest_med}\n")
    print("\nSimulation completed successfully.")

if __name__ == "__main__":
    main()