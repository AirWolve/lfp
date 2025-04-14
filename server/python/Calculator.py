from bs4 import BeautifulSoup
from dotenv import load_dotenv

import datetime
import json
import numpy as np
import os
import pandas as pd
import re
import requests
import yaml

class RMDCalculator:
    """
    This is for RMD Calculator
    
    Args:
    ----
        LFTTable = static path to read the yaml file which holds RMD ratio
        yaer = today's year integer value
    """
    def __init__(self):
        load_dotenv()
        try:
            with open('./LFTTable.yaml') as f:
                self.LFTTable = yaml.load(f, Loader=yaml.FullLoader).copy()   # scrape or something for the LFT table
        except FileNotFoundError:
            self.updateLFTTable()
            with open('./LFTTable.yaml') as f:
                self.LFTTable = yaml.load(f, Loader=yaml.FullLoader).copy()
        self.year = datetime.date.today().year
    
    def updateLFTTable(self):
        """
        This is for scraping RMD table from irs website
        """
        url = os.getenv('LFP_PYTHON_LFT')
        res = requests.get(url)
        soup = BeautifulSoup(res.text, 'html.parser')

        table = soup.find("table", attrs={"summary": "Appendix B. Uniform Lifetime Table"})
        tds = table.select("td")

        result = {}
        for idx in range(11, 109, 2):
            if tds[idx].text.strip() == "120 and over":
                result['120'] = int(tds[idx+1].text.strip().replace(".",""))/10
            else:
                result[tds[idx].text.strip()] = int(tds[idx+1].text.strip().replace(".",""))/10
        
        with open('./LFTTable.yaml', 'w') as f:
            yaml.dump(result, f, default_flow_style=False, sort_keys=False)

    # RMD Calculator
    def runRMD(self, data:dict):
        df_invs = pd.DataFrame(data.investments)
        age = data.birthYears[0]-self.year
        
        if age < 74:
            return 0
        else:
            for idn in data.RMDStrategy:
                if age > 120:
                    return df_invs[df_invs["id"]==idn]["value"].item() / self.LFTTable.get(str(120))
                else:
                    return df_invs[df_invs["id"]==idn]["value"].item() / self.LFTTable.get(str(age))

