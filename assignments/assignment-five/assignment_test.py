import pytest
import System

@pytest.fixture
def grading_system():
    gradingSystem = System.System()
    gradingSystem.load_data()
    return gradingSystem

#1
def test_login(grading_system):
    name = 'cmhbf5'
    password = 'bestTA'
    grading_system.login(name, password)
    
    assert name == grading_system.usr.name

#2
def test_check_password(grading_system):
    assert grading_system.check_password('cmhbf5', 'bestTA')
    assert not grading_system.check_password('cmhbf5', 'bestta')
    assert not grading_system.check_password('cmhbf5', 'BESTTA')
    assert not grading_system.check_password('cmhbf5', 'best TA')
    assert not grading_system.check_password('cmhbf5', 'asdf')

#3
def test_change_grade(grading_system):
    grading_system.login('cmhbf5', 'bestTA')

    test_grade = 7

    grading_system.usr.change_grade('hdjsr7', 'databases', 'assignment1', test_grade)
    grades = grading_system.usr.check_grades('hdjsr7', 'databases')

    get_grade = None
    for item in grades:
        if item[0] == "assignment1":
            get_grade = item[1]
    
    assert test_grade == get_grade

#4
def test_create_assignment(grading_system):
    pass

#5
def test_add_student(grading_system):
    pass

#6
def test_drop_student(grading_system):
    pass

#7
def test_submit_assignment(grading_system):
    pass

#8
def test_check_ontime(grading_system):
    pass

#9
def test_check_grades(grading_system):
    pass

#10
def test_view_assignments(grading_system):
    pass

#-------------------------

#11

#12

#13

#14

#15