**Name:** Callum Ferguson  
**Exercise Name:** Requirements Analysis

# Step 1

Users:
1. Instructor
2. TA
3. Student

# Steps 2 and 3

Instructor:
1. View students' submitted assignments
    - **data:** studentID, sectionID, assignmentID, grade, comments
        - instructor can see the grade and comments of a specific student's assignment
    - **constraints:** student must be in a section that the instructor is an instructor for
2. Drop student from class
    - **data:** studentID, assignments, sectionID
        - drops student with studentID from the class and deletes/frees the memory of their assignments
    - **constraints:** student must be in a section that the instructor is an instructor for
3. Add TA to section
    - **data:** TAID, sectionID
        - take TA with id TAID and make them the TA for a specific section
    - **constraints:** instructor must be instructor for section with sectionID

TA:
1. Collect/view students' submitted assignments
    - **data:** studentID, sectionID, assignments, TAID
        - view the assignments of a specific student in a specific section
    - **constraints:** TA must be a TA for the section
2. Assign grade to assignment for a student
    - **data:** assignmentID, grade, studentID, TAID
        - updates grade attribute of specific student's assignment
        - records the id of the TA who assigned the grade
    - **constraints:** TA must be a TA for the section, and assignment must be submitted before grade can be assigned
3. Comment on assignment
    - **data:** assignmentID, comment, studentID, TAID
    - **constraints:** TA must be a TA for the section, and assignment must be submitted before grade can be assigned

Student:
1. Submit assignment
    - **data:** assignment, studentID, sectionID, submissionTime
        - the submissionTime is recorded as an attribute of the assignment
    - **constraints:** cannot submit if it is after the due date
2. Update assignment submission
    - **data:** assignmentID, studentID, sectionID, submissionTime
        - submission time is changed once an assignment is updated
    - **constraints:** assignment must already be submitted to update it, and it must be before the due date
3. Check grade of assignment
    - **data:** assignmentID, studentID, sectionID
        - if the assignment is graded, a specific student can see a specific assignment's grade
    - **constraints:** assignment must already be submitted to view grade

# Step 4

System constraints/requirements
1. Access to the internet
2. Database with enough storage for each students' submissions
3. Able to handle multiple students submitting assignment at the same time