class TaxCalculator:
    def __init__(self):
        load_dotenv()
        self.year = datetime.date.today().year
        with open('./2024_federal_tax.yaml') as f:
            self.federalTax = yaml.load(f, Loader=yaml.FullLoader)
        with open('./ctTax.yaml') as f:
            self.capTax = yaml.load(f, Loader=yaml.FullLoader)
        with open('./stateTax.yaml') as f:
            self.stateTax = yaml.load(f, Loader=yaml.FullLoader)

    # Tax Calculator
    def federalTaxCalculator(self, data:dict, amount:int):
        """
        This is a function to calculate tax amount
        """
        sc = False

        for d in data.eventSeries:
            if d.type == "income":
                sc = d.socialSecurity
                break

        if sc:
            taxable = amount * 0.85 - self.federalTax["standardDeduction"][data.maritalStatus]       
        else:
            taxable = amount - self.federalTax["standardDeduction"][data.maritalStatus]
        
        if taxable > 0:
            if data.maritalStatus == "couple":
                for key, value in self.federalTax["couple"].items():
                    if key == "inf":
                        return taxable * value
                    elif taxable < int(key):
                        return taxable * value

            else:
                for key, value in self.federalTax["individual"].items():
                    if key == "inf":
                        return taxable * value
                    elif taxable < int(key):
                        return taxable * value
        else:
            return 0
    
    def capitalGainTax(self, data:dict, amount:int):
        """
        This is a function to calculate capital gains tax

        consider all taxable investment
        """
        taxable = amount - self.federalTax["standardDeduction"][data.maritalStatus]
        if taxable > 0:
            if data.maritalStatus == "couple":
                for key, value in self.capTax["couple"].items():
                    if key == "inf":
                        return taxable * value
                    elif taxable < int(key):
                        return taxable * value
            else:
                for key, value in self.capTax["individual"].items():
                    if key == "inf":
                        return taxable * value
                    elif taxable < int(key):
                        return taxable * value
        else:
            return 0
        
    def stateTaxCalculator(self, data:dict, amount:int, state:str):
        """
        This is a function to calculate state tax amount

        Args:
        ----
            state: a string value of state name such as NJ, NY, etc.
        """
        taxable = amount - self.federalTax["standardDeduction"][data.maritalStatus]
        
        if state not in self.stateTax.keys():
            return 0, "State Tax Not Found!"
        
        if taxable > 0:
            if data.maritalStatus == "couple":
                for key, value in self.stateTax[state][0]["couple"].items():
                    if key == "inf":
                        return taxable * value
                    elif taxable < int(key):
                        return taxable * value
            else:
                for key, value in self.stateTax[state][0]["individual"].items():
                    if key == "inf":
                        return taxable * value
                    elif taxable < int(key):
                        return taxable * value
        else:
            return 0
        
    def earlyWithdrawal(self, data:dict, withdrawal:int):
        """
        This is a function to calculate early withdrawal tax
        
        Args:
        ----
            withdrawal: a integer value of withdrawal amount
        """
        age = data.birthYears[0]-self.year

        if age < 59:
            return withdrawal * 0.1
        else:
            return 0
        
    def updateTaxTable(self, taxTable:str):
        """
        This is a function to add tax table to the state tax yaml file

        Args:
        ----
            taxTable: a string value of tax table file path
                      each of the tax table should be in a yaml format with same structure
        """
        with open(taxTable) as f:
            taxTable = yaml.load(f, Loader=yaml.FullLoader)
        with open('./stateTax.yaml') as f:
            state = yaml.load(f, Loader=yaml.FullLoader)
        state.update(taxTable)

    def readYaml(file:str):
        """
        This is a function to read imported tax YAML file

        Args:
        ----
            file: a path for the YAML file to read
        
        Output:
        ----
            output: returns a dictionary that read yaml data
        """
        with open(file) as f:
            yaml_data = yaml.load(f, Loader=yaml.FullLoader)
        
        return yaml_data

    def socialSecurity(self, state:str):
        """
        This is a function to get social security tax amount

        Args:
        ----
            amount: a integer value of amount to calculate tax
            state: a string value of state name such as NJ, NY, etc.
        """
        if state in self.stateTax["nonsocialsecurity"]:
            return "We ignore the social security for this state"
        else:
            pass

    def updateFederalTax(self):
        """
        This is a function to scrape newer federal tax table and standard deduction from irs website
        """
        url = os.getenv('LFP_PYTHON_FEDERAL')
        res = requests.get(url)

        if res.status_code != 200:
            raise Exception("Failed to load IRS website")

        soup = BeautifulSoup(res.text, "html.parser")
        tables = soup.select("table.table.complex-table.table-striped.table-bordered.table-responsive")
        
        final = []
        
        if tables:
            for table in tables:
                result = {}
                tds = table.select("td")
                for td in range(0, len(tds), 3):
                    if tds[td+2].text == 'And up':
                        result["inf"] = int(tds[td].text.replace("%", ""))/100
                    else:
                        result[tds[td+2].text.replace("$","").replace(",","")] = int(tds[td].text.replace("%", ""))/100
                final.append(result)
        
        url2 = os.getenv('LFP_PYTHON_STD')
        res = requests.get(url2)
        
        if res.status_code != 200:
            raise Exception("Failed to load IRS website")
        
        soup = BeautifulSoup(res.text, 'html.parser')

        tabels = soup.find("table", attrs={"summary": "Table 10-1.Standard Deduction Chart for Most People*"})
        tds = tabels.select('td')

        result = {}

        for idx, td in enumerate(tds):
            if td.get_text(strip=True) == 'Single or Married filing separately':
                result['individual'] = int(tds[idx + 1].get_text(strip=True).replace("$","").replace(",",""))
            elif td.get_text(strip=True) == 'Married filing jointly or Qualifying surviving spouse':
                result['couple'] = int(tds[idx + 1].get_text(strip=True).replace("$","").replace(",",""))
        
        with open('./2024_federal_tax.yaml') as f:
            federal = yaml.load(f, Loader=yaml.FullLoader)
            federal["individual"] = final[0]
            federal["couple"] = final[1]
            federal["standardDeduction"] = result
        with open('./2024_federal_tax.yaml', 'w') as f:
            yaml.dump(federal, f, default_flow_style=False, sort_keys=False)
    
    def updateCapitalGain(self):
        """
        This is a function to scrape newer capital gain tax table from irs website
        """
        url = os.getenv('LFP_PYTHON_CGAIN')
        res = requests.get(url)

        if res.status_code != 200:
            raise Exception("Failed to load IRS website")

        soup = BeautifulSoup(res.text, 'html.parser')

        lis = [li for li in soup.find_all("li") if li.find(True) is None]
        b_tags = soup.select("p b")[:2]
        strong = soup.select("p strong")[0]

        result_in = {re.findall(r'\d{1,3}(?:,\d{3})*(?:\.\d+)?', lis[1].text)[0].replace(",", ""): int(b_tags[0].text.replace("%", ""))/100,
                    re.findall(r'\d{1,3}(?:,\d{3})*(?:\.\d+)?', lis[4].text)[1].replace(",", ""): int(b_tags[1].text.replace("%", ""))/100}
        result_co = {re.findall(r'\d{1,3}(?:,\d{3})*(?:\.\d+)?', lis[2].text)[0].replace(",", ""): int(b_tags[0].text.replace("%", ""))/100,
                    re.findall(r'\d{1,3}(?:,\d{3})*(?:\.\d+)?', lis[6].text)[1].replace(",", ""): int(b_tags[1].text.replace("%", ""))/100,
                    "inf": int(strong.text.replace("%", ""))/100}

        with open('./ctTax.yaml') as f:
            tax = yaml.load(f, Loader=yaml.FullLoader)
            tax["couple"] = result_co
            tax["individual"] = result_in
        with open('./ctTax.yaml', 'w') as f:
            yaml.dump(tax, f, default_flow_style=False, sort_keys=False)

    def runIncomeTax(self, data:dict):
        """
        This is a function to run all tax calculator

        Args:
        ----
            data: a dictionary of data to calculate tax amount
            amount: a integer value of income amount to calculate tax
        """
        for ev in data.eventSeries:
            if ev.type == "income":
                income = ev.initialAmount
                break

        return income - self.federalTaxCalculator(data, income)\
                - self.stateTaxCalculator(data, income, data.residenceState)

