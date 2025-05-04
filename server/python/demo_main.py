import sys
import Simulation

def main():
    # Read all lines from stdin
    lines = sys.stdin.readlines()
    if not lines or not "".join(lines).strip():
        print("Error: No input provided via stdin", file=sys.stderr)
        sys.exit(1)

    # First line: email, rest: YAML
    user_email = lines[0].strip()
    yaml_text = "".join(lines[1:])

    if not yaml_text.strip():
        print("Error: No YAML text provided via stdin", file=sys.stderr)
        sys.exit(1)

    try:
        # Pass YAML text to Simulation
        sim = Simulation.Simulation(yaml_text)
        # Run simulation, pass email if needed
        result = sim.simulation(user_email, emailNeed=False)
        
        # Print results (refactored simulation result format)
        print("===== Simulation Results by Year =====")
        
        # Access yearly information from yearly_data
        if hasattr(sim, 'yearly_data') and sim.yearly_data:
            for year, year_data in sorted(sim.yearly_data.items()):
                print(f"\n--- Year: {year} ---")
                print(f"  Total Assets: ${year_data.get('total_assets', 0):,.2f}")
                
                # Income and tax info
                print(f"  Income: ${year_data.get('income', 0):,.2f}")
                print(f"  Social Security: ${year_data.get('social_security', 0):,.2f}")
                print(f"  Capital Gains: ${year_data.get('capital_gains', 0):,.2f}")
                
                # Tax info
                print(f"  Income Tax: ${year_data.get('income_tax', 0):,.2f}")
                print(f"  Capital Gains Tax: ${year_data.get('capital_gains_tax', 0):,.2f}")
                print(f"  Early Withdrawal Tax: ${year_data.get('early_withdrawal_tax', 0):,.2f}")
                
                # Investment info
                print("\n  Investment Details:")
                investments = year_data.get('investments', {})
                for inv_id, value in investments.items():
                    # Print only investments with value
                    if value > 0:
                        print(f"    {inv_id}: ${value:,.2f}")
        else:
            # If no yearly_data, print year and total assets directly from result
            for year, total_assets in result:
                print(f"\n--- Year: {year} ---")
                print(f"  Total Assets: ${total_assets:,.2f}")
                
        print("\nSimulation completed successfully.")
    except Exception as e:
        print(f"Error occurred during simulation: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()