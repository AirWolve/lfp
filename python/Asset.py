class Asset:
    def __init__(self):
        self.type = ""
        self.name = ""
        self.amount = 0.0
        self.taxType = ""
    
    def __new__(self, type, name, amount, taxType):
        self.type = type
        self.name = name
        self.amount = amount
        self.taxType = taxType