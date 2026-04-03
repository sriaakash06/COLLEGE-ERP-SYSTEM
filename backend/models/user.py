from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, id, name, email, role):
        self.id = id
        self.name = name
        self.email = email
        self.role = role
    
    def is_admin(self):
        return self.role == 'admin'
    
    def is_student(self):
        return self.role == 'student'
    
    def is_faculty(self):
        return self.role == 'faculty'
    
    def is_staff(self):
        return self.role == 'staff'
