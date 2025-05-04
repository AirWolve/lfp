import Calculator as ca
import Scenario as sc
import numpy as np

kFixed = "fixed"
kUniform = "uniform"
kNormal = "normal"

class Simulation:
    # def __init__(self, path:str):
    #     self.data = sc.importYAML(path)
    #     self.tax = ca.TaxCalculator()
    #     self.rmd = ca.RMDCalculator()
    #     self.inf = ca.Inflation(self.data)
    #     self.initialInvestmentValue = {inv.id:inv.value for inv in self.data.investments}
    #     self.purchaseDict = {inv.id: 0 for inv in self.data.investments}
    #     for ev in self.data.eventSeries:
    #         if ev.type == "income":
    #             self.year = ev.start["value"]
    #             self.duration = self.year + ev.duration["value"]
    #             break
    
    def __init__(self, dataStr:str):
        self.data = sc.importYAMLtext(dataStr)
        self.tax = ca.TaxCalculator()
        self.rmd = ca.RMDCalculator()
        self.inf = ca.Inflation(self.data)
        self.initialInvestmentValue = {inv.id:inv.value for inv in self.data.investments}
        self.purchaseDict = {inv.id: 0 for inv in self.data.investments}
        for ev in self.data.eventSeries:
            if ev.type == "income":
                self.year = ev.start["value"]
                self.duration = self.year + ev.duration["value"]
                break

    # start 1
    def taxInflation(self, year:int, curInflation:float):
        try:
            # Store base values if not already stored
            if not hasattr(self, 'base_brackets'):
                self.base_brackets = {
                    'individual': {int(k) if k != 'inf' else k: int(k) if k != 'inf' else k for k, v in self.tax.federalTax['individual'].items()},
                    'couple': {int(k) if k != 'inf' else k: int(k) if k != 'inf' else k for k, v in self.tax.federalTax['couple'].items()},
                    'cap_individual': {int(k) if k != 'inf' else k: int(k) if k != 'inf' else k for k, v in self.tax.capTax['individual'].items()},
                    'cap_couple': {int(k) if k != 'inf' else k: int(k) if k != 'inf' else k for k, v in self.tax.capTax['couple'].items()}
                }
                self.prev_year_brackets = {
                    'individual': self.base_brackets['individual'].copy(),
                    'couple': self.base_brackets['couple'].copy(),
                    'cap_individual': self.base_brackets['cap_individual'].copy(),
                    'cap_couple': self.base_brackets['cap_couple'].copy()
                }
                # 표준공제 base 값도 저장
                self.base_standard_deduction = self.tax.federalTax["standardDeduction"].copy()
                self.prev_standard_deduction = self.base_standard_deduction.copy()

            # Update federal tax brackets
            ind_tax = {}
            cou_tax = {}
            for key_int in self.base_brackets['individual']:
                value = self.tax.federalTax["individual"].get(key_int, self.tax.federalTax["individual"].get(str(key_int)))
                if key_int == "inf":
                    ind_tax[key_int] = value
                    continue
                if self.data.inflationAssumption["type"] == kFixed:
                    inftax = self.base_brackets['individual'][key_int] * (1 + curInflation) ** (year - self.year)
                else:
                    inftax = self.prev_year_brackets['individual'][key_int] * (1 + curInflation)
                    self.prev_year_brackets['individual'][key_int] = inftax
                ind_tax[inftax] = value
            for key_int in self.base_brackets['couple']:
                value = self.tax.federalTax["couple"].get(key_int, self.tax.federalTax["couple"].get(str(key_int)))
                if key_int == "inf":
                    cou_tax[key_int] = value
                    continue
                if self.data.inflationAssumption["type"] == kFixed:
                    inftax = self.base_brackets['couple'][key_int] * (1 + curInflation) ** (year - self.year)
                else:
                    inftax = self.prev_year_brackets['couple'][key_int] * (1 + curInflation)
                    self.prev_year_brackets['couple'][key_int] = inftax
                cou_tax[inftax] = value
            self.tax.federalTax["individual"] = ind_tax
            self.tax.federalTax["couple"] = cou_tax

            # Update capital gains tax brackets
            ind_tax = {}
            cou_tax = {}
            for key_int in self.base_brackets['cap_individual']:
                value = self.tax.capTax["individual"].get(key_int, self.tax.capTax["individual"].get(str(key_int)))
                if key_int == "inf":
                    ind_tax[key_int] = value
                    continue
                if self.data.inflationAssumption["type"] == kFixed:
                    inftax = self.base_brackets['cap_individual'][key_int] * (1 + curInflation) ** (year - self.year)
                else:
                    inftax = self.prev_year_brackets['cap_individual'][key_int] * (1 + curInflation)
                    self.prev_year_brackets['cap_individual'][key_int] = inftax
                ind_tax[inftax] = value
            for key_int in self.base_brackets['cap_couple']:
                value = self.tax.capTax["couple"].get(key_int, self.tax.capTax["couple"].get(str(key_int)))
                if key_int == "inf":
                    cou_tax[key_int] = value
                    continue
                if self.data.inflationAssumption["type"] == kFixed:
                    inftax = self.base_brackets['cap_couple'][key_int] * (1 + curInflation) ** (year - self.year)
                else:
                    inftax = self.prev_year_brackets['cap_couple'][key_int] * (1 + curInflation)
                    self.prev_year_brackets['cap_couple'][key_int] = inftax
                cou_tax[inftax] = value
            self.tax.capTax["individual"] = ind_tax
            self.tax.capTax["couple"] = cou_tax

            # 표준공제도 인플레이션 반영하여 갱신
            std = {}
            for k in self.base_standard_deduction:
                if self.data.inflationAssumption["type"] == kFixed:
                    std[k] = self.base_standard_deduction[k] * (1 + curInflation) ** (year - self.year)
                else:
                    std[k] = self.prev_standard_deduction[k] * (1 + curInflation)
                    self.prev_standard_deduction[k] = std[k]
            self.tax.federalTax["standardDeduction"] = std
        except Exception as e:
            raise

    def limitInflation(self, year:int, curInflation:float):
        if self.data.inflationAssumption["type"] == kFixed:
            return self.data.afterTaxContributionLimit * (1+curInflation) ** (year - self.year)
        else:
            return self.data.afterTaxContributionLimit * np.prod(1+np.clip(curInflation, -0.99, None))

    # start 2
    def incomeEventSimul(self, ev, amount: int, year: int):
        """
        Handle annual changes in income events, apply inflation, mortality, and update per investment type.
        Returns: (curYearSS, curYearIncome)
        """
        if ev.type != "income":
            raise ValueError("Event type is not income")

        # 1. Sample annual change
        if ev.changeAmtOrPct == "amount":
            if ev.changeDistribution["type"] == kFixed:
                new_amount = amount + ev.changeDistribution["value"]
            elif ev.changeDistribution["type"] == kUniform:
                new_amount = amount + np.random.uniform(ev.changeDistribution["lower"], ev.changeDistribution["upper"])
            elif ev.changeDistribution["type"] == kNormal:
                new_amount = amount + np.random.normal(ev.changeDistribution["mean"], ev.changeDistribution["stdev"])
            else:
                new_amount = amount
        else:  # percent
            if ev.changeDistribution["type"] == kFixed:
                new_amount = amount * (1 + ev.changeDistribution["value"])
            elif ev.changeDistribution["type"] == kUniform:
                new_amount = amount * (1 + np.random.uniform(ev.changeDistribution["lower"], ev.changeDistribution["upper"]))
            elif ev.changeDistribution["type"] == kNormal:
                new_amount = amount * (1 + np.random.normal(ev.changeDistribution["mean"], ev.changeDistribution["stdev"]))
            else:
                new_amount = amount

        # 2. Apply inflation
        if ev.inflationAdjusted:
            infAdj = self.inf.runInflation()
            if self.data.inflationAssumption["type"] == kFixed:
                new_amount += new_amount * (1 + infAdj) ** (year - self.year)
            else:
                new_amount += new_amount * (np.prod(1 + np.clip(infAdj, -0.99, None)))

        # 3. Mortality adjustment (userFraction)
        user_alive = True
        spouse_alive = True
        if len(self.data.birthYears) > 0 and len(self.data.lifeExpectancy) > 0:
            user_death_year = self.data.birthYears[0] + (self.data.lifeExpectancy[0]["value"] if self.data.lifeExpectancy[0]["type"] == "fixed" else self.data.lifeExpectancy[0]["mean"])
            if year >= user_death_year:
                user_alive = False
        if self.data.maritalStatus == "couple" and len(self.data.birthYears) > 1 and len(self.data.lifeExpectancy) > 1:
            spouse_death_year = self.data.birthYears[1] + (self.data.lifeExpectancy[1]["value"] if self.data.lifeExpectancy[1]["type"] == "fixed" else self.data.lifeExpectancy[1]["mean"])
            if year >= spouse_death_year:
                spouse_alive = False
        fraction = 1.0
        if not user_alive:
            fraction -= ev.userFraction
        if self.data.maritalStatus == "couple" and not spouse_alive:
            fraction -= (1.0 - ev.userFraction)
            fraction = max(0, fraction)
        new_amount *= fraction

        # 4. Update only cash-type investments with income
        for inv in self.data.investments:
            if inv.investmentType == "cash":
                inv.updateValue(inv.value + new_amount)

        # 5. Separate return values
        curYearSS = 0
        curYearIncome = 0
        if hasattr(ev, "socialSecurity") and ev.socialSecurity:
            curYearSS = new_amount
        else:
            curYearIncome = new_amount
        return curYearSS, curYearIncome

    # start 3
    def calculateRMD(self, year, age, prev_year_pretax_values):
        """
        Dedicated function to accurately calculate RMD based on previous year's data
        Args:
            year: current simulation year
            age: current user age
            prev_year_pretax_values: list of previous year's pre-tax account values
        Returns:
            (rmd_amount, remaining_rmd): calculated RMD amount and remaining withdrawal amount
        """
        if age < 73:  # RMD starts at age 73
            return 0, 0
            
        # Calculate sum of previous year's pre-tax accounts
        s = sum(prev_year_pretax_values)
        if s <= 0:
            return 0, 0
            
        # RMD calculation: previous year's pre-tax account sum / distribution period
        d = self.rmd.runRMD(age)
        if d <= 0:
            return 0, 0
            
        rmd_amount = s / d
        return rmd_amount, rmd_amount  # Return total RMD amount and remaining withdrawal amount

    def processRMD(self, rmd_amount, remaining_rmd):
        """
        Process RMD withdrawals from pre-tax to non-retirement accounts according to RMD strategy
        Args:
            rmd_amount: total RMD amount
            remaining_rmd: remaining withdrawal amount
        Returns:
            processed_rmd: actually processed RMD amount
        """
        if rmd_amount <= 0:
            return 0
            
        processed_rmd = 0
        
        # Transfer from pre-tax to non-retirement accounts according to RMD strategy
        for rmd_inv_id in self.data.RMDStrategy:
            if remaining_rmd <= 0:
                break
                
            # Find source investment
            source_inv = None
            for inv in self.data.investments:
                if inv.id == rmd_inv_id and inv.taxStatus == "pre-tax":
                    source_inv = inv
                    break
            
            if source_inv is None or source_inv.value <= 0:
                continue
                
            # Calculate withdrawal amount from this account
            withdrawal = min(remaining_rmd, source_inv.value)
            
            # Find or create corresponding non-retirement account of the same investment type
            target_inv = None
            for inv in self.data.investments:
                if (inv.investmentType == source_inv.investmentType and 
                    inv.taxStatus == "non-retirement"):
                    target_inv = inv
                    break
            
            if target_inv is None:
                # Create new non-retirement account
                target_inv = sc.Investment(
                    id=f"{source_inv.id}_nonret",
                    investmentType=source_inv.investmentType,
                    taxStatus="non-retirement",
                    value=0
                )
                self.data.investments.append(target_inv)
                self.purchaseDict[target_inv.id] = 0
                self.initialInvestmentValue[target_inv.id] = 0
            
            # Transfer funds
            source_inv.value -= withdrawal
            target_inv.value += withdrawal
            remaining_rmd -= withdrawal
            processed_rmd += withdrawal
        
        return processed_rmd

    def RMDSimul(self, year, curYearIncome):
        # Calculate current age
        age = year - self.data.birthYears[0]
        
        # Only process RMD at age 74 and above
        if age < 74:
            return curYearIncome
            
        # Get distribution period from RMD calculator
        distribution_period = self.rmd.runRMD(age)
        if distribution_period == 0:
            return curYearIncome
            
        # Calculate total value of all pre-tax accounts
        total_pretax_value = 0
        for inv in self.data.investments:
            if inv.taxStatus == "pre-tax":  # Include all pre-tax accounts regardless of name
                total_pretax_value += inv.value
                
        # Calculate RMD amount
        rmd_amount = total_pretax_value / distribution_period
        
        # Add RMD to taxable income
        curYearIncome += rmd_amount
        
        # Process RMD withdrawals according to RMDStrategy
        remaining_rmd = rmd_amount
        for rmd_inv_id in self.data.RMDStrategy:
            if remaining_rmd <= 0:
                break
                
            # Find the source investment
            source_inv = None
            for inv in self.data.investments:
                if inv.id == rmd_inv_id:
                    source_inv = inv
                    break
            
            if source_inv is None or source_inv.taxStatus != "pre-tax":
                continue
                
            # Calculate withdrawal amount for this account
            withdrawal = min(remaining_rmd, source_inv.value)
            if withdrawal <= 0:
                continue
                
            # Find or create corresponding non-retirement account
            target_inv = None
            for inv in self.data.investments:
                if (inv.investmentType == source_inv.investmentType and 
                    inv.taxStatus == "non-retirement"):
                    target_inv = inv
                    break
            
            if target_inv is None:
                # Create new non-retirement account
                target_inv = sc.Investment(
                    id=f"{source_inv.id}_nonret",
                    investmentType=source_inv.investmentType,
                    taxStatus="non-retirement",
                    value=0
                )
                self.data.investments.append(target_inv)
            
            # Transfer funds
            source_inv.value -= withdrawal
            target_inv.value += withdrawal
            remaining_rmd -= withdrawal
        
        return curYearIncome

    # start 4
    def investmentsSimul(self, year, curYearIncome):
        """
        Calculate income, returns, and expenses per investment type accurately
        Args:
            year: current simulation year
            curYearIncome: cumulative annual income up to current year
        Returns:
            dictionary: {"income": updated income, "gains": capital gains}
        """
        # Store initial values for each investment at the start of the year
        start_values = {inv.id: inv.value for inv in self.data.investments}
        capitalGain = 0
        
        # Calculate income, returns, and expenses per investment type
        for invT in self.data.investmentTypes:
            for invs in self.data.investments:
                if invT.name != invs.investmentType:
                    continue
                # 1. Calculate income (dividends, etc.)
                if invT.incomeAmtOrPct == "amount":
                    if invT.incomeDistribution["type"] == kFixed:
                        income = invT.incomeDistribution["value"]
                    elif invT.incomeDistribution["type"] == kUniform:
                        income = np.random.uniform(invT.incomeDistribution["lower"], invT.incomeDistribution["upper"])
                    else:
                        income = np.random.normal(invT.incomeDistribution["mean"], invT.incomeDistribution["stdev"])
                else:  # percent
                    if invT.incomeDistribution["type"] == kFixed:
                        income = invs.value * invT.incomeDistribution["value"]
                    elif invT.incomeDistribution["type"] == kUniform:
                        income = invs.value * np.random.uniform(invT.incomeDistribution["lower"], invT.incomeDistribution["upper"])
                    else:
                        income = invs.value * np.random.normal(invT.incomeDistribution["mean"], invT.incomeDistribution["stdev"])
                # 2. Add income to investment value
                invs.value += income
                # 3. Accumulate taxable income only for taxable income
                if invT.taxability and invs.taxStatus == "non-retirement":
                    curYearIncome += income
                # 4. Calculate returns (capital gains) and apply (compound)
                if invT.returnAmtOrPct == "amount":
                    if invT.returnDistribution["type"] == kFixed:
                        change = invT.returnDistribution["value"]
                    elif invT.returnDistribution["type"] == kUniform:
                        change = np.random.uniform(invT.returnDistribution["lower"], invT.returnDistribution["upper"])
                    else:
                        change = np.random.normal(invT.returnDistribution["mean"], invT.returnDistribution["stdev"])
                    invs.value += change
                    # 현금성 투자(capitalGain 무시)
                    if invs.investmentType != "cash":
                        capitalGain += change
                else:  # percent
                    if invT.returnDistribution["type"] == kFixed:
                        rate = invT.returnDistribution["value"]
                    elif invT.returnDistribution["type"] == kUniform:
                        rate = np.random.uniform(invT.returnDistribution["lower"], invT.returnDistribution["upper"])
                    else:
                        rate = np.random.normal(invT.returnDistribution["mean"], invT.returnDistribution["stdev"])
                    change = invs.value * rate
                    invs.value += change
                    if invs.investmentType != "cash":
                        capitalGain += change
        # 5. Expense deduction: use average of start-of-year/end-of-year values
        for invT in self.data.investmentTypes:
            for invs in self.data.investments:
                if invT.name != invs.investmentType:
                    continue
                start_val = start_values[invs.id]
                end_val = invs.value
                avg_val = (start_val + end_val) / 2
                expense = avg_val * invT.expenseRatio
                invs.value -= expense
        
        return {"income": curYearIncome, "gains": capitalGain}

    # start 5
    def RCOptimizer(self, curYearIncome: int, curYearSS: int, year: int):
        """
        Roth conversion optimizer function
        - Convert pre-tax to after-tax up to standard deduction limit
        - Apply standard deduction when calculating income tax
        - Process accounts in Roth conversion strategy order
        Args:
            curYearIncome: total income sum up to current year
            curYearSS: current year social security income
            year: current simulation year
        Returns:
            (rc_amount, updated_income): converted amount, updated income
        """
        if not hasattr(self.data, 'RothConversionOpt') or not self.data.RothConversionOpt:
            return 0, curYearIncome
            
        # Check Roth Conversion period
        rc_start_year = getattr(self.data, 'RothConversionStart', year+1)  # Default value is next year (no conversion)
        rc_end_year = getattr(self.data, 'RothConversionEnd', year)  # Default value is current year (no conversion)
        
        if year < rc_start_year or year > rc_end_year:
            return 0, curYearIncome
            
        # Check current standard deduction limit
        standard_deduction = self.getStandardDeduction(self.data)
        
        # Modify: only 85% of social security income is taxable
        taxable_ss = 0.85 * curYearSS if curYearSS > 0 else 0
        
        # Modify: taxable income = total income - standard deduction
        taxable_income = max(0, curYearIncome - standard_deduction)
        
        # Check tax brackets
        federal_brackets = self.getFederalBrackets(self.data, year)
        
        # Find current tax bracket
        current_bracket_upper = 0
        for rate, bracket in federal_brackets:
            if taxable_income <= bracket:
                current_bracket_upper = bracket
                break
                
        if current_bracket_upper == 0:
            # Maximum tax bracket reached
            return 0, curYearIncome
            
        # Calculate converted amount: bracket upper - taxable income
        rc_amount = max(0, current_bracket_upper - taxable_income)
        
        if rc_amount <= 0:
            return 0, curYearIncome
            
        # Perform conversion
        remaining_rc = rc_amount
        total_converted = 0
        
        # Transfer from pre-tax to after-tax accounts according to Roth conversion strategy
        # If no strategy, use default value of first pre-tax account
        rc_strategy = getattr(self.data, 'RothConversionStrategy', [])
        if not rc_strategy:
            # If no strategy, use first pre-tax account
            for inv in self.data.investments:
                if inv.taxStatus == "pre-tax" and inv.value > 0:
                    rc_strategy.append(inv.id)
                    break
                    
        for rc_inv_id in rc_strategy:
            if remaining_rc <= 0:
                break
                
            # Find source investment
            source_inv = None
            for inv in self.data.investments:
                if inv.id == rc_inv_id and inv.taxStatus == "pre-tax":
                    source_inv = inv
                    break
            
            if source_inv is None or source_inv.value <= 0:
                continue
                
            # Calculate conversion amount from this account
            conversion = min(remaining_rc, source_inv.value)
            
            # Find or create corresponding after-tax account
            target_inv = None
            for inv in self.data.investments:
                if (inv.investmentType == source_inv.investmentType and 
                    inv.taxStatus == "after-tax"):
                    target_inv = inv
                    break
            
            if target_inv is None:
                # Create new after-tax account
                target_inv = sc.Investment(
                    id=f"{source_inv.id}_aftertax",
                    investmentType=source_inv.investmentType,
                    taxStatus="after-tax",
                    value=0
                )
                self.data.investments.append(target_inv)
                self.purchaseDict[target_inv.id] = 0
                self.initialInvestmentValue[target_inv.id] = 0
            
            # Transfer funds
            source_inv.value -= conversion
            target_inv.value += conversion
            remaining_rc -= conversion
            total_converted += conversion
        
        # Add converted amount to income (for tax calculation purposes)
        updated_income = curYearIncome + total_converted
        
        return total_converted, updated_income

    # start 6, 7
    def sumNonDiscretionary(self):
        sum_amount = 0
        for env in self.data.eventSeries:
            if env.type == "expense":
                if env.discretionary == False:
                    sum_amount += env.initialAmount
        return sum_amount

    def sumDiscretionary(self):
        sum_amount = 0
        for env in self.data.eventSeries:
            if env.type == "expense":
                if env.discretionary == True:
                    sum_amount += env.initialAmount
        return sum_amount

    def expenseSimul(self, ev, amount:int, year:int):
        """
        Process expense event and return amount.
        Args:
            ev: expense event
            amount: initial expense amount
            year: current simulation year
        Returns:
            expense amount (apply inflation and change rate)
        """
        if ev.type != "expense":
            raise ValueError("Event type is not expense")
        
        # Check if event is active in current year
        if not self.checkYear(ev, year):
            return 0
        
        # Calculate change amount
        if ev.changeAmtOrPct == "amount":
            if ev.changeDistribution["type"] == kFixed:
                inf_amount = amount + ev.changeDistribution["value"]
            elif ev.changeDistribution["type"] == kUniform:
                inf_amount = amount + np.random.uniform(ev.changeDistribution["lower"], ev.changeDistribution["upper"])
            else:
                inf_amount = amount + np.random.normal(ev.changeDistribution["mean"], ev.changeDistribution["stdev"])
        else:  # percent
            if ev.changeDistribution["type"] == kFixed:
                inf_amount = amount * (1 + ev.changeDistribution["value"])
            elif ev.changeDistribution["type"] == kUniform:
                inf_amount = amount * (1 + np.random.uniform(ev.changeDistribution["lower"], ev.changeDistribution["upper"]))
            else:
                inf_amount = amount * (1 + np.random.normal(ev.changeDistribution["mean"], ev.changeDistribution["stdev"]))
        
        # Apply inflation
        if ev.inflationAdjusted:
            infAdj = self.inf.runInflation()
            if self.data.inflationAssumption["type"] == kFixed:
                inf_amount += inf_amount * (1 + infAdj) ** (year - self.year)
            else:
                inf_amount += inf_amount * np.prod(1 + np.clip(infAdj, -0.99, None))

        # Mortality adjustment (userFraction)
        if hasattr(ev, 'userFraction'):
            user_alive = True
            spouse_alive = True
            if len(self.data.birthYears) > 0 and len(self.data.lifeExpectancy) > 0:
                user_death_year = self.data.birthYears[0] + (self.data.lifeExpectancy[0]["value"] if self.data.lifeExpectancy[0]["type"] == "fixed" else self.data.lifeExpectancy[0]["mean"])
                if year >= user_death_year:
                    user_alive = False
            if self.data.maritalStatus == "couple" and len(self.data.birthYears) > 1 and len(self.data.lifeExpectancy) > 1:
                spouse_death_year = self.data.birthYears[1] + (self.data.lifeExpectancy[1]["value"] if self.data.lifeExpectancy[1]["type"] == "fixed" else self.data.lifeExpectancy[1]["mean"])
                if year >= spouse_death_year:
                    spouse_alive = False
            fraction = 1.0
            if not user_alive:
                fraction -= ev.userFraction
            if self.data.maritalStatus == "couple" and not spouse_alive:
                fraction -= (1.0 - ev.userFraction)
                fraction = max(0, fraction)
            inf_amount *= fraction

        # 현금 차감은 여기서 하지 않음 (중복 방지)
        return inf_amount

    def sellInvestment(self, inv, purchaseDict: dict, full=True, f=0.0):
        """
        Calculate capital gain/income gain when selling an investment, handle partial sale, manage purchaseDict
        """
        # 현금성 투자(capitalGain 무시)
        if inv.investmentType == "cash":
            return 0
        purchase = purchaseDict[inv.id] + self.initialInvestmentValue[inv.id]
        if full:
            capitalgain = inv.value - purchase
            purchaseDict[inv.id] = 0  # Reset capital gain when selling all
            return capitalgain
        else:
            # Partial sale: f is sale ratio
            capitalgain = f * (inv.value - ((1 - f) * purchase))
            purchaseDict[inv.id] = (1 - f) * purchase  # Update remaining purchase amount
            return capitalgain

    def expensePurchase(self, w, capitalgain: int, curYearIncome: int, curYearEarlyWithdrawals: int):
        """
        Withdrawal priority according to strategy, accumulate capital gain/income/early withdrawal, avoid duplicates
        Avoid infinite loop: print warning and break if no withdrawal occurs
        """
        total_amount_sold = 0
        while total_amount_sold < w:
            sold_this_round = 0  # Amount withdrawn in this round
            for name in self.data.expenseWithdrawalStrategy:
                for inv in self.data.investments:
                    if inv.id == name and inv.value > 0:
                        withdraw_amt = min(inv.value, w - total_amount_sold)
                        if inv.taxStatus == "non-retirement":
                            f = withdraw_amt / inv.value if inv.value > 0 else 0
                            capitalgain += self.sellInvestment(inv, self.purchaseDict, full=(withdraw_amt == inv.value), f=f)
                        elif inv.taxStatus == "pre-tax":
                            curYearIncome += withdraw_amt
                            curYearEarlyWithdrawals += withdraw_amt
                        else:
                            curYearEarlyWithdrawals += withdraw_amt
                        inv.value -= withdraw_amt
                        total_amount_sold += withdraw_amt
                        sold_this_round += withdraw_amt
                        if total_amount_sold >= w:
                            break
                if total_amount_sold >= w:
                    break
            if sold_this_round == 0:
                print(f"[Warning] Insufficient balance in priority account for {w - total_amount_sold} withdrawal.")
                break
        return capitalgain, curYearIncome, curYearEarlyWithdrawals

    def payTax(self, curYearIncome, curYearSS, curYearGains, curYearEarlyWithdrawals, email=None):
        """
        Handle tax and expenses accurately by year: (1) tax/expense calculation, (2) withdrawal priority per investment, (3) asset flow separation, (4) avoid duplicates
        Returns: (federalTax, stateTax, capitalGainTax, earlyWithdrawalTax)
        """
        # 1. Tax calculation
        federalTax, stateTax = self.tax.federalTaxCalculator(self.data, curYearIncome, curYearSS, email)
        cgTax = self.tax.capitalGainTax(self.data, curYearGains)
        ewTax = self.tax.earlyWithdrawal(self.data, curYearEarlyWithdrawals)

        if federalTax is None:
            print("federal tax is None, using 0 instead")
            federalTax = 0
        if stateTax is None:
            print("state tax is None, using 0 instead")
            stateTax = 0
        if cgTax is None:
            print("capital gains tax is None, using 0 instead")
            cgTax = 0
        if ewTax is None:
            print("early withdrawal tax is None, using 0 instead")
            ewTax = 0

        # 현금 차감은 여기서 하지 않음 (중복 방지)
        return federalTax, stateTax, cgTax, ewTax

    def buyInvestment(self, curYear):
        """
        Handle investment event: (1) investment limit, (2) asset allocation, (3) after-tax limit exceeded, (4) manage purchaseDict, (5) prioritize cash investment
        """
        maxCash = 0
        asset_allocation = {}
        invest_event = None

        # 1. Search for investment event in current year
        for ev in self.data.eventSeries:
            if ev.type == "invest":
                # Year condition processing
                if ev.invest.start["type"] == kFixed and ev.invest.start["value"] == curYear:
                    invest_event = ev
                    break
                elif ev.invest.start["type"] == "startWith":
                    target = ev.invest.start["eventSeries"]
                    targetYear = 0
                    for evs in self.data.eventSeries:
                        if evs.name == target:
                            targetYear = evs.start["value"]
                    if targetYear == curYear:
                        invest_event = ev
                        break
                elif ev.invest.start["type"] == "startAfter":
                    target = ev.invest.start["eventSeries"]
                    targetYear = 0
                    for evs in self.data.eventSeries:
                        if evs.name == target:
                            targetYear = evs.start["value"]+1
                    if targetYear == curYear:
                        invest_event = ev
                        break
                elif ev.invest.start["type"] == kUniform:
                    ev.invest.start = {"type": kFixed, "value": np.random.uniform(ev.invest.start["lower"], ev.invest.start["upper"])}
                elif ev.invest.start["type"] == kNormal:
                    ev.invest.start = {"type": kFixed, "value": np.random.normal(ev.invest.start["mean"], ev.invest.start["stdev"])}

        if invest_event is None:
            return  # No investment event in current year

        maxCash = invest_event.invest.maxCash
        asset_allocation = invest_event.invest.assetAllocation

        # 2. Calculate after-tax limit (apply inflation)
        L = self.limitInflation(curYear, self.inf.runInflation())
        after_tax_investments = [inv for inv in self.data.investments if inv.taxStatus == "after-tax"]
        B = sum(maxCash * asset_allocation.get(inv.id, 0) for inv in after_tax_investments)

        # 3. Adjust ratio if after-tax limit exceeded, remaining amount to non-retirement
        if B > L and B > 0:
            adjustment_ratio = L / B
            remaining_amount = maxCash
            for inv in after_tax_investments:
                allocation = asset_allocation.get(inv.id, 0)
                purchase_amount = maxCash * allocation * adjustment_ratio
                inv.value += purchase_amount
                self.purchaseDict[inv.id] += purchase_amount
                remaining_amount -= purchase_amount
            # Remaining cash to non-retirement
            non_retirement_investments = [inv for inv in self.data.investments if inv.taxStatus == "non-retirement"]
            for inv in non_retirement_investments:
                allocation = asset_allocation.get(inv.id, 0)
                purchase_amount = remaining_amount * allocation
                inv.value += purchase_amount
                self.purchaseDict[inv.id] += purchase_amount
        else:
            # If within limit, distribute as usual
            for inv in self.data.investments:
                allocation = asset_allocation.get(inv.id, 0)
                purchase_amount = maxCash * allocation
                inv.value += purchase_amount
                self.purchaseDict[inv.id] += purchase_amount

    def rebalanceEventSimul(self, ev, year: int):
        """
        Handle rebalancing event:
        (1) Calculate capital gain, (2) Clarify purchase/sale order, (3) Update purchaseDict
        Args:
            ev: rebalancing event
            year: current simulation year
        Returns:
            capital_gains: capital gain from rebalancing
        """
        if ev.type != "rebalance":
            raise ValueError("Event type is not rebalance")
        
        # 1. Filter target tax status (taxStatus) accounts
        # Target all investments and only account IDs included in assetAllocation
        target_investments = []
        
        for inv in self.data.investments:
            # Select only accounts included in assetAllocation
            if hasattr(ev, 'assetAllocation') and inv.id in ev.assetAllocation:
                target_investments.append(inv)
        
        if not target_investments:
            return 0  # No target investment
        
        # 2. Calculate current total value
        total_value = sum(inv.value for inv in target_investments)
        if total_value <= 0:
            return 0  # No rebalancing needed if total value is 0 or less
        
        # 3. Calculate target asset allocation ratio
        target_allocations = {}
        
        if hasattr(ev, 'glidePath') and ev.glidePath:
            # If glide path exists, apply linear change over time
            start_year = ev.start["value"] if ev.start["type"] == kFixed else year
            end_year = start_year + ev.duration - 1
            progress = min(1.0, max(0.0, (year - start_year) / max(1, end_year - start_year)))
            initial_allocation = ev.assetAllocation  # Starting allocation
            final_allocation = ev.assetAllocation2 if hasattr(ev, 'assetAllocation2') else ev.assetAllocation  # Ending allocation
            for inv_id, start_pct in initial_allocation.items():
                end_pct = final_allocation.get(inv_id, 0)
                current_pct = start_pct + progress * (end_pct - start_pct)
                if current_pct > 0:
                    target_allocations[inv_id] = current_pct
        else:
            # Use fixed asset allocation
            target_allocations = ev.assetAllocation
        
        # Normalize target ratio (sum to 100%)
        total_pct = sum(target_allocations.values())
        if total_pct <= 0:
            return 0
        
        normalized_allocations = {k: v / total_pct for k, v in target_allocations.items()}
        
        # 4. Calculate difference between current state and target state
        sell_list = []  # List of (investment, sell amount) tuples
        buy_dict = {}   # Purchase amount per investmentID
        
        # First, calculate all sell amounts
        for inv in target_investments:
            current_value = inv.value
            target_pct = normalized_allocations.get(inv.id, 0)
            target_value = total_value * target_pct
            
            if current_value > target_value:
                # Sell needed
                sell_amount = current_value - target_value
                sell_list.append((inv, sell_amount))
            elif current_value < target_value:
                # Buy needed
                buy_amount = target_value - current_value
                buy_dict[inv.id] = buy_amount
        
        # 5. Process all sells first and calculate capital gain
        capital_gains = 0
        cash_available = 0
        
        for inv, sell_amount in sell_list:
            if inv.value <= 0 or sell_amount <= 0:
                continue
            # Calculate sell ratio
            sell_fraction = min(1.0, sell_amount / inv.value)
            # Calculate capital gain (only for non-retirement accounts, cash 제외)
            if inv.taxStatus == "non-retirement" and inv.investmentType != "cash":
                gain = self.sellInvestment(inv, self.purchaseDict, full=False, f=sell_fraction)
                capital_gains += gain
            else:
                # Retirement accounts or cash do not need capital gain calculation, just adjust value
                inv.value -= sell_amount
            cash_available += sell_amount
        
        # 6. Process cash purchase
        for inv_id, buy_amount in buy_dict.items():
            if cash_available <= 0 or buy_amount <= 0:
                continue
                
            # Calculate actual purchasable amount
            actual_buy = min(cash_available, buy_amount)
            cash_available -= actual_buy
            
            # Find corresponding investment
            target_inv = None
            for inv in self.data.investments:
                if inv.id == inv_id:
                    target_inv = inv
                    break
                    
            if target_inv is None:
                # Cannot find corresponding investment - ignore
                continue
                
            # Increase investment value and update purchase
            target_inv.value += actual_buy
            if target_inv.taxStatus == "non-retirement":
                self.purchaseDict[target_inv.id] += actual_buy
                
        # 7. Remaining cash moves to cash investment
        if cash_available > 0:
            cash_investment = None
            for inv in self.data.investments:
                if inv.investmentType == "cash" and inv.taxStatus == "non-retirement":
                    cash_investment = inv
                    break
                    
            if cash_investment:
                cash_investment.value += cash_available
                
        return capital_gains

    def simulation(self, email, emailNeed = False):
        """
        Implement full year-by-year simulation flow according to algorithm requirements
        (1) Use refactored incomeEventSimul etc. functions, (2) Avoid duplicate accumulation/updates, (3) Separate asset flow, (4) Store yearly state
        """
        updated_scenarios = []
        self.yearly_data = {}

        for year in range(self.year, self.duration + 1):
            curInflation = self.inf.runInflation()
            self.taxInflation(year, curInflation)
            curLimit = self.limitInflation(year, curInflation)
            
            prev_year_pretax_values = [inv.value for inv in self.data.investments if inv.taxStatus == "pre-tax"]

            curYearIncome = 0
            curYearSS = 0
            curYearGains = 0
            curYearEarlyWithdrawals = 0
            capitalGain = 0
            curYearExpense = {}  # category: amount
            curYearInvest = {}

            # 1. Process income event
            for ev in self.data.eventSeries:
                if ev.type == "income":
                    if self.checkYear(ev, year):
                        evt_ss, evt_income = self.incomeEventSimul(ev, ev.initialAmount, year)
                        curYearSS += evt_ss
                        curYearIncome += evt_income

            # 2. Process RMD (73 years and above, based on previous year's pre-tax account)
            current_age = year - self.data.birthYears[0]
            if current_age >= 73:
                rmd_amount, remaining_rmd = self.calculateRMD(year, current_age, prev_year_pretax_values)
                processed_rmd = self.processRMD(rmd_amount, remaining_rmd)
                curYearIncome += processed_rmd

            # 3. Process investment income/expenses
            year_investment_results = self.investmentsSimul(year, curYearIncome)
            curYearIncome = year_investment_results["income"]
            curYearGains += year_investment_results["gains"]

            # 4. Process Roth conversion
            rc_amount = 0
            if hasattr(self.data, 'RothConversionOpt') and self.data.RothConversionOpt:
                if hasattr(self.data, 'RothConversionStart') and hasattr(self.data, 'RothConversionEnd'):
                    if self.data.RothConversionStart <= year <= self.data.RothConversionEnd:
                        rc_amount, curYearIncome = self.RCOptimizer(curYearIncome, curYearSS, year)

            # 5. Process non-discretionary expenses and previous year's taxes
            nondis_expense_total = 0
            for ev in self.data.eventSeries:
                if ev.type == "expense" and hasattr(ev, 'discretionary') and not ev.discretionary:
                    if self.checkYear(ev, year):
                        amt = self.expenseSimul(ev, ev.initialAmount, year)
                        category = getattr(ev, "name", "unknown")
                        curYearExpense[category] = curYearExpense.get(category, 0) + amt
                        nondis_expense_total += amt
            # 세금 계산
            federalTax, stateTax, cgTax, ewTax = self.payTax(curYearIncome, curYearSS, curYearGains, curYearEarlyWithdrawals, email)
            curYearTax = {
                'federal': federalTax,
                'state': stateTax,
                'capital_gains': cgTax,
                'early_withdrawal': ewTax
            }
            # 비재량지출+세금 총합 출금 (현금 부족시 투자 매도)
            total_payment = nondis_expense_total + federalTax + stateTax + cgTax + ewTax
            cash = 0
            for inv in self.data.investments:
                if inv.investmentType == "cash":
                    cash = inv.value
                    break
            withdrawal = total_payment - cash
            if withdrawal > 0:
                capitalGain, curYearIncome, curYearEarlyWithdrawals = self.expensePurchase(withdrawal, capitalGain, curYearIncome, curYearEarlyWithdrawals)
            for inv in self.data.investments:
                if inv.investmentType == "cash":
                    inv.value = max(0, inv.value - total_payment)
                    break

            # 6. Process discretionary expenses in spendingStrategy order
            discretionary_left = True
            for cat in getattr(self.data, 'spendingStrategy', []):
                for ev in self.data.eventSeries:
                    if ev.type == "expense" and hasattr(ev, 'discretionary') and ev.discretionary and getattr(ev, 'name', None) == cat:
                        if self.checkYear(ev, year):
                            amt = self.expenseSimul(ev, ev.initialAmount, year)
                            # 재량지출은 자산이 financialGoal 아래로 떨어지지 않는 한만 지출
                            total_assets = sum(inv.value for inv in self.data.investments)
                            if total_assets - amt < getattr(self.data, 'financialGoal', 0):
                                # 부분만 지출
                                amt = max(0, total_assets - getattr(self.data, 'financialGoal', 0))
                                discretionary_left = False
                            # 출금 처리 (현금 부족시 투자 매도 등)
                            if amt > 0:
                                cash = 0
                                for inv in self.data.investments:
                                    if inv.investmentType == "cash":
                                        cash = inv.value
                                        break
                                withdrawal = amt - cash
                                if withdrawal > 0:
                                    capitalGain, curYearIncome, curYearEarlyWithdrawals = self.expensePurchase(withdrawal, capitalGain, curYearIncome, curYearEarlyWithdrawals)
                                for inv in self.data.investments:
                                    if inv.investmentType == "cash":
                                        inv.value = max(0, inv.value - amt)
                                        break
                            curYearExpense[cat] = curYearExpense.get(cat, 0) + amt
                        if not discretionary_left:
                            break
                if not discretionary_left:
                    break

            # 7. Process investment
            for ev in self.data.eventSeries:
                if ev.type == "invest":
                    if self.checkYear(ev, year):
                        self.buyInvestment(year)

            # 8. Process rebalancing
            for ev in self.data.eventSeries:
                if ev.type == "rebalance":
                    if self.checkYear(ev, year):
                        additional_gains = self.rebalanceEventSimul(ev, year)
                        curYearGains += additional_gains

            total_assets = sum(inv.value for inv in self.data.investments)
            curYearInvest = {}
            for inv in self.data.investments:
                category = inv.investmentType
                curYearInvest[category] = curYearInvest.get(category, 0) + inv.value

            self.yearly_data[year] = {
                "total_assets": total_assets,
                "income": curYearIncome,
                "expense": curYearExpense,
                "social_security": curYearSS,
                "capital_gains": curYearGains,
                "tax": curYearTax,
                "invest": curYearInvest,
                "investments": {inv.id: inv.value for inv in self.data.investments}
            }

            # Store output data
            updated_scenarios.append((int(year), float(total_assets)))

        return updated_scenarios

    def checkYear(self, ev, current_year):
        """
        Utility function to check if event is active in current year
        Args:
            ev: event object
            current_year: current simulation year
        Returns:
            bool: True if event is active in current year
        """
        # Scenario data structure check to determine if event is active in current year
        
        # YAML structure assumed to be interpreted as follows:
        # Example: 
        # eventSeries:
        # - name: salary
        #   type: income
        #   start: {"type": "fixed", "value": 2025}
        #   duration: {"type": "fixed", "value": 40}
        
        # Default to start year and duration
        start_year = self.year  # Default to simulation start year
        duration = 1  # Default duration period is 1 year
        
        # Defensive programming: use default value if attribute is missing
        try:
            if hasattr(ev, 'start'):
                start_info = ev.start
                
                if isinstance(start_info, dict) and 'type' in start_info:
                    start_type = start_info['type']
                    
                    if start_type == kFixed and 'value' in start_info:
                        start_year = start_info['value']
                    elif start_type == kNormal and 'mean' in start_info and 'stdev' in start_info:
                        # If stored value is missing, sample
                        if not hasattr(ev, 'sampled_start_year'):
                            ev.sampled_start_year = round(np.random.normal(start_info['mean'], start_info['stdev']))
                        start_year = ev.sampled_start_year
                    elif start_type == kUniform and 'lower' in start_info and 'upper' in start_info:
                        # If stored value is missing, sample
                        if not hasattr(ev, 'sampled_start_year'):
                            ev.sampled_start_year = round(np.random.uniform(start_info['lower'], start_info['upper']))
                        start_year = ev.sampled_start_year
                    elif start_type == "startWith" and 'eventSeries' in start_info:
                        # If event reference cannot be processed, return current year
                        start_year = current_year
                    elif start_type == "startAfter" and 'eventSeries' in start_info:
                        # If event reference cannot be processed, return current year
                        start_year = current_year
            
            # Duration processing
            if hasattr(ev, 'duration'):
                duration_info = ev.duration
                
                if isinstance(duration_info, dict) and 'type' in duration_info:
                    duration_type = duration_info['type']
                    
                    if duration_type == kFixed and 'value' in duration_info:
                        duration = duration_info['value']
                    elif duration_type == kNormal and 'mean' in duration_info and 'stdev' in duration_info:
                        if not hasattr(ev, 'sampled_duration'):
                            ev.sampled_duration = round(np.random.normal(duration_info['mean'], duration_info['stdev']))
                        duration = ev.sampled_duration
                    elif duration_type == kUniform and 'lower' in duration_info and 'upper' in duration_info:
                        if not hasattr(ev, 'sampled_duration'):
                            ev.sampled_duration = round(np.random.uniform(duration_info['lower'], duration_info['upper']))
                        duration = ev.sampled_duration
                elif isinstance(duration_info, (int, float)):
                    # 직접 숫자가 제공된 경우
                    duration = duration_info
                
                # 지속 기간이 0 이하일 경우 기본값 1 사용
                if duration <= 0:
                    duration = 1
        except Exception as e:
            print(f"이벤트 연도 확인 중 오류: {e}. 현재 연도를 사용합니다.")
            # 오류 발생 시 현재 연도만 활성화 (안전장치)
            return current_year == start_year
            
        # 현재 연도가 시작~종료 범위에 있는지 확인
        return start_year <= current_year <= start_year + duration - 1

    def getStandardDeduction(self, data):
        """
        Returns the standard deduction amount according to the scenario.
        Args:
            data: scenario data
        Returns:
            standard deduction amount
        """
        if "standardDeduction" in self.tax.federalTax:
            return self.tax.federalTax["standardDeduction"].get(data.maritalStatus, 0)
        else:
            # Set default value (2022 standard deduction)
            return 12950 if data.maritalStatus == "individual" else 25900

    def getFederalBrackets(self, data, year=None):
        """
        Returns the tax bracket information.
        Args:
            data: scenario data
            year: simulation year (optional)
        Returns:
            List of tuples of (rate, bracket upper bound): [(rate, bracket_upper), ...]
        """
        # Select bracket by marital status
        brackets = self.tax.federalTax.get("couple" if data.maritalStatus == "couple" else "individual", {})
        
        # Convert brackets to tuple list
        bracket_list = []
        for threshold, rate in brackets.items():
            if threshold == "inf":
                continue
            if isinstance(threshold, str) and threshold.isdigit():
                threshold = int(threshold)
            bracket_list.append((rate, threshold))
        
        # Sort by bracket upper bound
        bracket_list.sort(key=lambda x: x[1])
        
        return bracket_list