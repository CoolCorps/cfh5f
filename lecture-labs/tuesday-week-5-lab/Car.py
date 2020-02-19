class Vehicle():

    def setName(self, name):
        self.name = name
    
    def get_name(self):
        return self.name

class Car(Vehicle):
    num_wheels = 0

    def __init__(self):
        self.num_wheels = 4

    def get_num_wheels(self):
        return self.num_wheels