import pytest
import System

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

@pytest.fixture
def grading_system():
    gradingSystem = System.System()
    gradingSystem.load_data()
    return gradingSystem