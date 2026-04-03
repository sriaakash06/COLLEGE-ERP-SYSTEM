from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback

students_bp = Blueprint('students', __name__)

@students_bp.route('/students')
@login_required
@role_required('admin', 'faculty', 'staff')
def students():
    try:
        db = get_firestore()
        students_list = []
        
        # In Firestore, we'll fetch students and their linked user data
        students_ref = db.collection('students')
        
        # Faculty filtering logic
        if current_user.role != 'admin':
            # Get faculty department
            faculty_doc = db.collection('faculty').where('user_id', '==', current_user.id).limit(1).get()
            if faculty_doc:
                dept_id = faculty_doc[0].to_dict().get('department_id')
                # Filter students by department (stored in their course enrollment)
                # For simplicity in this demo, we'll fetch all and filter or assume dept_id is in student record
                query = students_ref.where('department_id', '==', dept_id).stream()
            else:
                query = []
        else:
            query = students_ref.stream()

        for doc in query:
            student_data = doc.to_dict()
            student_data['id'] = doc.id
            
            # Fetch user details
            user_doc = db.collection('users').document(student_data.get('user_id')).get()
            if user_doc.exists:
                u_data = user_doc.to_dict()
                student_data['name'] = u_data.get('name')
                student_data['email'] = u_data.get('email')
                student_data['phone'] = u_data.get('phone')
            
            # Fetch course details
            if 'course_id' in student_data:
                course_doc = db.collection('courses').document(student_data['course_id']).get()
                if course_doc.exists:
                    student_data['course_name'] = course_doc.to_dict().get('name')
                    
            students_list.append(student_data)
        
        return render_template('students/students.html', students=students_list)
        
    except Exception as e:
        traceback.print_exc()
        flash('Error loading cloud students data', 'error')
        return render_template('students/students.html', students=[])

@students_bp.route('/students/add', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def add_student():
    db = get_firestore()
    if request.method == 'POST':
        try:
            import bcrypt
            # Get form data
            name = request.form['name']
            email = request.form['email']
            password = request.form['password']
            phone = request.form['phone']
            reg_no = request.form['reg_no']
            course_id = request.form.get('course_id')
            
            # Create User Account first
            users_ref = db.collection('users')
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            user_data = {
                'name': name,
                'email': email,
                'password': hashed_password,
                'role': 'student',
                'phone': phone,
                'created_at': firestore.SERVER_TIMESTAMP
            }
            
            new_user_ref = users_ref.document()
            new_user_ref.set(user_data)
            user_id = new_user_ref.id
            
            # Create Student Record
            student_data = {
                'user_id': user_id,
                'reg_no': reg_no,
                'roll_no': request.form.get('roll_no', ''),
                'admission_date': request.form.get('admission_date', ''),
                'course_id': course_id,
                'department_id': request.form.get('department_id'), # Optional
                'gender': request.form.get('gender', ''),
                'blood_group': request.form.get('blood_group', ''),
                'created_at': firestore.SERVER_TIMESTAMP
            }
            
            db.collection('students').document().set(student_data)
            
            flash('Student added to cloud successfully!', 'success')
            return redirect(url_for('students.students'))
            
        except Exception as e:
            traceback.print_exc()
            flash('Error adding student to cloud', 'error')
    
    # Get courses for dropdown
    courses = []
    try:
        courses_query = db.collection('courses').where('status', '==', 'Active').stream()
        for doc in courses_query:
            c = doc.to_dict()
            c['id'] = doc.id
            courses.append(c)
    except:
        pass
        
    return render_template('students/add_student.html', courses=courses)
