from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback

students_bp = Blueprint('students', __name__)

@students_bp.route('/data')
@login_required
@role_required('admin', 'faculty', 'staff')
def students_data():
    try:
        db = get_firestore()
        students_list = []
        
        students_ref = db.collection('students')
        
        if current_user.role != 'admin':
            faculty_doc = db.collection('faculty').where('user_id', '==', current_user.id).limit(1).get()
            if faculty_doc:
                dept_id = faculty_doc[0].to_dict().get('department_id')
                query = students_ref.where('department_id', '==', dept_id).stream()
            else:
                query = []
        else:
            query = students_ref.stream()

        for doc in query:
            student_data = doc.to_dict()
            student_data['id'] = doc.id
            
            user_doc = db.collection('users').document(student_data.get('user_id')).get()
            if user_doc.exists:
                u_data = user_doc.to_dict()
                student_data['name'] = u_data.get('name')
                student_data['email'] = u_data.get('email')
                student_data['phone'] = u_data.get('phone')
            
            if 'course_id' in student_data:
                course_doc = db.collection('courses').document(student_data['course_id']).get()
                if course_doc.exists:
                    student_data['course_name'] = course_doc.to_dict().get('name')
                    
            students_list.append(student_data)
        
        return jsonify({'success': True, 'students': students_list}), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@students_bp.route('/save', methods=['POST'])
@login_required
@role_required('admin')
def save_student_api():
    try:
        import bcrypt
        db = get_firestore()
        data = request.json
        
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        phone = data.get('phone')
        reg_no = data.get('reg_no')
        course_id = data.get('course_id')
        
        # Check if email exists
        user_check = db.collection('users').where('email', '==', email).limit(1).get()
        if user_check:
            return jsonify({'success': False, 'message': 'Email already registered'}), 400

        # Create User Account
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user_data = {
            'name': name,
            'email': email,
            'password': hashed_password,
            'role': 'student',
            'phone': phone,
            'created_at': firestore.SERVER_TIMESTAMP
        }
        
        new_user_ref = db.collection('users').document()
        new_user_ref.set(user_data)
        user_id = new_user_ref.id
        
        # Create Student Record
        student_data = {
            'user_id': user_id,
            'reg_no': reg_no,
            'roll_no': data.get('roll_no', ''),
            'admission_date': data.get('admission_date', ''),
            'course_id': course_id,
            'department_id': data.get('department_id', ''),
            'gender': data.get('gender', ''),
            'blood_group': data.get('blood_group', ''),
            'created_at': firestore.SERVER_TIMESTAMP
        }
        
        db.collection('students').document().set(student_data)
        
        return jsonify({'success': True, 'message': 'Student added successfully'}), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@students_bp.route('/courses')
@login_required
def get_courses_api():
    try:
        db = get_firestore()
        courses = []
        courses_query = db.collection('courses').where('status', '==', 'Active').stream()
        for doc in courses_query:
            c = doc.to_dict()
            c['id'] = doc.id
            courses.append(c)
        return jsonify({'success': True, 'courses': courses}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@students_bp.route('/delete/<student_id>', methods=['POST'])
@login_required
@role_required('admin')
def delete_student_api(student_id):
    try:
        db = get_firestore()
        doc_ref = db.collection('students').document(student_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({'success': False, 'message': 'Student record not found'}), 404
            
        user_id = doc.to_dict().get('user_id')
        
        # Delete student record and user record
        doc_ref.delete()
        if user_id:
            db.collection('users').document(user_id).delete()
            
        return jsonify({'success': True, 'message': 'Student records deleted successfully'})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500
