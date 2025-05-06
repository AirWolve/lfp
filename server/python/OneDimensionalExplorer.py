import json
import copy
import sys
import random
from Scenario import load_scenario, update_scenario_parameter
from Simulation import run_simulations

def analyze_results(simulations):
    success_prob = calculate_success_probability(simulations)
    median_investments = calculate_median_investments(simulations)
    return {
        'success_probability': success_prob,
        'median_investments': median_investments
    }

def calculate_success_probability(simulations):
    years = len(simulations[0])
    success = [0] * years
    for sim in simulations:
        for i, year_data in enumerate(sim):
            if year_data['total_investments'] >= year_data['financial_goal']:
                success[i] += 1
    return [round((s / len(simulations)) * 100, 2) for s in success]

def calculate_median_investments(simulations):
    years = len(simulations[0])
    medians = []
    for i in range(years):
        year_values = [sim[i]['total_investments'] for sim in simulations]
        medians.append(round(sorted(year_values)[len(year_values)//2], 2))
    return medians

def one_dimensional_explore(scenario_file, param_name, min_value, max_value, step, num_simulations):
    base_scenario = load_scenario(scenario_file)
    param_values = list(range(min_value, max_value + 1, step))
    results = {}

    for value in param_values:
        scenario = copy.deepcopy(base_scenario)
        update_scenario_parameter(scenario, param_name, value)

        random.seed(42)  # Ensure repeatability
        simulations = run_simulations(scenario, num_simulations)

        results[value] = analyze_results(simulations)

    return results

if __name__ == "__main__":
    param_name = sys.argv[1]
    min_value = int(sys.argv[2])
    max_value = int(sys.argv[3])
    step = int(sys.argv[4])

    result = one_dimensional_explore(
        "server/python/scenario.yaml",
        param_name,
        min_value,
        max_value,
        step,
        num_simulations=50
    )
    print(json.dumps(result))
