from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback

staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/data')
@login_required
@role_required('admin')
def staff_data():
    try:
        db = get_firestore()
        staff_list = []
        
        # Fetch users with role faculty or staff
        users_ref = db.collection('users')
        faculty_users = users_ref.where('role', 'in', ['faculty', 'staff']).stream()
        
        for user_doc in faculty_users:
            u_data = user_doc.to_dict()
            u_id = user_doc.id
            s_data = {
                'id': u_id,
                'name': u_data.get('name'),
                'email': u_data.get('email'),
                'phone': u_data.get('phone'),
                'role': u_data.get('role'),
                'designation': 'N/A',
                'department_name': 'N/A',
                'status': 'Active'
            }
            
            # Fetch faculty details if role is faculty
            if u_data.get('role') == 'faculty':
                faculty_query = db.collection('faculty').where('user_id', '==', u_id).limit(1).get()
                if faculty_query:
                    f_data = faculty_query[0].to_dict()
                    s_data['designation'] = f_data.get('designation', 'N/A')
                    s_data['status'] = f_data.get('status', 'Active')
                    
                    # Fetch department name
                    dept_id = f_data.get('department_id')
                    if dept_id:
                        dept_doc = db.collection('departments').document(dept_id).get()
                        if dept_doc.exists:
                            s_data['department_name'] = dept_doc.to_dict().get('name', 'N/A')
            
            staff_list.append(s_data)
            
        from flask import jsonify
        return jsonify({'success': True, 'staff': staff_list}), 200
        
    except Exception as e:
        traceback.print_exc()
        from flask import jsonify
        return jsonify({'success': False, 'message': str(e)}), 500

@staff_bp.route('/')
@login_required
@role_required('admin')
def staff():
    try:
        return render_template('staff/staff.html', staff=[])
    except Exception as e:
        traceback.print_exc()
        flash('Error loading cloud staff data', 'error')
        return render_template('staff/staff.html', staff=[])


@staff_bp.route('/add', methods=['POST'])
@login_required
@role_required('admin')
def add_staff_json():
    try:
        db = get_firestore()
        import bcrypt
        data = request.json
        name = data['name']
        email = data['email']
        password = data.get('password', 'password123')
        role = data['role']
        phone = data.get('phone', '')
        
        # Additional fields
        department_id = data.get('department_id')
        designation = data.get('designation')
        employee_id = data.get('employee_id')
        
        # Check existence
        users_ref = db.collection('users')
        existing = users_ref.where('email', '==', email).limit(1).get()
        if existing:
            return jsonify({'success': False, 'message': 'Email already registered'}), 400
            
        # Create User
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user_data = {
            'name': name,
            'email': email,
            'password': hashed_password,
            'role': role,
            'phone': phone,
            'created_at': firestore.SERVER_TIMESTAMP
        }
        
        # Create document and use its ID
        new_user_ref = db.collection('users').document()
        new_user_ref.set(user_data)
        user_id = new_user_ref.id
        
        if role == 'faculty':
            faculty_data = {
                'user_id': user_id,
                'employee_id': employee_id,
                'department_id': department_id,
                'designation': designation,
                'status': 'Active',
                'created_at': firestore.SERVER_TIMESTAMP
            }
            db.collection('faculty').add(faculty_data)
            
        return jsonify({'success': True, 'message': f'{role.capitalize()} added successfully'})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@staff_bp.route('/departments')
@login_required
def get_departments_json():
    try:
        db = get_firestore()
        departments = []
        dept_query = db.collection('departments').order_by('name').stream()
        for doc in dept_query:
            d = doc.to_dict()
            d['id'] = doc.id
            departments.append(d)
        return jsonify({'success': True, 'departments': departments})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500
