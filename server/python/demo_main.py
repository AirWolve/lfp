import sys
import os
from Calculator import TaxCalculator
from Calculator import Inflation
import Scenario

def main():
    if len(sys.argv) != 3:
        print("Usage: python demo_main.py <email> <scenario_name>")
        sys.exit(1)

    email = sys.argv[1]
    scenario_name = sys.argv[2]
    
    # Create file path to YAML file
    scenario_file = f"{email}-{scenario_name}.yaml"
    scenario_path = os.path.join(os.path.dirname(__file__), 'scenario', email, scenario_file)

    # Check if file exists
    if not os.path.exists(scenario_path):
        print(f"Error: Scenario file not found at {scenario_path}")
        sys.exit(1)

    try:
        # Load YAML file
        scen = Scenario.importJson(scenario_path)
        tax = TaxCalculator()
        
        # Execute simulation
        print(tax.runIncomeTax(scen))
        print("Simulation completed successfully")
    except Exception as e:
        print(f"Error during simulation: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()