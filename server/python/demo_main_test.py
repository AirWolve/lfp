import sys
import Simulation
import yaml

def main():
    # Read all lines from stdin
    # lines = sys.stdin.readlines()
    # if not lines or not "".join(lines).strip():
    #     print("Error: No input provided via stdin", file=sys.stderr)
    #     sys.exit(1)

    yaml_text = """
name: Scenario Name
maritalStatus: couple
birthYears:
  - 1985
  - 1987
lifeExpectancy:
  - type: fixed
    value: 80
  - type: normal
    mean: 82
    stdev: 3
investmentTypes:
  - name: cash
    description: cash
    returnAmtOrPct: amount
    returnDistribution:
      type: fixed
      value: 0
    expenseRatio: 0
    incomeAmtOrPct: amount
    incomeDistribution:
      type: fixed
      value: 0
    taxability: true
  - name: S&P 500
    description: S&P 500 index fund
    returnAmtOrPct: percent
    returnDistribution:
      type: normal
      mean: 0.06
      stdev: 0.02
    expenseRatio: 0.001
    incomeAmtOrPct: percent
    incomeDistribution:
      type: normal
      mean: 0.01
      stdev: 0.005
    taxability: true
  - name: tax-exempt bonds
    description: NY tax-exempt bonds
    returnAmtOrPct: amount
    returnDistribution:
      type: fixed
      value: 0
    expenseRatio: 0.004
    incomeAmtOrPct: percent
    incomeDistribution:
      type: normal
      mean: 0.03
      stdev: 0.01
    taxability: false
investments:
  - investmentType: cash
    value: 100
    taxStatus: non-retirement
    id: cash non-retirement
  - investmentType: S&P 500
    value: 10000
    taxStatus: non-retirement
    id: S&P 500 non-retirement
  - investmentType: tax-exempt bonds
    value: 2000
    taxStatus: non-retirement
    id: tax-exempt bonds non-retirement
  - investmentType: S&P 500
    value: 10000
    taxStatus: pre-tax
    id: S&P 500 pre-tax
  - investmentType: S&P 500
    value: 2000
    taxStatus: after-tax
    id: S&P 500 after-tax
eventSeries:
  - name: salary
    type: income
    start:
      type: fixed
      value: 2025
    duration:
      type: fixed
      value: 40
    initialAmount: 75000
    changeAmtOrPct: amount
    changeDistribution:
      type: uniform
      lower: 500
      upper: 2000
    inflationAdjusted: false
    userFraction: 1
    socialSecurity: false
  - name: food
    type: expense
    start:
      type: startWith
      eventSeries: salary
    duration:
      type: fixed
      value: 200
    initialAmount: 5000
    changeAmtOrPct: percent
    changeDistribution:
      type: normal
      mean: 0.02
      stdev: 0.01
    inflationAdjusted: true
    userFraction: 0.5
    discretionary: false
  - name: vacation
    type: expense
    start:
      type: startWith
      eventSeries: salary
    duration:
      type: fixed
      value: 40
    initialAmount: 1200
    changeAmtOrPct: amount
    changeDistribution:
      type: fixed
      value: 0
    inflationAdjusted: true
    userFraction: 0.6
    discretionary: true
  - name: streaming services
    type: expense
    start:
      type: startWith
      eventSeries: salary
    duration:
      type: fixed
      value: 40
    initialAmount: 500
    changeAmtOrPct: amount
    changeDistribution:
      type: fixed
      value: 0
    inflationAdjusted: true
    userFraction: 1
    discretionary: true
  - name: my investments
    type: invest
    start:
      type: uniform
      lower: 2025
      upper: 2030
    duration:
      type: fixed
      value: 10
    glidePath: true
    maxCash: 1000
    assetAllocation:
      S&P 500 non-retirement: 0.6
      S&P 500 after-tax: 0.4
    assetAllocation2:
      S&P 500 non-retirement: 0.8
      S&P 500 after-tax: 0.2
  - name: rebalance
    type: rebalance
    start:
      type: uniform
      lower: 2025
      upper: 2030
    duration:
      type: fixed
      value: 10
    assetAllocation:
      S&P 500 non-retirement: 0.7
      tax-exempt bonds non-retirement: 0.3
inflationAssumption:
  type: fixed
  value: 0.03
afterTaxContributionLimit: 7000
spendingStrategy:
  - vacation
  - streaming services
expenseWithdrawalStrategy:
  - S&P 500 non-retirement
  - tax-exempt bonds non-retirement
  - S&P 500 after-tax
RMDStrategy:
  - S&P 500 pre-tax
RothConversionOpt: true
RothConversionStart: 2050
RothConversionEnd: 2060
RothConversionStrategy:
  - S&P 500 pre-tax
financialGoal: 10000
residenceState: NY
"""

    # Parse with yaml.safe_load
    yaml_data = yaml.safe_load(yaml_text)

    if not yaml_data:
        print("Error: No YAML text provided via stdin", file=sys.stderr)
        sys.exit(1)

    try:
        # Pass YAML text to Simulation
        sim = Simulation.Simulation(yaml_text)
        # Run simulation, pass email if needed
        result = sim.simulation(None, emailNeed=False)
        
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