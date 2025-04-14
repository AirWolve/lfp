import yaml
import pickle
import os
# from Calculator import RMDCalculator
# import Calculator

class Scenario:
    """
    a distribution is represented as a map with one of the following forms:
    {type: fixed, value: <number>}
    {type: normal, mean: <number>, stdev: <number>}
    {type: uniform, lower: <number>, upper: <number>}
    {type: GBM, mu: <number>, sigma: <number>}
    percentages are represented by their decimal value, e.g., 4% is represented as 0.04.
    """
    def __init__(self, parameters):
        """
        This is a Scenario class init function

        Args:
        ----
            parameters: the dictionary of all yaml or json data
        """
        self.name:str = parameters["name"]
        self.maritalStatus:str = parameters["maritalStatus"]
        self.birthYears:list = parameters["birthYears"].copy()
        self.lifeExpectancy:list = parameters["lifeExpectancy"].copy()
        self.investmentTypes:list = [InvestmentTypes(params) for params in parameters["investmentTypes"]]
        self.investments:list = [Investments(params) for params in parameters["investments"]]
        self.eventSeries:list = [EventSeries(params) for params in parameters["eventSeries"]]
        self.inflationAssumption:dict = parameters["inflationAssumption"].copy()
        self.afterTaxContributionLimit:int = parameters["afterTaxContributionLimit"]
        self.spendingStrategy:list = parameters["spendingStrategy"].copy()
        self.expenseWithdrawalStrategy:list = parameters["expenseWithdrawalStrategy"].copy()
        self.RMDStrategy:list = parameters["RMDStrategy"].copy()
        self.RothConversionOpt:bool = parameters["RothConversionOpt"]
        self.RothConversionStart:int = parameters["RothConversionStart"]
        self.RothConversionEnd:int = parameters["RothConversionEnd"]
        self.RothConversionStrategy:list = parameters["RothConversionStrategy"].copy()
        self.financialGoal:int = parameters["financialGoal"]
        self.residenceState:str = parameters["residenceState"]

    def getParameters(self, key):
        return self.parameters.get(key)
    
    def setParameters(self, key, value):
        
        if self.parameters.get(key) != value:
            self.parameters[key] = value
        else:
            print("Invalid Setting!")
    
    def toDict(self):
        """
        This is a function that modify Scenario object into dictionary type

        Args:
        ----
            
        """

        result = {
            "name": self.name,
            "maritalStatus": self.maritalStatus,
            "birthYears": self.birthYears,
            "lifeExpectancy": self.lifeExpectancy,
            "investmentTypes": [i.toDict() for i in self.investmentTypes],
            "investments": [i.toDict() for i in self.investments],
            "eventSeries": [i.toDict() for i in self.eventSeries],
            "inflationAssumption": self.inflationAssumption,
            "afterTaxContributionLimit": self.afterTaxContributionLimit,
            "spendingStrategy": self.spendingStrategy,
            "expenseWithdrawalStrategy": self.expenseWithdrawalStrategy,
            "RMDStrategy": self.RMDStrategy,
            "RothConversionOpt": self.RothConversionOpt,
            "RothConversionStart": self.RothConversionStart,
            "RothConversionEnd": self.RothConversionEnd,
            "RothConversionStrategy": self.RothConversionStrategy,
            "financialGoal": self.financialGoal,
            "residenceState": self.residenceState
        }

        return result
    
class InvestmentTypes:
    def __init__(self, parameters:dict):
        self.name:str = parameters["name"]
        self.description:str = parameters["description"]
        self.returnAmtOrPct:str = parameters["returnAmtOrPct"]    # amount or percent
        self.returnDistribution:dict = parameters["returnDistribution"].copy()
        self.expenseRatio:int = parameters["expenseRatio"]
        self.incomeAmtOrPct:str = parameters["incomeAmtOrPct"]
        self.incomeDistribution:dict = parameters["incomeDistribution"].copy()
        self.taxability:bool = parameters["taxability"]
    
    def toDict(self):
        """
        This function modifies InvestmentTypes object into dictionary type
        """
        
        result = {
            "name": self.name,
            "description": self.description,
            "returnAmtOrPct": self.returnAmtOrPct,
            "returnDistribution": self.returnDistribution,
            "expenseRatio": self.expenseRatio,
            "incomeAmtOrPct": self.incomeAmtOrPct,
            "incomeDistribution": self.incomeDistribution,
            "taxability": self.taxability
        }

        return result

