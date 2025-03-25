import json
import pandas as pd
import datetime
import numpy as np
import requests

class RMDCalculator:
    """
    This is for RMD Calculator
    
    Args:
    ----
        LFTTable = static path to read the json file which holds RMD ratio
        yaer = today's year integer value
    """
    def __init__(self):
        with open('./LFTTable.json') as f:
            self.LFTTable = json.loads(f.read()).copy()   # scrape or something for the LFT table
        self.year = datetime.date.today().year
    # RMD Calculator
    def runRMD(self, data:dict):
        df_invs = pd.DataFrame(data["investments"]).copy()
        age = data["birthYears"][0]-self.year
        
        if age < 74:
            return 0
        else:
            for idn in data["RMDStrategy"]:
                if age > 120:
                    return df_invs[df_invs["id"]==idn]["value"].item() / self.LFTTable.get(str(120))
                else:
                    return df_invs[df_invs["id"]==idn]["value"].item() / self.LFTTable.get(str(age))

class TaxCalculator:
    def __init__(self):
        self.apiKey = ""
    
    # Tax Calculator
    def taxCalculator(self, data:dict, amount:int, country:str|None = 'US'):
        region = data["residenceState"]
        filing_status = 'married' if data["maritalStatus"] == "couple" else 'single'
        api_url = 'https://api.api-ninjas.com/v1/incometaxcalculator?country={}&region={}&income={}&filing_status={}'.format(country, region, amount, filing_status)
        res = requests.get(api_url, headers={'X-Api-Key': self.apiKey["key"]})

        if res.status_code == requests.codes.ok:
            return res.text
        else:
            raise RuntimeError(f"Error: {res.status_code}, {res.text}")
    
    def scrapeTable(self, data:dict, country:str|None = 'US'):
        filePath = './tex_income.json'

        year = datetime.date.today().year
        api_url = 'https://api.api-ninjas.com/v1/incometax?country={}&year={}&federal_only={}'.format(country, year, data["residenceState"])
        
        res = requests.get(api_url, headers={'X-Api-Key': self.apiKey})
        
        if res.status_code == requests.codes.ok:
            with open(filePath, 'w', encoding="utf-8") as f:
                json.dump(res.text, f, ensure_ascii=False, indent="\t")
        
        return filePath

# Inflation Assumption
class Inflation:
    def __init__(self, data:dict):
        self.type = data["inflationAssumption"]["type"].copy()
        self.assumption = data["inflationAssumption"].copy()
        self.data = data.copy()
    
    def baseInflation(self):
        """
        This function is for base inflation assumption

        returns list of dictionary of series inflation assumed amount values
        """
        result = list()
        df_es = pd.DataFrame(self.data["eventSeries"]).copy()
        curYear = datetime.date.today().year

        for idx, row in df_es.iterrows():
            values = list()
            if row["inflationAdjusted"].item() == "false":
                continue
            else:
                duration = row["duration"]["value"].item()
                
                if row["start"]["type"].item() == "fixed":
                    start = row["start"]["value"].item()
                    
                    if start == curYear:
                        values.append(row["initialAmount"].item() * (1-self.assumption["value"].item()))
                    else:
                        if not values:
                            for i in range(start, curYear):
                                values.append(None)

                        for i in range(duration):
                            values.append(values[-1]*(1-self.assumption["value"].item())**len(values))
                        
                elif row["start"]["type"].item() == "startWith":
                    start = df_es[df_es["name"] == row["start"]["eventSeries"]]["start"]["value"].item()

                    if start == curYear:
                        values.append(row["initialAmount"].item() * (1-self.assumption["value"].item()))
                    else:
                        if not values:
                            for i in range(start, curYear):
                                values.append(None)

                        for i in range(duration):
                            values.append(values[-1]*(1-self.assumption["value"].item())**len(values))
                
                elif row["start"]["type"].item() == "startAfter":
                    start = df_es[df_es["name"] == row["start"]["eventSeries"]]["start"]["value"].item()

                    if start == curYear:
                        values.append(row["initialAmount"].item() * (1-self.assumption["value"].item()))
                    else:
                        if not values:
                            for i in range(start, curYear):
                                values.append(None)

                        for i in range(duration):
                            values.append(values[-1]*(1-self.assumption["value"].item())**len(values))
            
            result.append({row["name"]: values})

        return result


    def uniformInflation(self):
        return None

    def normalInflation(self):
        return None

    def runInflation(self):
        if self.type == "fixed":
            self.baseInflation()
        elif self.type == "uniform":
            self.uniformInflation()
        elif self.type == "normal":
            self.normalInflation()
        else:
            raise ValueError("Invalid Type of Inflation Assumption!")
"""
Re-start

def inflationAssumption(initialYear, expenseYearAmount, initialAmount, inflationRate = 3.0):
    if initialYear == True:
        return initialAmount * (1+inflationRate)
    return expenseYearAmount * (1+inflationRate)
"""

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
        
    return list(retirementBalance, totalContribution)

def runCalculator(file:str):
    """
    This is a function to run all calculator as possible as can

    Args:
    ----
        file: This is a path for the pkl file to load and use
    """

    with open(file) as f:
        data = json.loads(f.read())
    return RMDCalculator.runRMD(data)


# Investment Calculator is considered to be modified

# class Investment:
#     id = 0
#     def __init__(self):
#         name = ""
#         currentValue = 0.0
#         riskFactor = 0.0
