
Class: Student

Methods:
- String read_assignment(int id)
    - make sure you cannot access an assignment that does not exist
- bool upload_file(File file)
    - check file extension matches list of supported file types
    - make sure file storage is connected correctly
- bool login_logout(username, password)
    - check for no spaces / invalid characters
    - check username and password with dummy account
    - test encryption method