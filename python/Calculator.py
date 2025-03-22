class Calculator:
    def __init__(self):
        LFTTable = ""   # scrape or something for the LFT table

    # RMD Calculator
    def RMDCalculator(self, accountBalance, age):
        if age > 120:
            return accountBalance / self.LFTTable.get(120)
        else:
            return accountBalance / self.LFTTable.get(age)

    # Inflation Assumption
    def inflationAssumption(initialYear, expenseYearAmount, initialAmount, inflationRate = 3.0):
        if initialYear == True:
            return initialAmount * (1+inflationRate)
        return expenseYearAmount * (1+inflationRate)
    
    # Tax Calculator
    def taxCalculator():
        pass

    # Expense Withdrawal Strategy
    def expenseWithdrawal(initialAmount, annualReturn, yearRest):
        return initialAmount*(annualReturn*(1+annualReturn)^yearRest)/((1+annualReturn)^yearRest-1)
    
    # roth conversion
    def rothConversion (startAmount, annualContribution, age, retirementAge, investmentReturn):
        '''
        function returns two variables
        retirementBalance, totalContribution
        Shoulde unzip or zip the return variables
        '''
        total = startAmount
        totalContribution = 0.0
        retirementBalance = 0.0

        for i in range(age, retirementAge):
            total = (total + annualContribution) * (1+investmentReturn / 100)
            totalContribution += annualContribution
            retirementBalance = total
        return retirementBalance, totalContribution

    # Investment Calculator is considered to be modified

    # class Investment:
    #     id = 0
    #     def __init__(self):
    #         name = ""
    #         currentValue = 0.0
    #         riskFactor = 0.0
    