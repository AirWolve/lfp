import sys
import Simulation
import yaml
import numpy as np
import json
import csv
from datetime import datetime
import os

def main():
    # Read all lines from stdin
    lines = sys.stdin.readlines()
    if not lines or not "".join(lines).strip():
        print(json.dumps({"error": "No input provided via stdin"}))
        sys.exit(1)

    # First line: email, from the second line: YAML
    n = 100  # fixed
    email = lines[0].strip()
    yaml_text = "".join(lines[1:])
    
    yaml_data = yaml.safe_load(yaml_text)
    if not yaml_data:
        print(json.dumps({"error": "No YAML text provided"}))
        sys.exit(1)

    financial_goal = yaml_data.get("financialGoal", 0)
    aggregation_threshold = yaml_data.get("aggregationThreshold", 0)  # threshold for stacked bar aggregation
    discretionary_categories = set(yaml_data.get("spendingStrategy", []))

    all_runs = []  # List of [{year: {income, expense, tax, net, ...}}, ...]
    final_assets = []
    all_expense_categories = set()
    all_years = set()

    # Additional: dicts for accumulating values by year
    yearly_assets = {}
    # To show yearly income, expense, tax, etc.
    yearly_income = {}
    yearly_expense = {}
    yearly_tax = {}
    yearly_ewtax = {}
    # To show discretionary expense percentile for chart
    yearly_discr_exp_pct = {}
    # To show investment breakdown by category
    yearly_invest_breakdown = {}
    # To show expense breakdown by category
    yearly_expense_breakdown = {}

    for i in range(n):
        sim = Simulation.Simulation(yaml_text)
        sim.simulation(email, emailNeed=False)
        yearly = getattr(sim, 'yearly_data', {})
        run_result = {}
        for year, data in yearly.items():
            income = data.get('income', 0)
            # To show expense breakdown by category
            expense_dict = data.get('expense', {}) or {}
            # To show tax breakdown by category
            tax_dict = data.get('tax', {}) or {}
            # To show total tax
            tax = sum(tax_dict.values())
            # To show net income
            net = income - sum(expense_dict.values()) - tax
            # To show total assets
            total_assets = data.get('total_assets', 0)
            # To show investment breakdown by category
            invest_dict = data.get('invest', {}) or {}
            # To show early withdrawal tax
            ew_tax = tax_dict.get('early_withdrawal', 0)
            # To show discretionary expense (sum of spendingStrategy categories)
            discretionary_total = 0
            for cat, val in expense_dict.items():
                if cat in discretionary_categories:
                    discretionary_total += val
            discr_exp_pct = discretionary_total
            # To show capital gains and capital gain tax
            capital_gains = data.get('capital_gains', 0)
            capital_gain_tax = tax_dict.get('capital_gains', 0)
            # accumulate by year
            all_years.add(year)
            yearly_assets.setdefault(year, []).append(total_assets)
            yearly_income.setdefault(year, []).append(income)
            yearly_expense.setdefault(year, []).append(sum(expense_dict.values()))
            yearly_tax.setdefault(year, []).append(tax)
            yearly_ewtax.setdefault(year, []).append(ew_tax)
            yearly_discr_exp_pct.setdefault(year, []).append(discr_exp_pct)
            # To show capital gains and capital gain tax
            yearly_capital_gains = yearly_invest_breakdown.setdefault('capital_gains', {})
            yearly_capital_gains.setdefault(year, []).append(capital_gains)
            yearly_capital_gain_tax = yearly_invest_breakdown.setdefault('capital_gain_tax', {})
            yearly_capital_gain_tax.setdefault(year, []).append(capital_gain_tax)

            for k, v in invest_dict.items():
                yearly_invest_breakdown.setdefault(year, {}).setdefault(k, []).append(v)
            for k, v in expense_dict.items():
                yearly_expense_breakdown.setdefault(year, {}).setdefault(k, []).append(v)
            for k, v in tax_dict.items():
                yearly_expense_breakdown.setdefault(year, {}).setdefault(f"tax_{k}", []).append(v)
            # To show income breakdown (can be extended later)
            run_result[year] = {
                'income': income,
                'expense': expense_dict,
                'tax': tax_dict,
                'net': net,
                'total_assets': total_assets,
                'invest': invest_dict,
                'capital_gains': capital_gains,
                'capital_gain_tax': capital_gain_tax
            }
            all_expense_categories.update(expense_dict.keys())
        all_runs.append(run_result)
        if yearly:
            last_year = max(yearly.keys())
            final_assets.append(yearly[last_year].get('total_assets', 0))

        # --- LOGGING: Save logs for the first simulation run only ---
        if i == 0:
            # Create logs directory if it does not exist
            os.makedirs("logs", exist_ok=True)
            now_str = datetime.now().strftime("%Y%m%d_%H%M%S")
            user = email.split("@")[0] if email else "user"
            csv_path = f"logs/{user}_{now_str}.csv"
            log_path = f"logs/{user}_{now_str}.log"
            # Save yearly investment values as CSV
            if hasattr(sim, "log_investments") and sim.log_investments:
                with open(csv_path, "w", newline="") as f:
                    writer = csv.DictWriter(f, fieldnames=sim.log_investments[0].keys())
                    writer.writeheader()
                    writer.writerows(sim.log_investments)
            # Save event logs as a human-readable log file
            if hasattr(sim, "log_events") and sim.log_events:
                with open(log_path, "w") as f:
                    for entry in sim.log_events:
                        # Format: year | type | amount | details
                        f.write(f"{entry['year']} | {entry['type']} | {entry['amount']} | {entry['details']}\n")

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
        # capital gains/tax
        capital_gains_list = [run[year].get('capital_gains', 0) for run in all_runs if year in run]
        capital_gain_tax_list = [run[year].get('capital_gain_tax', 0) for run in all_runs if year in run]
        cashflow_summary.append({
            'year': year,
            'income': float(np.mean(income_list)) if income_list else 0,
            'tax': tax_avg,
            'net': float(np.mean(net_list)) if net_list else 0,
            'assets': float(np.mean(assets_list)) if assets_list else 0,
            'expense': expense_avg,
            'invest': invest_avg,
            'capital_gains': float(np.mean(capital_gains_list)) if capital_gains_list else 0,
            'capital_gain_tax': float(np.mean(capital_gain_tax_list)) if capital_gain_tax_list else 0
        })

    # Yearly success rate
    successProbabilityByYear = {}
    for year in years:
        count = sum(run[year].get('total_assets', 0) >= financial_goal for run in all_runs if year in run)
        successProbabilityByYear[year] = float(count) / len(all_runs) if all_runs else 0

    # Quantile statistics
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
        'discretionary_expense_pct': {year: quantiles(yearly_discr_exp_pct[year]) for year in years},
        'capital_gains': {year: quantiles([run[year].get('capital_gains', 0) for run in all_runs if year in run]) for year in years},
        'capital_gain_tax': {year: quantiles([run[year].get('capital_gain_tax', 0) for run in all_runs if year in run]) for year in years}
    }

    # stacked bar breakdown (average/median, apply aggregation threshold)
    def aggregate_breakdown(breakdown_dict, year):
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
        # income breakdown is omitted for now (can be extended later)
    }

    # Yearly average success rate
    chanceOfSuccess = {}
    for year in years:
        ratios = [run[year].get('total_assets', 0) / financial_goal if financial_goal > 0 else 0 for run in all_runs if year in run]
        chanceOfSuccess[year] = float(np.mean(ratios)) if ratios else 0

    # Average success rate for all years
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