class Investments:
    def __init__(self, parameters:dict):
        self.investmentType:str = parameters["investmentType"]
        self.value:int = parameters["value"]
        self.taxStatus:str = parameters["taxStatus"]  # "non-retirement", "pre-tax", or "after-tax"
        self.id:str = parameters["id"]
    
    def toDict(self):
        """
        This function modifies Investments object into dictionray type
        """
        
        result = {
            "investmentType": self.investmentType,
            "value": self.value,
            "taxStatus": self.taxStatus,
            "id": self.id
        }

        return result

class Invest:
    """
    This is a class when there is a invest in the event series

    Args:
    ----
        name: this is a name of invest
        start: this is a dictionary of start value
            ex) {type: uniform, lower: 2025, upper: 2030}
        duration: this is a dictionary of duration value
            ex) {type: fixed, value: 10}
        type: this is a string to check whether it is a invest or not
        assetAllocation: this is a dictionary of asset
            ex) {S&P 500 non-retirement: 0.6, S&P 500 after-tax: 0.4}
        glidePath: this is a boolean. False means assetAllocation is the fixed asset allocation and assetAllocation2 is unused
                    True means using assetAllocation2 is used
        maxCash: this is a integer max cash
    """

    def __init__(self, parameters:dict):
        if parameters["type"] != "invest":
            raise ValueError("Invalid input for the Invest Class!")
        
        self.name:str = parameters["name"]
        self.start:dict = parameters["start"].copy()
        self.duration:dict = parameters["duration"].copy()
        self.type:str = parameters["type"]
        self.assetAllocation:dict = parameters["assetAllocation"].copy()
        self.glidePath:bool = parameters["glidePath"]
        self.maxCash:int = parameters["maxCash"]

        if self.glidePath is True:
            self.assetAllocation2:dict = parameters["assetAllocation2"]
    
    def toDict(self):
        """
        This function modifies Invest object into dictionary type
        """
        
        result = {
            "name": self.name,
            "start": self.start,
            "duration": self.duration,
            "type": self.type,
            "assetAllocation": self.assetAllocation,
            "glidePath": self.glidePath,
            "maxCash": self.maxCash
        }

        if self.glidePath is True:
            result["assetAllocation2"] = self.assetAllocation2
        
        return result

class Rebalance:
    """
    This is a class for the event type rebalance

    Args:
    ----
        name: this is a string for event name
        start: this is a dictionary of start value
            ex) {type: uniform, lower: 2025, upper: 2030}
        duration: this is a dictionary of duration value
            ex) {type: fixed, value: 10}
        type: this is a type to check whether it is rebalance or not
        assetAllocation: this is a dictionary of asset
            ex) {S&P500 non-retirement: 0.7, tax-exempt bonds: 0.3}
    """
    def __init__(self, parameters:dict):
        if parameters["type"] != "rebalance":
            raise ValueError("Invalid input for the Rebalance Class!")
        
        self.name:str = parameters["name"]
        self.start:dict = parameters["start"].copy()
        self.duration:dict = parameters["duration"].copy()
        self.type:str = parameters["type"]
        self.assetAllocation:dict = parameters["assetAllocation"].copy()
    
    def toDict(self):
        """
        This function modifies Rebalance object into dictionary type
        """

        result = {
            "name": self.name,
            "start": self.start,
            "duration": self.duration,
            "type": self.type,
            "assetAllocation": self.assetAllocation
        }

        return result
    
