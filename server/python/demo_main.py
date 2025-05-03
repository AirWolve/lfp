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
        # result는 연도별 dict 리스트
        print("===== Simulation Results by Year =====")
        for idx, year_data in enumerate(result):
            print(f"--- Year {idx+1} ---")
            # 주요 정보만 요약 출력 (필요시 key를 조정)
            if 'year' in year_data:
                print(f"Year: {year_data['year']}")
            if 'investments' in year_data:
                total_assets = sum(inv.get('value', 0) for inv in year_data['investments'])
                print(f"  Total Assets: {total_assets:,.2f}")
                for inv in year_data['investments']:
                    print(f"    {inv['investmentType']} ({inv['taxStatus']}): {inv['value']:,.2f}")
            if 'curYearIncome' in year_data:
                print(f"  Income: {year_data['curYearIncome']}")
            if 'curYearSS' in year_data:
                print(f"  Social Security: {year_data['curYearSS']}")
            if 'curYearGains' in year_data:
                print(f"  Capital Gains: {year_data['curYearGains']}")
            if 'curYearEarlyWithdrawals' in year_data:
                print(f"  Early Withdrawals: {year_data['curYearEarlyWithdrawals']}")
            print()
        print("Simulation completed successfully")
    except Exception as e:
        print(f"Error during simulation: {str(e)}", file=sys.stderr)
        print("YAML input (first 20 lines):", file=sys.stderr)
        for l in yaml_text.splitlines()[:20]:
            print(l, file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()