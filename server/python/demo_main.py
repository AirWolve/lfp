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
    
    # YAML 파일 경로 생성
    scenario_file = f"{email}-{scenario_name}.yaml"
    scenario_path = os.path.join(os.path.dirname(__file__), 'scenario', email, scenario_file)

    # 파일 존재 여부 확인
    if not os.path.exists(scenario_path):
        print(f"Error: Scenario file not found at {scenario_path}")
        sys.exit(1)

    try:
        # YAML 파일 로드
        scen = Scenario.importJson(scenario_path)
        tax = TaxCalculator()
        
        # 시뮬레이션 실행
        print(tax.runIncomeTax(scen))
        print("Simulation completed successfully")
    except Exception as e:
        print(f"Error during simulation: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()