# Inflation Assumption
class Inflation:
    def __init__(self, data:dict):
        self.type = data.inflationAssumption["type"]
        self.assumption = data.inflationAssumption
        self.data = data
    
    def baseInflation(self):
        """
        This function is for base inflation assumption

        returns list of dictionary of series inflation assumed amount values
        """
        result = list()
        df_es = pd.DataFrame(self.data.eventSeries)
        curYear = datetime.date.today().year

        for idx, row in df_es.iterrows():
            values = list()
            if row.inflationAdjusted == False:
                continue
            else:
                duration = row["duration"]["value"]
                
                if row["start"]["type"] == "fixed":
                    start = row["start"]["value"]
                    
                    if start == curYear:
                        values.append(row["initialAmount"] * (1-self.assumption["value"]))
                    else:
                        if not values:
                            for i in range(start, curYear):
                                values.append(None)

                        for i in range(duration):
                            values.append(values[-1]*(1-self.assumption["value"])**len(values))
                        
                elif row["start"]["type"] == "startWith":
                    start = df_es[df_es["name"] == row["start"]["eventSeries"]]["start"]["value"]

                    if start == curYear:
                        values.append(row["initialAmount"] * (1-self.assumption["value"]))
                    else:
                        if not values:
                            for i in range(start, curYear):
                                values.append(None)

                        for i in range(duration):
                            values.append(values[-1]*(1-self.assumption["value"])**len(values))
                
                elif row["start"]["type"] == "startAfter":
                    start = df_es[df_es["name"] == row["start"]["eventSeries"]]["start"]["value"]

                    if start == curYear:
                        values.append(row["initialAmount"] * (1-self.assumption["value"]))
                    else:
                        if not values:
                            for i in range(start, curYear):
                                values.append(None)

                        for i in range(duration):
                            values.append(values[-1]*(1-self.assumption["value"])**len(values))
            
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
