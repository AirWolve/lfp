import sys
import Simulation

def main():
    # stdin에서 YAML 텍스트를 읽음
    yaml_text = sys.stdin.read()
    if not yaml_text.strip():
        print("Error: No YAML text provided via stdin", file=sys.stderr)
        sys.exit(1)

    try:
        # YAML 텍스트로부터 Scenario 객체 생성
        sim = Simulation.Simulation(yaml_text)
        # 시뮬레이션 실행
        result = sim.simulation()
        print(result)
        print("Simulation completed successfully")
    except Exception as e:
        print(f"Error during simulation: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()