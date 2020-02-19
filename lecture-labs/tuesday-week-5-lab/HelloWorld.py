import Car

text = 'Hello World'

print(text)

fav_colors = {
    'callum': 'green',
    'someone else': 'a different color'
}

print(fav_colors['callum'])

users = {
    'callum': {
        'password': 'asdf'
    }
}

print(users['callum']['password'])

if __name__ == "__main__":
    print("main")
    mustang = Car.Car()
    mustang.setName("mustang")
    num_wheels = mustang.get_num_wheels()
    print(num_wheels)