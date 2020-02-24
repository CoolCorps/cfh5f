import pytest
import System
import RestoreData as rd

@pytest.fixture
def grading_system():
    rd.reloadDataToFile()
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
    grading_system.login('cmhbf5', 'bestTA')

    assignment = 'assignment3'
    dueDate = '04/01/20'
    course = 'cloud_computing'

    grading_system.usr.create_assignment(assignment, dueDate, course)
    
    assert assignment in grading_system.courses[course]['assignments']
    assert grading_system.courses[course]['assignments'][assignment]['due_date'] == dueDate

#5
def test_add_student(grading_system):
    grading_system.login('goggins', 'augurrox')

    grading_system.usr.add_student('yted91', 'databases')

    assert 'databases' in grading_system.users['yted91']['courses']

#6
def test_drop_student(grading_system):
    grading_system.login('goggins', 'augurrox')

    grading_system.usr.drop_student('hdjsr7', 'software_engineering')

    assert 'software_engineering' not in grading_system.users['hdjsr7']['courses']

#7
def test_submit_assignment(grading_system):
    user = 'hdjsr7'
    assignmentName = 'assignment1'
    course = 'cloud_computing'
    submission = 'Blahhhhh'

    #due date is 1/3/20 so the submission should NOT be marked as on time
    date = '01/07/20'

    grading_system.login(user, 'pass1234')

    grading_system.usr.submit_assignment(course, assignmentName,submission, date)

    assignment = grading_system.users[user]['courses'][course][assignmentName]

    assert assignment['submission_date'] == date
    assert assignment['submission'] == submission
    assert not assignment['ontime']

#8
def test_check_ontime(grading_system):
    grading_system.login('hdjsr7', 'pass1234')

    assert grading_system.usr.check_ontime('02/23/20', '02/25/20')
    assert not grading_system.usr.check_ontime('02/23/20', '02/21/20')

#9
def test_check_grades(grading_system):
    user = 'hdjsr7'
    course = 'software_engineering'

    grading_system.login(user, 'pass1234')

    grades = grading_system.usr.check_grades(course)
    
    for assignment in grades:
        assert assignment[0] in grading_system.users[user]['courses'][course]
        assert assignment[1] == grading_system.users[user]['courses'][course][assignment[0]]['grade']

#10
def test_view_assignments(grading_system):
    user = 'hdjsr7'
    course = 'databases'

    grading_system.login(user, 'pass1234')

    assignments = grading_system.usr.view_assignments(course)

    assert len(assignments) == len(grading_system.courses[course]['assignments'])

    for assignment in assignments:
        assert assignment[0] in grading_system.courses[course]['assignments']
        assert assignment[1] == grading_system.courses[course]['assignments'][assignment[0]]['due_date']

#-------------------------

#11

#12

#13

#14

#15