class EventSeries:
    """
    This is a class for the EventSeries in Yaml file

    Args:
    ----
        name: this is a name for event
        start: this is a list containing type of distribution
            type: fixed, normal, uniform, startWith, startAfter
            ex) {type: fixed, vlaue: 2025}
                {type: startWith, eventSeries: salary}
        duration: this is a dictionary containing type and duration value
            if value exceeded the lifetime, it lasts for the rest of the user's life
            ex) {type: fixed, value: 200}
                {type: fixed, value: 40}
        type: this is type of event, there are four types (income, expense, invest, or rebalance)
        initialAmount: this is a initialAmount of the event
        changeAmtOrPct: this is a change amount or percentage
        changeDistribution: this is a distribution setting in dict form
            ex) {type: uniform, lower: 500, upper: 2000}
                {type: normal, mean: 0.02, stdev: 0.01}
                {type: fixed, value: 0}
        inflationAdjusted: this is a boolean value whether adjust inflation or not
        userFraction: this is a fraction of the amount associated with the user.
        socialSecurity: this is a boolean
    """
    def __init__(self, parameters:dict):
        if parameters["type"] == "invest":
            self.type = "invest"
            self.invest = Invest(parameters)
        elif parameters["type"] == "rebalance":
            self.type = "rebalance"
            self.rebalance = Rebalance(parameters)
        else:    
            self.name:str = parameters["name"]
            self.start:dict = parameters["start"].copy()
            self.duration:dict = parameters["duration"].copy()
            self.type:str = parameters["type"]    # income, expense, invest, or rebalance
            self.initialAmount:int = parameters["initialAmount"]
            self.changeAmtOrPct:str = parameters["changeAmtOrPct"]
            self.changeDistribution:dict = parameters["changeDistribution"].copy()
            self.inflationAdjusted:bool = parameters["inflationAdjusted"]
            self.userFraction:float = parameters["userFraction"]
            if parameters["type"] == "income":
                self.socialSecurity:bool = parameters["socialSecurity"]
            else:
                self.discretionary:bool = parameters["discretionary"]
    
    def toDict(self):
        """
        This is a function modifies basic EventSeries types into dictionary
        """

        try:
            if self.invest is not None:
                return self.invest.toDict()
        except:
            pass

        try:
            if self.rebalance is not None:
                return self.rebalance.toDict()
        except:
            pass

        result = {
            "name": self.name,
            "start": self.start,
            "duration": self.duration,
            "type": self.type,
            "initialAmount": self.initialAmount,
            "changeAmtOrPct": self.changeAmtOrPct,
            "changeDistribution": self.changeDistribution,
            "inflationAdjusted": self.inflationAdjusted,
            "userFraction": self.userFraction,
        }

        try:
            if self.socialSecurity is not None:
                result["socialSecurity"] = self.socialSecurity
        except:
            result["discretionary"] = self.discretionary
        
        return result
    
def importJson(file:str):
        """
        This is a function for importing JSON file

        Args:
        ----
            file: this is full path for the JSON file

        Structure of JSON file is following:
        ----
            name: String of scenario name
            maritalStatus: couple or individual
            birthYears: a list with lenght 1 or 2, depending on maritalStatus
            lifeExpectancy: a list with length 1 or 2, depending on maritalStatus
            investmentTypes: [list]
            investments: [list]
            eventSeries: [list]
            inflationAssumption: {type, value}
            afterTaxContributionLimit
            spendingStrategy: list of discretionary expenses, identified by name
            expenseWithdrawalStrategy: list of investments, identified by id
            RMDStrategy: list of pre-tax investments, identified by id
            RothConversionOpt: boolean indicating whether the roth conversion optimizer is enabled
            RothConversionStart: start year
            RothConversionEnd: end year
            RothConversionStrategy: list of pre-tax investments, identified by id
            financialGoal: goal amount
            residenceState: states are identified by standard 2-letter abbreviations
        """

        with open(file) as f:
            yaml_data = yaml.load(f, Loader=yaml.FullLoader)
        
        return Scenario(yaml_data)

def exportYAML(data:Scenario):
    """
    This is a function for exporting YAML file

    Args:
    ----
        data: this is a Scenario object that stores the setting values
    """

    with open('./export_user.yaml', 'w') as f:
        yaml.dump(data.toDict(), f, default_flow_style=False, sort_keys=False)