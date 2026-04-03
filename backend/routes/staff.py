from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback

staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/')
@login_required
@role_required('admin')
def staff():
    try:
        db = get_firestore()
        staff_list = []
        
        # Fetch users with role faculty or staff
        users_ref = db.collection('users')
        faculty_users = users_ref.where('role', 'in', ['faculty', 'staff']).stream()
        
        for user_doc in faculty_users:
            u_data = user_doc.to_dict()
            u_id = user_doc.id
            staff_data = {
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
                    staff_data['designation'] = f_data.get('designation', 'N/A')
                    staff_data['status'] = f_data.get('status', 'Active')
                    
                    # Fetch department name
                    dept_id = f_data.get('department_id')
                    if dept_id:
                        dept_doc = db.collection('departments').document(dept_id).get()
                        if dept_doc.exists:
                            staff_data['department_name'] = dept_doc.to_dict().get('name', 'N/A')
            
            staff_list.append(staff_data)
            
        return render_template('staff/staff.html', staff=staff_list)
        
    except Exception as e:
        traceback.print_exc()
        flash('Error loading cloud staff data', 'error')
        return render_template('staff/staff.html', staff=[])

@staff_bp.route('/add', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def add_staff():
    db = get_firestore()
    try:
        if request.method == 'POST':
            import bcrypt
            name = request.form['name']
            email = request.form['email']
            password = 'password123' # Default
            role = request.form['role']
            phone = request.form.get('phone', '')
            
            # Additional fields
            department_id = request.form.get('department_id')
            designation = request.form.get('designation')
            employee_id = request.form.get('employee_id')
            
            # Check existence
            users_ref = db.collection('users')
            existing = users_ref.where('email', '==', email).limit(1).get()
            if existing:
                flash('Email already registered in cloud', 'danger')
            else:
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
                new_user_ref = users_ref.document()
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
                    db.collection('faculty').document().set(faculty_data)
                
                flash(f'{role.capitalize()} added successfully! Default pass: password123', 'success')
                return redirect(url_for('staff.staff'))
        
        # Get Departments
        departments = []
        dept_query = db.collection('departments').order_by('name').stream()
        for doc in dept_query:
            d = doc.to_dict()
            d['id'] = doc.id
            departments.append(d)
            
        return render_template('staff/add_staff.html', departments=departments)
        
    except Exception as e:
        traceback.print_exc()
        flash('Error adding staff member to cloud', 'error')
        return redirect(url_for('staff.staff'))
