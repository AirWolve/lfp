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
    def taxInflation(self, year:int):
        """
        Calculate inflation-adjusted tax brackets for the current simulation year.
        
        For fixed inflation rate:
            - Uses compound growth formula directly from base values
        For distribution-based inflation:
            - Applies current year's inflation rate to previous year's thresholds
        
        Args:
        ----
            year: Current simulation year
        """
        curInfAssum = self.inf.runInflation()
        
        # Store base values if not already stored
        if not hasattr(self, 'base_brackets'):
            self.base_brackets = {
                'individual': {k: int(k) if k != 'inf' else k for k, v in self.tax.federalTax['individual'].items()},
                'couple': {k: int(k) if k != 'inf' else k for k, v in self.tax.federalTax['couple'].items()},
                'cap_individual': {k: int(k) if k != 'inf' else k for k, v in self.tax.capTax['individual'].items()},
                'cap_couple': {k: int(k) if k != 'inf' else k for k, v in self.tax.capTax['couple'].items()}
            }
            self.prev_year_brackets = {
                'individual': self.base_brackets['individual'].copy(),
                'couple': self.base_brackets['couple'].copy(),
                'cap_individual': self.base_brackets['cap_individual'].copy(),
                'cap_couple': self.base_brackets['cap_couple'].copy()
            }

        # Update federal tax brackets
        ind_tax = {}
        cou_tax = {}
        
        # Process individual brackets
        for key, value in self.tax.federalTax["individual"].items():
            if key == "inf":
                ind_tax[key] = value
                continue
                
            if self.data.inflationAssumption["type"] == kFixed:
                # For fixed rate, calculate directly from base value
                inftax = self.base_brackets['individual'][key] * (1 + curInfAssum) ** (year - self.year)
            else:
                # For distribution-based, apply current year's inflation to previous year's value
                inftax = self.prev_year_brackets['individual'][key] * (1 + curInfAssum)
                self.prev_year_brackets['individual'][key] = inftax
            ind_tax[inftax] = value

        # Process couple brackets
        for key, value in self.tax.federalTax["couple"].items():
            if key == "inf":
                cou_tax[key] = value
                continue
                
            if self.data.inflationAssumption["type"] == kFixed:
                inftax = self.base_brackets['couple'][key] * (1 + curInfAssum) ** (year - self.year)
            else:
                inftax = self.prev_year_brackets['couple'][key] * (1 + curInfAssum)
                self.prev_year_brackets['couple'][key] = inftax
            cou_tax[inftax] = value

        self.tax.federalTax["individual"] = ind_tax
        self.tax.federalTax["couple"] = cou_tax

        # Update capital gains tax brackets
        ind_tax = {}
        cou_tax = {}

        # Process individual capital gains brackets
        for key, value in self.tax.capTax["individual"].items():
            if key == "inf":
                ind_tax[key] = value
                continue
                
            if self.data.inflationAssumption["type"] == kFixed:
                inftax = self.base_brackets['cap_individual'][key] * (1 + curInfAssum) ** (year - self.year)
            else:
                inftax = self.prev_year_brackets['cap_individual'][key] * (1 + curInfAssum)
                self.prev_year_brackets['cap_individual'][key] = inftax
            ind_tax[inftax] = value

        # Process couple capital gains brackets
        for key, value in self.tax.capTax["couple"].items():
            if key == "inf":
                cou_tax[key] = value
                continue
                
            if self.data.inflationAssumption["type"] == kFixed:
                inftax = self.base_brackets['cap_couple'][key] * (1 + curInfAssum) ** (year - self.year)
            else:
                inftax = self.prev_year_brackets['cap_couple'][key] * (1 + curInfAssum)
                self.prev_year_brackets['cap_couple'][key] = inftax
            cou_tax[inftax] = value

        self.tax.capTax["individual"] = ind_tax
        self.tax.capTax["couple"] = cou_tax

    def limitInflation(self, year:int):
        """
        This function is for calculating the after tax contribution limit with inflation assumption
        """
        curInfAssum = self.inf.runInflation()
        if self.data.inflationAssumption["type"] == kFixed:
            return self.data.afterTaxContributionLimit * (1+curInfAssum) ** (year - self.year)
        else:
            return self.data.afterTaxContributionLimit * np.prod(1+np.clip(curInfAssum, -0.99, None))
    # end 1

    # start 2
    def incomeEventSimul(self, ev, amount:int, year:int):
        if ev.type != "income":
            raise ValueError("Event type is not income")
        elif ev.type == "income":
            for inv in self.data.investments:
                if inv.investmentType == "cash":
                    inv.updateValue(inv.value+amount)   # update previous year income to cash amount
            if ev.changeAmtOrPct == "amount":
                if ev.changeDistribution["type"] == kFixed:
                    inf_amount = amount + ev.changeDistribution["value"]
                elif ev.changeDistribution["type"] == kUniform:
                    inf_amount = amount + np.random.uniform(ev.changeDistribution["lower"], ev.changeDistribution["upper"])
                elif ev.changeDistribution["type"] == kNormal:
                    inf_amount = amount + np.random.normal(ev.changeDistribution["mean"], ev.changeDistribution["stdev"])
                else:
                    print(ev.toDict())
            else:
                if ev.changeDistribution["type"] == kFixed:
                    inf_amount = amount * (1 + ev.changeDistribution["value"])
                elif ev.changeDistribution["type"] == kUniform:
                    inf_amount = amount * (1 + np.random.uniform(ev.changeDistribution["lower"], ev.changeDistribution["upper"]))
                elif ev.changeDistribution["type"] == kNormal:
                    inf_amount = amount * (1 + np.random.normal(ev.changeDistribution["mean"], ev.changeDistribution["stdev"]))
                else:
                    print(ev.toDict())
            if ev.inflationAdjusted == True:
                infAdj = self.inf.runInflation()
                if self.data.inflationAssumption["type"] == kFixed:
                    inf_amount += inf_amount * (1 + infAdj) ** (year - self.year)
                else:
                    inf_amount += inf_amount * (np.prod(1 + np.clip(infAdj, -0.99, None)))

            curYearIncome = 0
            curYearSS = 0

            if ev.socialSecurity == True:
                curYearSS = inf_amount
            else:
                curYearIncome = inf_amount

            return curYearSS, curYearIncome
    # end 2

    # start 3
    def RMDSimul(self, invId, year:int, curYearIncome, prop_inv:bool=False):
        inv = None
        rmd = 0
        
        for i in self.data.investments:
            if invId == i.id:
                inv = i
        
        if inv.taxStatus != "pre-tax":
            raise ValueError("Investment tax status is not pre-tax")

        elif inv.taxStatus == "pre-tax":
            curYear = year - self.data.birthYears[0]
            if curYear >= 73:
                d = self.rmd.runRMD(self.data, curYear)
                s = 0
                for invs in self.data.investments:
                    if invs.taxStatus == "pre-tax" and "IRA" not in invs.investmentType:
                        s += invs.value
                print(s, d)
                rmd = s/d
                curYearIncome += rmd
        # move the amount
        for invss in self.data.investments:
            if invss.investmentType == inv.investmentType and invss.taxStatus == "non-retirement":
                invss.value += rmd
                inv.value -= rmd
                prop_inv = True
        
        if prop_inv == False:
            new_inv = sc.Investments({"investmentType": inv.investmentType, "value": rmd, "taxStatus": "non-retirement", "id": inv.investmentType+"non-retirement"})
            self.data.investments.append(new_inv)
        
        return curYearIncome
    # end 3

    # start 4
    def investmentsSimul(self, curYearIncome, capitalGain):
        for invT in self.data.investmentTypes:
            avg_value = 0
            avg_count = 0
            for invs in self.data.investments:
                income = 0
                if invT.name == invs.investmentType:
                    if invT.incomeAmtOrPct == "amount":
                        if invT.incomeDistribution["type"] == kFixed:
                            income = invs.value + invT.incomeDistribution["value"]
                        elif invT.incomeDistribution["type"] == kUniform:
                            income = invs.value + np.random.uniform(invT.incomeDistribution["lower"], invT.incomeDistribution["upper"])
                        else:
                            income = invs.value + np.random.normal(invT.incomeDistribution["mean"], invT.incomeDistribution["stdev"])
                    else:
                        if invT.incomeDistribution["type"] == kFixed:
                            income = invs.value * (1 + invT.incomeDistribution["value"])
                        elif invT.incomeDistribution["type"] == kUniform:
                            income = invs.value * (1 + np.random.uniform(invT.incomeDistribution["lower"], invT.incomeDistribution["upper"]))
                        else:
                            income = invs.value * (1 + np.random.normal(invT.incomeDistribution["mean"], invT.incomeDistribution["stdev"]))
                    # calculate income
                
                    if invT.taxability == True and invs.taxStatus == "non-retirement":
                        curYearIncome += income

                    change = 0
                    if invT.returnAmtOrPct == "amount":
                        if invT.returnDistribution["type"] == kFixed:
                            change = invT.returnDistribution["value"]
                        elif invT.returnDistribution["type"] == kUniform:
                            change = np.random.uniform(invT.returnDistribution["lower"], invT.returnDistribution["upper"])
                        else:
                            change = np.random.normal(invT.returnDistribution["mean"], invT.returnDistribution["stdev"])
                    else:
                        if invT.returnDistribution["type"] == kFixed:
                            change = invs.value * (1 + invT.returnDistribution["value"])
                        elif invT.returnDistribution["type"] == kUniform:
                            change = invs.value * (1 + np.random.uniform(invT.returnDistribution["lower"], invT.returnDistribution["upper"]))
                        else:
                            change = invs.value * (1 + np.random.normal(invT.returnDistribution["mean"], invT.returnDistribution["stdev"]))
                    
                    capitalGain += change
                    # calculate change 3.d

                    invs.value += income
                    # 3.c
                    avg_count += 1
                    avg_value += invs.value
            # end of inner loop
            expense = avg_value/avg_count * invT.expenseRatio

            for invs in self.data.investments:
                if invs.investmentType == invT.name:
                    invs.value -= expense
            # calculate expense and subtract
        # end of outter loop
        return curYearIncome, capitalGain
    # end 4

    # start 5
    def RCOptimizer(self, infFedTax:dict, curYearIncome, curYearSS):
        curYearFedTaxableIncome = curYearIncome - 0.15*curYearSS
        u = 0   # upper bracket

        for key, value in infFedTax[self.data.maritalStatus].items():
            if key == "inf":
                u = "inf"
            elif curYearFedTaxableIncome < int(key):
                u = int(key)
                break
        
        rc = 0
        if u == "inf":
            rc = 10000000 - (curYearFedTaxableIncome - self.tax.federalTax["standardDeduction"][self.data.maritalStatus])
        else:
            rc = u - (curYearFedTaxableIncome - self.tax.federalTax["standardDeduction"][self.data.maritalStatus])
        curYearIncome += rc

        for roth in self.data.RothConversionStrategy:
            for invs in self.data.investments:
                if invs.taxStatus == "after-tax" and invs.investmentType in roth:
                    if rc >= invs.value:
                        rc -= invs.value
                        invs.value = 0
                    else:
                        invs.value -= rc
                    if rc == 0:
                        break
            if rc == 0:
                break

        return curYearIncome
    # end 5

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
        if ev.start["type"] == kFixed and ev.start["value"] == year:
            if ev.type != "expense":
                raise ValueError("Event type is not expense")
            elif ev.type == "expense":
                for inv in self.data.investments:
                    if inv.investmentType == "cash":
                        inv.updateValue(inv.value+amount)   # update previous year income to cash amount
                if ev.changeAmtOrPct == "amount":
                    if ev.changeDistribution["type"] == kFixed:
                        inf_amount = amount + ev.changeDistribution["value"]
                    elif ev.changeDistribution["type"] == kUniform:
                        inf_amount = amount + np.random.uniform(ev.changeDistribution["lower"], ev.changeDistribution["upper"])
                    else:
                        inf_amount = amount + np.random.normal(ev.changeDistribution["mean"], ev.changeDistribution["stdev"])
                else:
                    if ev.changeDistribution["type"] == kFixed:
                        inf_amount = amount * (1 + ev.changeDistribution["value"])
                    elif ev.changeDistribution["type"] == kUniform:
                        inf_amount = amount * (1 + np.random.uniform(ev.changeDistribution["lower"], ev.changeDistribution["upper"]))
                    else:
                        inf_amount = amount * (1 + np.random.normal(ev.changeDistribution["mean"], ev.changeDistribution["stdev"]))
                
                if ev.inflationAdjusted == True:
                    infAdj = self.inf.runInflation()
                    if self.data.inflationAssumption["type"] == kFixed:
                        inf_amount += inf_amount * (1 + infAdj) ** (year - self.year)
                    else:
                        inf_amount += inf_amount * np.prod(1 + np.clip(infAdj, -0.99, None))

                return inf_amount
            else:
                return 0
        elif ev.start["type"] == "startWith":
            targetYear = 0
            for evs in self.data.eventSeries:
                if evs.name == ev.start["eventSeries"]:
                    if evs.type == "invest":
                        targetYear = evs.invest.start["value"]
                    elif evs.type == "rebalance":
                        targetYear = evs.rebalance.start["value"]
                    else:
                        targetYear = evs.start["value"]
            if targetYear == year:
                if ev.type != "expense":
                    raise ValueError("Event type is not expense")
                elif ev.type == "expense":
                    for inv in self.data.investments:
                        if inv.investmentType == "cash":
                            inv.updateValue(inv.value+amount)   # update previous year income to cash amount
                    if ev.changeAmtOrPct == "amount":
                        if ev.changeDistribution["type"] == kFixed:
                            inf_amount = amount + ev.changeDistribution["value"]
                        elif ev.changeDistribution["type"] == kUniform:
                            inf_amount = amount + np.random.uniform(ev.changeDistribution["lower"], ev.changeDistribution["upper"])
                        else:
                            inf_amount = amount + np.random.normal(ev.changeDistribution["mean"], ev.changeDistribution["stdev"])
                    else:
                        if ev.changeDistribution["type"] == kFixed:
                            inf_amount = amount * (1 + ev.changeDistribution["value"])
                        elif ev.changeDistribution["type"] == kUniform:
                            inf_amount = amount * (1 + np.random.uniform(ev.changeDistribution["lower"], ev.changeDistribution["upper"]))
                        else:
                            inf_amount = amount * (1 + np.random.normal(ev.changeDistribution["mean"], ev.changeDistribution["stdev"]))
                    
                    if ev.inflationAdjusted == True:
                        infAdj = self.inf.runInflation()
                        if self.data.inflationAssumption["type"] == kFixed:
                            inf_amount += inf_amount * (1 + infAdj) ** (year - self.year)
                        else:
                            inf_amount += inf_amount * np.prod(1 + np.clip(infAdj, -0.99, None))

                    return inf_amount
            else:
                return 0
        elif ev.start["type"] == "startAfter":
            targetYear = 0
            for evs in self.data.eventSeries:
                if evs.name == ev.start["eventSeries"]:
                    if evs.type == "invest":
                        targetYear = evs.invest.start["value"] + 1
                    elif evs.type == "rebalance":
                        targetYear = evs.rebalance.start["value"] + 1
                    else:
                        targetYear = evs.start["value"]+1
            if targetYear == year:
                if ev.type != "expense":
                    raise ValueError("Event type is not expense")
                elif ev.type == "expense":
                    for inv in self.data.investments:
                        if inv.investmentType == "cash":
                            inv.updateValue(inv.value+amount)   # update previous year income to cash amount
                    if ev.changeAmtOrPct == "amount":
                        if ev.changeDistribution["type"] == kFixed:
                            inf_amount = amount + ev.changeDistribution["value"]
                        elif ev.changeDistribution["type"] == kUniform:
                            inf_amount = amount + np.random.uniform(ev.changeDistribution["lower"], ev.changeDistribution["upper"])
                        else:
                            inf_amount = amount + np.random.normal(ev.changeDistribution["mean"], ev.changeDistribution["stdev"])
                    else:
                        if ev.changeDistribution["type"] == kFixed:
                            inf_amount = amount * (1 + ev.changeDistribution["value"])
                        elif ev.changeDistribution["type"] == kUniform:
                            inf_amount = amount * (1 + np.random.uniform(ev.changeDistribution["lower"], ev.changeDistribution["upper"]))
                        else:
                            inf_amount = amount * (1 + np.random.normal(ev.changeDistribution["mean"], ev.changeDistribution["stdev"]))
                    
                    if ev.inflationAdjusted == True:
                        infAdj = self.inf.runInflation()
                        if self.data.inflationAssumption["type"] == kFixed:
                            inf_amount += inf_amount * (1 + infAdj) ** (year - self.year)
                        else:
                            inf_amount += inf_amount * np.prod(1 + np.clip(infAdj, -0.99, None))

                    return inf_amount
            else:
                return 0
        elif ev.start["type"] == kNormal:
            targetYear = np.random.normal(ev.start["mean"], ev.start["stdev"])
            ev.start = {"type": kFixed, "value": targetYear}
            if targetYear == year:
                if ev.type != "expense":
                    raise ValueError("Event type is not expense")
                elif ev.type == "expense":
                    for inv in self.data.investments:
                        if inv.investmentType == "cash":
                            inv.updateValue(inv.value+amount)   # update previous year income to cash amount
                    if ev.changeAmtOrPct == "amount":
                        if ev.changeDistribution["type"] == kFixed:
                            inf_amount = amount + ev.changeDistribution["value"]
                        elif ev.changeDistribution["type"] == kUniform:
                            inf_amount = amount + np.random.uniform(ev.changeDistribution["lower"], ev.changeDistribution["upper"])
                        else:
                            inf_amount = amount + np.random.normal(ev.changeDistribution["mean"], ev.changeDistribution["stdev"])
                    else:
                        if ev.changeDistribution["type"] == kFixed:
                            inf_amount = amount * (1 + ev.changeDistribution["value"])
                        elif ev.changeDistribution["type"] == kUniform:
                            inf_amount = amount * (1 + np.random.uniform(ev.changeDistribution["lower"], ev.changeDistribution["upper"]))
                        else:
                            inf_amount = amount * (1 + np.random.normal(ev.changeDistribution["mean"], ev.changeDistribution["stdev"]))
                    
                    if ev.inflationAdjusted == True:
                        infAdj = self.inf.runInflation()
                        if self.data.inflationAssumption["type"] == kFixed:
                            inf_amount += inf_amount * (1 + infAdj) ** (year - self.year)
                        else:
                            inf_amount += inf_amount * np.prod(1 + np.clip(infAdj, -0.99, None))

                    return inf_amount
            else:
                return 0
        elif ev.start["type"] == kUniform:
            targetYear = np.random.uniform(ev.start["lower"], ev.start["upper"])
            ev.start = {"type": kFixed, "value": targetYear}
            if targetYear == year:
                if ev.type != "expense":
                    raise ValueError("Event type is not expense")
                elif ev.type == "expense":
                    for inv in self.data.investments:
                        if inv.investmentType == "cash":
                            inv.updateValue(inv.value+amount)   # update previous year income to cash amount
                    if ev.changeAmtOrPct == "amount":
                        if ev.changeDistribution["type"] == kFixed:
                            inf_amount = amount + ev.changeDistribution["value"]
                        elif ev.changeDistribution["type"] == kUniform:
                            inf_amount = amount + np.random.uniform(ev.changeDistribution["lower"], ev.changeDistribution["upper"])
                        else:
                            inf_amount = amount + np.random.normal(ev.changeDistribution["mean"], ev.changeDistribution["stdev"])
                    else:
                        if ev.changeDistribution["type"] == kFixed:
                            inf_amount = amount * (1 + ev.changeDistribution["value"])
                        elif ev.changeDistribution["type"] == kUniform:
                            inf_amount = amount * (1 + np.random.uniform(ev.changeDistribution["lower"], ev.changeDistribution["upper"]))
                        else:
                            inf_amount = amount * (1 + np.random.normal(ev.changeDistribution["mean"], ev.changeDistribution["stdev"]))
                    
                    if ev.inflationAdjusted == True:
                        infAdj = self.inf.runInflation()
                        if self.data.inflationAssumption["type"] == kFixed:
                            inf_amount += inf_amount * (1 + infAdj) ** (year - self.year)
                        else:
                            inf_amount += inf_amount * np.prod(1 + np.clip(infAdj, -0.99, None))

                    return inf_amount
            else:
                return 0

    def sellInvestment(self, inv, purchaseDict:dict, full=True, f=0.0):
        # inv.value   # current value (after investment simul)
        # self.initialInvestmentValue # initial value of investment in the simul
        purchase = purchaseDict[inv.id] + self.initialInvestmentValue[inv.id]

        if full:
            capitalgain = inv.value - purchase
            purchaseDict[inv.id] = 0  # Reset purchase price after full sale
            return capitalgain
        else:
            capitalgain = f * (inv.value - ((1 - f) * purchase))
            purchaseDict[inv.id] = (1 - f) * purchase  # Update purchase price after partial sale
            return capitalgain

    def expensePurchase(self, w, capitalgain: int, curYearIncome: int, curYearEarlyWithdrawals: int):
        total_amount_sold = 0

        while total_amount_sold < w:
            for name in self.data.expenseWithdrawalStrategy:
                for inv in self.data.investments:
                    if inv.id == name:
                        if inv.value > w - total_amount_sold:
                            if inv.taxStatus == "non-retirement":
                                f = (w - total_amount_sold) / inv.value
                                capitalgain += self.sellInvestment(inv, self.purchaseDict, full=False, f=f)
                            elif inv.taxStatus == "pre-tax":
                                curYearIncome += w - total_amount_sold
                                curYearEarlyWithdrawals += w - total_amount_sold
                            else:
                                curYearEarlyWithdrawals += w - total_amount_sold

                            inv.value -= w - total_amount_sold
                            total_amount_sold = w
                        else:
                            if inv.taxStatus == "non-retirement":
                                capitalgain += self.sellInvestment(inv, self.purchaseDict)
                            elif inv.taxStatus == "pre-tax":
                                curYearIncome += inv.value
                                curYearEarlyWithdrawals += inv.value
                            else:
                                curYearEarlyWithdrawals += inv.value

                            total_amount_sold += inv.value
                            inv.value = 0
        return capitalgain, curYearIncome, curYearEarlyWithdrawals

    def payTax(self, capitalgain, curYearIncome, curYearSS, curYearGains, curYearEarlyWithdrawals, email=None):
        # self.tax.federalTax is already infaltion adjusted
        incomeTax = self.tax.federalTaxCalculator(self.data, curYearIncome, curYearSS, email)
        cgTax = self.tax.capitalGainTax(self.data, curYearGains)
        ewTax = self.tax.earlyWithdrawal(self.data, curYearEarlyWithdrawals)

        if incomeTax == None:
            print("income")
        elif cgTax == None:
            print("cgTax")
        elif ewTax == None:
            print("ewTax")

        p = self.sumNonDiscretionary() + incomeTax + cgTax + ewTax  # total payment amount
        
        for inv in self.data.investments:
            if inv.investmentType == "cash":
                cash = inv.value
                break
        
        w = p - cash    # withdrawal amount
        capitalgain, curYearIncome, curYearEarlyWithdrawals = self.expensePurchase(w, capitalgain, curYearIncome, curYearEarlyWithdrawals)
        
        p = self.sumDiscretionary() + incomeTax + cgTax + ewTax

        for inv in self.data.investments:
            if inv.investmentType == "cash":
                cash = inv.value
                break
        
        w = p - cash
        capitalgain, curYearIncome, curYearEarlyWithdrawals = self.expensePurchase(w, capitalgain, curYearIncome, curYearEarlyWithdrawals)
    # end 6, 7

    def buyInvestment(self, curYear):
        """
        Handles the investment event for the current year by allocating excess cash
        to investments based on the asset allocation and contribution limits.
        """
        maxCash = 0
        asset_allocation = {}

        # Find the invest event for the current year
        for ev in self.data.eventSeries:
            if ev.type == "invest" and ev.invest.start["type"] == kFixed and ev.invest.start["value"] == curYear:
                maxCash = ev.invest.maxCash
                asset_allocation = ev.invest.assetAllocation
                break
            elif ev.type == "invest" and ev.invest.start["type"] == "startWith":
                target = ev.invest.start["eventSeries"]
                targetYear = 0
                for evs in self.data.eventSeries:
                    if evs.name == target:
                        targetYear = evs.start["value"]
                if targetYear == curYear:
                    maxCash = ev.maxCash
                    asset_allocation = ev.assetAllocation
                    break
            elif ev.type == "invest" and ev.invest.start["type"] == "startAfter":
                target = ev.invest.start["eventSeries"]
                targetYear = 0
                for evs in self.data.eventSeries:
                    if evs.name == target:
                        targetYear = evs.start["value"]+1
                if targetYear == curYear:
                    maxCash = ev.maxCash
                    asset_allocation = ev.assetAllocation
                    break
            elif ev.type == "invest" and ev.invest.start["type"] == kUniform:
                ev.invest.start = {"type": kFixed, "value":np.random.uniform(ev.invest.start["lower"], ev.invest.start["upper"])}
            elif ev.type == "invest" and ev.invest.start["type"] == kNormal:
                ev.invest.start = {"type": kFixed, "value": np.random.normal(ev.invest.start["mean"], ev.invest.start["stdev"])}
        
        # Inflation-adjusted annual limit for after-tax contributions
        L = self.limitInflation(curYear)

        # Calculate total allocation for after-tax investments
        after_tax_investments = [inv for inv in self.data.investments if inv.taxStatus == "after-tax"]
        B = sum(maxCash * asset_allocation.get(inv.id, 0) for inv in after_tax_investments)

        # Adjust purchases if after-tax contributions exceed the limit
        if B > L:
            adjustment_ratio = L / B
            remaining_amount = maxCash
            for inv in after_tax_investments:
                allocation = asset_allocation.get(inv.id, 0)
                purchase_amount = maxCash * allocation * adjustment_ratio
                inv.value += purchase_amount
                self.purchaseDict[inv.id] += purchase_amount  # Update purchaseDict
                remaining_amount -= purchase_amount

            # Allocate remaining cash to non-retirement investments
            non_retirement_investments = [inv for inv in self.data.investments if inv.taxStatus == "non-retirement"]
            for inv in non_retirement_investments:
                allocation = asset_allocation.get(inv.id, 0)
                purchase_amount = remaining_amount * allocation
                inv.value += purchase_amount
                self.purchaseDict[inv.id] += purchase_amount  # Update purchaseDict
        else:
            # Allocate cash directly based on asset allocation
            for inv in self.data.investments:
                allocation = asset_allocation.get(inv.id, 0)
                purchase_amount = maxCash * allocation
                inv.value += purchase_amount
                self.purchaseDict[inv.id] += purchase_amount  # Update purchaseDict

    def simulation(self, email, emailNeed = False):
        """
        This function simulates the entire scenario year by year and returns a list of updated Scenario objects.
        """
        updated_scenarios = []  # List to store updated Scenario objects for each year

        for year in range(self.year, self.duration + 1):
            # Initialize variables for the current year
            curYearIncome = 0
            curYearSS = 0
            curYearGains = 0  # Initialize capital gains for the current year
            curYearEarlyWithdrawals = 0  # Initialize early withdrawals for the current year
            capitalGain = 0

            self.taxInflation(year)  # Adjust tax brackets and capital gain tax for inflation

            # Process income events
            for ev in self.data.eventSeries:
                if ev.type == "income" and ev.start["type"] == kFixed and ev.start["value"] == year:
                    curYearSS, curYearIncome = self.incomeEventSimul(ev, ev.initialAmount, year)

            # Perform RMD if applicable
            for rmdInv in self.data.RMDStrategy:
                curYearIncome = self.RMDSimul(rmdInv, year, curYearIncome)

            # Update investment values
            curYearIncome, capitalGain = self.investmentsSimul(curYearIncome, capitalGain)

            # Run Roth conversion optimizer if enabled
            if self.data.RothConversionOpt and self.data.RothConversionStart <= year <= self.data.RothConversionEnd:
                curYearIncome = self.RCOptimizer(self.tax.federalTax, curYearIncome, curYearSS)

            # Pay non-discretionary expenses and taxes
            if emailNeed == True:
                self.payTax(capitalGain, curYearIncome, curYearSS, curYearGains, curYearEarlyWithdrawals, email)
            else:
                self.payTax(capitalGain, curYearIncome, curYearSS, curYearGains, curYearEarlyWithdrawals)

            # Pay discretionary expenses
            for expense in self.data.spendingStrategy:
                for ev in self.data.eventSeries:
                    if ev.type == "expense":
                        amount = self.expenseSimul(ev, ev.initialAmount, year)
                        if emailNeed == True:
                            self.payTax(capitalGain, curYearIncome, curYearSS, curYearGains, curYearEarlyWithdrawals, email)
                        else:
                            self.payTax(capitalGain, curYearIncome, curYearSS, curYearGains, curYearEarlyWithdrawals)

            # Run investment events
            self.buyInvestment(year)

            # Rebalance logic
            for ev in self.data.eventSeries:
                if ev.type == "rebalance" and ev.rebalance.start["type"] == kFixed and ev.rebalance.start["value"] == year:
                    target_allocation = ev.assetAllocation
                    total_value = sum(inv.value for inv in self.data.investments)
                    for inv in self.data.investments:
                        target_value = total_value * target_allocation.get(inv.id, 0)
                        if inv.value > target_value:
                            # Sell excess
                            capitalGain += self.sellInvestment(inv, {}, full=False, f=(inv.value - target_value) / inv.value)
                            inv.value = target_value
                        elif inv.value < target_value:
                            # Buy shortfall
                            inv.value += target_value - inv.value
                elif ev.type == "rebalance" and ev.rebalance.start["type"] == "startWith":
                    targetYear = 0
                    for evs in self.data.eventSeries:
                        if evs.name == ev.start["eventSeries"]:
                            if evs.type == "invest":
                                targetYear = evs.invest.start["value"]
                            elif evs.type == "rebalance":
                                targetYear = evs.rebalance.start["value"]
                            else:
                                targetYear = ev.start["value"]
                    
                    if targetYear == year:
                        target_allocation = ev.assetAllocation
                        total_value = sum(inv.value for inv in self.data.investments)
                        for inv in self.data.investments:
                            target_value = total_value * target_allocation.get(inv.id, 0)
                            if inv.value > target_value:
                                # Sell excess
                                capitalGain += self.sellInvestment(inv, {}, full=False, f=(inv.value - target_value) / inv.value)
                                inv.value = target_value
                            elif inv.value < target_value:
                                # Buy shortfall
                                inv.value += target_value - inv.value
                
                elif ev.type == "rebalance" and ev.rebalance.start["type"] == "startAfter":
                    targetYear = 0
                    for evs in self.data.eventSeries:
                        if evs.name == ev.start["eventSeries"]:
                            if evs.type == "invest":
                                targetYear = evs.invest.start["value"] + 1
                            elif evs.type == "rebalance":
                                targetYear = evs.rebalance.start["value"] + 1
                            else:
                                targetYear = ev.start["value"] + 1
                    
                    if targetYear == year:
                        target_allocation = ev.assetAllocation
                        total_value = sum(inv.value for inv in self.data.investments)
                        for inv in self.data.investments:
                            target_value = total_value * target_allocation.get(inv.id, 0)
                            if inv.value > target_value:
                                # Sell excess
                                capitalGain += self.sellInvestment(inv, {}, full=False, f=(inv.value - target_value) / inv.value)
                                inv.value = target_value
                            elif inv.value < target_value:
                                # Buy shortfall
                                inv.value += target_value - inv.value
                
                elif ev.type == "rebalance" and ev.rebalance.start["type"] == kNormal:
                    targetYear = np.random.normal(ev.rebalance.start["mean"], ev.rebalance.start["stdev"])
                    ev.start = {"type": kFixed, "value":targetYear}                    
                    if targetYear == year:
                        target_allocation = ev.assetAllocation
                        total_value = sum(inv.value for inv in self.data.investments)
                        for inv in self.data.investments:
                            target_value = total_value * target_allocation.get(inv.id, 0)
                            if inv.value > target_value:
                                # Sell excess
                                capitalGain += self.sellInvestment(inv, {}, full=False, f=(inv.value - target_value) / inv.value)
                                inv.value = target_value
                            elif inv.value < target_value:
                                # Buy shortfall
                                inv.value += target_value - inv.value

                elif ev.type == "rebalance" and ev.rebalance.start["type"] == kUniform:
                    targetYear = np.random.uniform(ev.rebalance.start["lower"], ev.rebalance.start["upper"])
                    ev.start = {"type": kFixed, "value":targetYear}                    
                    if targetYear == year:
                        target_allocation = ev.assetAllocation
                        total_value = sum(inv.value for inv in self.data.investments)
                        for inv in self.data.investments:
                            target_value = total_value * target_allocation.get(inv.id, 0)
                            if inv.value > target_value:
                                # Sell excess
                                capitalGain += self.sellInvestment(inv, {}, full=False, f=(inv.value - target_value) / inv.value)
                                inv.value = target_value
                            elif inv.value < target_value:
                                # Buy shortfall
                                inv.value += target_value - inv.value
            # Append the updated Scenario object for the current year
            updated_scenarios.append(self.data.toDict())

        return updated_scenarios