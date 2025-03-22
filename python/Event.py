class Event:
    def __init__(self):
        self.year = 0
        self.duration = 0
        self.type = ""
    
    def __new__(self, year, duration, type):
        self.year = year
        self.duration = duration
        self.type = type