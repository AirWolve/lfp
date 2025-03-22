class Scenario:
    id = 0
    def __init__(self, parameters):
        self.parameters = parameters
    
    def getParameters(self, key):
        return self.parameters.get(key)
    
    def setParameters(self, key, value):
        
        if self.parameters.get(key) != value:
            self.parameters[key] = value
        else:
            print("Invalid Setting!")