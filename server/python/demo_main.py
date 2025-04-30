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
        print(result)
        print("Simulation completed successfully")
    except Exception as e:
        print(f"Error during simulation: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()