import sys
import json
import Scenario
import os
import yaml

def main():
    try:
        # Read input from stdin
        input_str = sys.stdin.read()
        data = json.loads(input_str)
        userEmail = data.get('userEmail')
        scenarioData = data.get('scenarioData')
        if not userEmail or not scenarioData:
            print(json.dumps({"error": "userEmail and scenarioData are both required."}))
            sys.exit(1)

        # If scenarioData is a string, parse it as YAML
        if isinstance(scenarioData, str):
            scenarioData = yaml.safe_load(scenarioData)

        # Debug: Save actual scenarioData to a file
        with open("debug_scenario_input.yaml", "w") as f:
            f.write(yaml.dump(scenarioData))

        # Create a Scenario object
        scenario = Scenario.Scenario(scenarioData)
        # Create a user-specific directory
        user_dir = os.path.join(os.path.dirname(__file__), 'scenario', userEmail)
        os.makedirs(user_dir, exist_ok=True)
        # Create a file name
        file_name = f"{userEmail}-{scenarioData['name']}.yaml"
        file_path = os.path.join(user_dir, file_name)
        # Save as YAML
        Scenario.exportYAML(scenario, userEmail, scenarioData['name'])
        # Return the actual save path
        print(json.dumps({"filePath": os.path.abspath(file_path)}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
