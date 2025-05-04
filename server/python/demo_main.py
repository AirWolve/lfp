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

    # First line: simulation count (n), Second line: YAML
    n = 100  # default
    yaml_text = None
    if len(lines) >= 2 and lines[0].strip().isdigit():
        n = int(lines[0].strip())
        yaml_text = "".join(lines[1:])
    else:
        yaml_text = "".join(lines)

    yaml_data = yaml.safe_load(yaml_text)
    if not yaml_data:
        print(json.dumps({"error": "No YAML text provided"}))
        sys.exit(1)

    # User can specify financialGoal for success, else 0
    financial_goal = yaml_data.get("financialGoal", 0)

    # For each run, store yearly cash flow by category
    all_runs = []  # List of [{year: {income, expense, tax, net, ...}}, ...]
    final_assets = []
    all_expense_categories = set()

    for i in range(n):
        sim = Simulation.Simulation(yaml_text)
        sim.simulation(None, emailNeed=False)
        yearly = getattr(sim, 'yearly_data', {})
        run_result = {}
        for year, data in yearly.items():
            income = data.get('income', 0)
            expense_dict = data.get('expense', {}) or {}
            # tax 딕셔너리의 모든 값을 합산
            tax_dict = data.get('tax', {}) or {}
            tax = sum(tax_dict.values())
            net = income - sum(expense_dict.values()) - tax
            run_result[year] = {
                'income': income,
                'expense': expense_dict,
                'tax': tax_dict,
                'net': net,
                'total_assets': data.get('total_assets', 0)
            }
            all_expense_categories.update(expense_dict.keys())
        all_runs.append(run_result)
        # For chance of success: use last year total_assets
        if yearly:
            last_year = max(yearly.keys())
            final_assets.append(yearly[last_year].get('total_assets', 0))

    # Aggregate by year
    years = sorted(all_runs[0].keys())
    cashflow_summary = []
    for year in years:
        income_list = [run[year].get('income', 0) for run in all_runs if year in run]
        assets_list = [run[year].get('total_assets', 0) for run in all_runs if year in run]
        net_list = [run[year].get('net', 0) for run in all_runs if year in run]
        # expense: dict of category: [values]
        expense_dict = {}
        for run in all_runs:
            if year in run and 'expense' in run[year]:
                for cat, val in run[year]['expense'].items():
                    expense_dict.setdefault(cat, []).append(val)
        # tax: dict of type: [values]
        tax_dict = {}
        for run in all_runs:
            if year in run and 'tax' in run[year]:
                for ttype, val in run[year]['tax'].items():
                    tax_dict.setdefault(ttype, []).append(val)
        # invest: dict of category: [values]
        invest_dict = {}
        for run in all_runs:
            if year in run and 'invest' in run[year]:
                for cat, val in run[year]['invest'].items():
                    invest_dict.setdefault(cat, []).append(val)
        # 평균 계산
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

    # Chance of success: proportion of runs where final assets >= goal
    chance_of_success = float(np.mean([fa >= financial_goal for fa in final_assets]))

    result = {
        'cashFlow': cashflow_summary,
        'chanceOfSuccess': chance_of_success
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()