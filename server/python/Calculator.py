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

    def getLFT(self, age):
        """
        Get the Life Expectancy Factor (distribution period) for a given age
        
        Args:
        ----
            age: Age of the account holder
            
        Returns:
        ----
            float: Distribution period from the Uniform Lifetime Table
        """
        if age > 120:
            return self.LFTTable.get(str(120))
        else:
            return self.LFTTable.get(str(age))

    def runRMD(self, age):
        """
        Get the distribution period for RMD calculation
        
        Args:
        ----
            age: Age of the account holder
            
        Returns:
        ----
            float: Distribution period from the Uniform Lifetime Table, or 0 if age < 73
        """
        if age < 73:  # RMD calculation starts at age 73
            return 0
        else:
            return self.getLFT(age)

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
    def federalTaxCalculator(self, data:dict, amount:int, curYearSS, email=None):
        """
        This is a function to calculate federal tax amount using progressive tax rates
        
        Args:
        ----
            data: Scenario data dictionary
            amount: Total taxable income
            curYearSS: Current year social security income
            email: Optional email for custom tax rates
        
        Returns:
        ----
            Total tax amount including federal and state tax
        """
        # Get standard deduction based on marital status
        standard_deduction = self.federalTax["standardDeduction"][data.maritalStatus]
        
        # Calculate taxable income after social security exclusion and standard deduction
        taxable = max(0, amount - 0.15*curYearSS - standard_deduction)
        
        # Calculate state tax based on income before standard deduction
        # This is because state tax calculations might have different rules
        stateTax = self.stateTaxCalculator(data, amount - 0.15*curYearSS, data.residenceState, curYearSS, email)
        
        if taxable <= 0:
            return stateTax  # Return only state tax if no federal taxable income
            
        # Get tax brackets based on marital status
        brackets = self.federalTax["couple" if data.maritalStatus == "couple" else "individual"]
        
        # Convert brackets to sorted list of (threshold, rate) pairs, excluding 'inf'
        tax_brackets = [(int(k), v) for k, v in brackets.items() if k != "inf"]
        tax_brackets.sort()  # Sort by threshold
        
        # Add infinity bracket at the end
        inf_rate = brackets.get("inf", 0)
        tax_brackets.append((float('inf'), inf_rate))
        
        total_tax = 0
        prev_threshold = 0
        
        # Calculate tax for each bracket
        for threshold, rate in tax_brackets:
            if taxable > prev_threshold:
                # Calculate income in this bracket
                bracket_income = min(taxable - prev_threshold, threshold - prev_threshold)
                total_tax += bracket_income * rate
                
            if taxable <= threshold:
                break
                
            prev_threshold = threshold
        
        return total_tax + stateTax
    
    def capitalGainTax(self, data:dict, taxable:int):
        """
        Calculate capital gains tax using progressive tax rates
        
        Args:
        ----
            data: Scenario data dictionary
            taxable: Total taxable capital gains
        
        Returns:
        ----
            Total capital gains tax amount
        """
        if taxable <= 0:
            return 0
            
        # Get tax brackets based on marital status
        brackets = self.capTax["couple" if data.maritalStatus == "couple" else "individual"]
        
        # Convert brackets to sorted list of (threshold, rate) pairs, excluding 'inf'
        tax_brackets = [(int(k), v) for k, v in brackets.items() if k != "inf"]
        tax_brackets.sort()  # Sort by threshold
        
        # Add infinity bracket at the end
        inf_rate = brackets.get("inf", 0)
        tax_brackets.append((float('inf'), inf_rate))
        
        total_tax = 0
        prev_threshold = 0
        
        # Calculate tax for each bracket
        for threshold, rate in tax_brackets:
            if taxable > prev_threshold:
                # Calculate capital gains in this bracket
                bracket_gains = min(taxable - prev_threshold, threshold - prev_threshold)
                total_tax += bracket_gains * rate
                
            if taxable <= threshold:
                break
                
            prev_threshold = threshold
        
        return total_tax
        
    def stateTaxCalculator(self, data:dict, taxable:int, state:str, curYearSS:int=0, email=None):
        """
        Calculate state tax amount with proper handling of missing state data
        and social security income
        
        Args:
        ----
            data: Scenario data dictionary
            taxable: Total taxable income before social security adjustment
            state: State code (e.g., 'NJ', 'NY')
            curYearSS: Current year social security income (default: 0)
            email: Optional email for custom tax rates
        
        Returns:
        ----
            State tax amount
        """
        if taxable <= 0:
            return 0

        # Determine if social security is taxable in this state
        is_ss_taxable = self.socialSecurity(state)
        
        # If social security is not taxable in this state, remove it from taxable income
        if not is_ss_taxable:
            taxable = max(0, taxable - curYearSS)
            
        try:
            # Get state tax brackets
            if email:
                try:
                    brackets = self.stateTax[email][0][state][0][data.maritalStatus]
                except (KeyError, IndexError):
                    print(f"Warning: No tax data found for state {state} in user profile {email}. Ignoring state tax.")
                    return 0
            else:
                try:
                    brackets = self.stateTax[state][0][data.maritalStatus]
                except (KeyError, IndexError):
                    print(f"Warning: No tax data found for state {state}. Ignoring state tax.")
                    return 0

            # Convert brackets to sorted list of (threshold, rate) pairs, excluding 'inf'
            tax_brackets = [(int(k), v) for k, v in brackets.items() if k != "inf"]
            tax_brackets.sort()  # Sort by threshold
            
            # Add infinity bracket at the end
            inf_rate = brackets.get("inf", 0)
            tax_brackets.append((float('inf'), inf_rate))
            
            total_tax = 0
            prev_threshold = 0
            
            # Calculate tax for each bracket
            for threshold, rate in tax_brackets:
                if taxable > prev_threshold:
                    # Calculate income in this bracket
                    bracket_income = min(taxable - prev_threshold, threshold - prev_threshold)
                    total_tax += bracket_income * rate
                    
                if taxable <= threshold:
                    break
                    
                prev_threshold = threshold
            
            return total_tax

        except Exception as e:
            print(f"Warning: Error calculating state tax for {state}: {str(e)}. Ignoring state tax.")
            return 0

    def earlyWithdrawal(self, data:dict, withdrawal:int, simYear:int=None):
        """
        Calculate early withdrawal penalty tax (10% penalty for withdrawals before age 59)
        
        Args:
        ----
            data: Scenario data dictionary containing birthYears
            withdrawal: Amount withdrawn from retirement accounts
            simYear: Current simulation year (defaults to current calendar year if not provided)
        
        Returns:
        ----
            Early withdrawal penalty amount (10% of withdrawal if age < 59, otherwise 0)
        """
        # Calculate current age (year - birthYear)
        age = self.year - data.birthYears[0]  # Using first person's birth year for now
        
        if age < 59:
            return withdrawal * 0.1
        else:
            return 0
    
    def updateInflationBracket(self, taxTable:dict):
        """
        This is a function to update inflation assumption applied tax bracket
        """

        with open('./2024_federal_tax.yaml', 'w') as f:
            yaml.dump(taxTable, f, default_flow_style=False, sort_keys=False)

    def updateStateTaxTable(self, taxTable:str, email:str):
        """
        This is a function to add tax table to the state tax yaml file

        Args:
        ----
            taxTable: a string value of tax table file path
                      each of the tax table should be in a yaml format with same structure
        """
        with open(taxTable) as f:
            taxTable = yaml.load(f, Loader=yaml.FullLoader)
        appending = {email: taxTable}
        with open('./stateTax.yaml') as f:
            state = yaml.load(f, Loader=yaml.FullLoader)
        state.update(appending)

        with open('./stateTax.yaml', 'w') as f:
            yaml.dump(state, f, default_flow_style=False, sort_keys=False) 

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
        Check if a state taxes social security income
        
        Args:
        ----
            state: State code (e.g., 'NJ', 'NY')
        
        Returns:
        ----
            bool: True if the state taxes social security, False otherwise
        """
        try:
            return state not in self.stateTax.get("nonsocialsecurity", [])
        except Exception as e:
            print(f"Warning: Error checking social security taxation for state {state}: {str(e)}. Assuming social security is not taxable.")
            return False

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

        return self.assumption["value"]
        # result = list()
        # curYear = datetime.date.today().year
        # df_es = pd.DataFrame(self.data.eventSeries)
        # start = 0

        # for idx, row in df_es.iterrows():
        #     row = row.item()
        #     values = list()

        #     if row.type == "rebalance" or row.type == "invest":
        #         continue
        #     elif row.inflationAdjusted == False:
        #         continue

        #     else:
        #         duration = row.duration["value"]
                
        #         if row.start["type"] == "fixed":
        #             start = row.start["value"]
                    
        #             if start == curYear:
        #                 values.append(row.initialAmount * (1-self.assumption["value"]))
        #             else:
        #                 if not values:
        #                     for i in range(start, curYear):
        #                         values.append(None)

        #                 for i in range(duration):
        #                     values.append(values[-1]*(1-self.assumption["value"])**len(values))
                        
        #         elif row.start["type"] == "startWith":
        #             for id, da in df_es.iterrows():
        #                 da = da.item()
        #                 if da.name == row.start["eventSeries"]:
        #                     start = da.start["value"]
        #                     break

        #             if start == curYear:
        #                 values.append(row.initialAmount * (1-self.assumption["value"]))
        #             else:
        #                 if not values:
        #                     for i in range(start, curYear):
        #                         values.append(None)

        #                 for i in range(duration):
        #                     values.append(values[-1]*(1-self.assumption["value"])**len(values))
                
        #         elif row.start["type"] == "startAfter":
        #             for id, da in df_es.iterrows():
        #                 da = da.item()
        #                 if da.name == row.start["eventSeries"]:
        #                     start = da.start["value"]
        #                     break
                
        #             if start == curYear:
        #                 values.append(row.initialAmount * (1-self.assumption["value"]))
        #             else:
        #                 if not values:
        #                     for i in range(start, curYear):
        #                         values.append(None)

        #                 for i in range(duration):
        #                     values.append(values[-1]*(1-self.assumption["value"])**len(values))
            
        #     result.append({row.name: values})

        # return result


    def uniformInflation(self):
        """
        This function is for uniform inflation assumption
        """

        try:
            if self.type == "uniform":
                low = self.assumption["lower"]
                high = self.assumption["upper"]
        except:
            raise ValueError("Invalid Type of Inflation Assumption!")
        
        return np.random.uniform(low, high)
        
        # result = list()
        # curYear = datetime.date.today().year
        # df_es = pd.DataFrame(self.data.eventSeries)
        # start = 0

        # self.assumption
        # if self.type == "uniform":
        #     low = self.assumption["lower"]
        #     high = self.assumption["upper"]

        # for idx, row in df_es.iterrows():
        #     row = row.item()
        #     values = list()

        #     if row.type == "rebalance" or row.type == "invest":
        #         continue
        #     elif row.inflationAdjusted == False:
        #         continue

        #     else:
        #         duration = row.duration["value"]
                
        #         if row.start["type"] == "fixed":
        #             start = row.start["value"]
                    
        #             if start == curYear:
        #                 values.append(row.initialAmount * (1-np.random.uniform(low, high)))
        #             else:
        #                 if not values:
        #                     for i in range(start, curYear):
        #                         values.append(None)

        #                 for i in range(duration):
        #                     values.append(values[-1]*(1-np.random.uniform(low, high))**len(values))
                        
        #         elif row.start["type"] == "startWith":
        #             for id, da in df_es.iterrows():
        #                 da = da.item()
        #                 if da.name == row.start["eventSeries"]:
        #                     start = da.start["value"]
        #                     break

        #             if start == curYear:
        #                 values.append(row.initialAmount * (1-np.random.uniform(low, high)))
        #             else:
        #                 if not values:
        #                     for i in range(start, curYear):
        #                         values.append(None)

        #                 for i in range(duration):
        #                     values.append(values[-1]*(1-np.random.uniform(low, high))**len(values))
                
        #         elif row.start["type"] == "startAfter":
        #             for id, da in df_es.iterrows():
        #                 da = da.item()
        #                 if da.name == row.start["eventSeries"]:
        #                     start = da.start["value"]
        #                     break
                
        #             if start == curYear:
        #                 values.append(row.initialAmount * (1-np.random.uniform(low, high)))
        #             else:
        #                 if not values:
        #                     for i in range(start, curYear):
        #                         values.append(None)

        #                 for i in range(duration):
        #                     values.append(values[-1]*(1-np.random.uniform(low, high))**len(values))
            
        #     result.append({row.name: values})

        # return result

    def normalInflation(self):
        """
        This function is for normal inflation assumption
        """
        try:
            if self.type == "normal":
                mean = self.assumption["mean"]
                std = self.assumption["stdev"]
        except:
            raise ValueError("Invalid Type of Inflation Assumption!")
        
        return np.random.normal(mean, std)
        # result = list()
        # curYear = datetime.date.today().year
        # df_es = pd.DataFrame(self.data.eventSeries)
        # start = 0

        # self.assumption
        # if self.type == "normal":
        #     mean = self.assumption["mean"]
        #     std = self.assumption["stdev"]

        # for idx, row in df_es.iterrows():
        #     row = row.item()
        #     values = list()

        #     if row.type == "rebalance" or row.type == "invest":
        #         continue
        #     elif row.inflationAdjusted == False:
        #         continue

        #     else:
        #         duration = row.duration["value"]
                
        #         if row.start["type"] == "fixed":
        #             start = row.start["value"]
                    
        #             if start == curYear:
        #                 values.append(row.initialAmount * (1-np.random.normal(mean, std)))
        #             else:
        #                 if not values:
        #                     for i in range(start, curYear):
        #                         values.append(None)

        #                 for i in range(duration):
        #                     values.append(values[-1]*(1-np.random.normal(mean, std))**len(values))
                        
        #         elif row.start["type"] == "startWith":
        #             for id, da in df_es.iterrows():
        #                 da = da.item()
        #                 if da.name == row.start["eventSeries"]:
        #                     start = da.start["value"]
        #                     break

        #             if start == curYear:
        #                 values.append(row.initialAmount * (1-np.random.normal(mean, std)))
        #             else:
        #                 if not values:
        #                     for i in range(start, curYear):
        #                         values.append(None)

        #                 for i in range(duration):
        #                     values.append(values[-1]*(1-np.random.normal(mean, std))**len(values))
                
        #         elif row.start["type"] == "startAfter":
        #             for id, da in df_es.iterrows():
        #                 da = da.item()
        #                 if da.name == row.start["eventSeries"]:
        #                     start = da.start["value"]
        #                     break
                
        #             if start == curYear:
        #                 values.append(row.initialAmount * (1-np.random.normal(mean, std)))
        #             else:
        #                 if not values:
        #                     for i in range(start, curYear):
        #                         values.append(None)

        #                 for i in range(duration):
        #                     values.append(values[-1]*(1-np.random.normal(mean, std))**len(values))
            
        #     result.append({row.name: values})

        # return result

    def runInflation(self):
        if self.type == "fixed":
            return self.baseInflation()
        elif self.type == "uniform":
            return self.uniformInflation()
        elif self.type == "normal":
            return self.normalInflation()
        else:
            raise ValueError("Invalid Type of Inflation Assumption!")

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