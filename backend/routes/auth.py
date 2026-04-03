from flask import Blueprint, render_template, request, redirect, session, url_for, flash, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from db import get_firestore
from firebase_admin import firestore
import bcrypt
import traceback
from functools import wraps

auth_bp = Blueprint('auth', __name__)

# Role-based access control decorator
def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                return redirect(url_for('auth.login'))
            if current_user.role not in roles:
                flash('You do not have permission to access this page.', 'error')
                return redirect(url_for('auth.dashboard'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@auth_bp.route('/', methods=['GET','POST'])
@auth_bp.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        try:
            db = get_firestore()
            if not db:
                return jsonify({'success': False, 'message': 'Cloud Database Connection Failed'}), 500
            
            # Find user in Firestore
            users_ref = db.collection('users')
            query = users_ref.where('email', '==', email).limit(1).stream()
            user = None
            for doc in query:
                user_data = doc.to_dict()
                user_data['id'] = doc.id
                user = user_data

            if user and 'password' in user:
                # Check password
                if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
                    from models.user import User
                    user_obj = User(user['id'], user['name'], user['email'], user['role'])
                    login_user(user_obj)
                    
                    if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.is_json:
                        return jsonify({'success': True, 'redirect': url_for('auth.dashboard')})
                    return redirect(url_for('auth.dashboard'))
            
            # Invalid credentials
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.is_json:
                return jsonify({'success': False, 'message': 'Invalid cloud credentials'}), 401
            flash('Invalid email or password', 'error')
            
        except Exception as e:
            traceback.print_exc()
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.is_json:
                return jsonify({'success': False, 'message': 'Authentication service error'}), 500
            flash('Login failed. Please try again.', 'error')
    
    if current_user.is_authenticated:
        return redirect(url_for('auth.dashboard'))
    return render_template('login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        role = request.form.get('role', 'student')
        
        try:
            db = get_firestore()
            if not db:
                return jsonify({'success': False, 'message': 'Setup Required: Add firebase-key.json'}), 500

            # Check if user already exists
            users_ref = db.collection('users')
            query = users_ref.where('email', '==', email).limit(1).stream()
            if any(query):
                return jsonify({'success': False, 'message': 'Email already registered in Cloud'}), 400

            # Hash password
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Create user in Firestore
            user_data = {
                'name': name,
                'email': email,
                'password': hashed_password,
                'role': role,
                'created_at': firestore.SERVER_TIMESTAMP
            }
            
            new_user_ref = users_ref.document()
            new_user_ref.set(user_data)
            
            flash('Registration successful!', 'success')
            return jsonify({'success': True, 'redirect': url_for('auth.login')})
            
        except Exception as e:
            traceback.print_exc()
            return jsonify({'success': False, 'message': 'Registration error'}), 500
            
    return render_template('register.html')

@auth_bp.route('/dashboard')
@login_required
def dashboard():
    try:
        db = get_firestore()
        stats = {}
        
        if db:
            if current_user.role == 'admin':
                stats['total_students'] = len(list(db.collection('students').stream()))
                stats['total_faculty'] = len(list(db.collection('faculty').stream()))
                stats['total_courses'] = len(list(db.collection('courses').stream()))
                stats['active_notices'] = len(list(db.collection('notices').where('status', '==', 'Active').stream()))
            elif current_user.role == 'student':
                # Similar logic for students...
                pass
            
            # Get notices
            notices_query = db.collection('notices').where('status', '==', 'Active').order_by('posted_date', direction=firestore.Query.DESCENDING).limit(5).stream()
            recent_notices = []
            for doc in notices_query:
                n = doc.to_dict()
                recent_notices.append((n.get('title'), n.get('content'), n.get('posted_date')))
        else:
            recent_notices = []

        return render_template('dashboard.html', stats=stats, recent_notices=recent_notices)
        
    except Exception as e:
        traceback.print_exc()
        flash('Error loading cloud data', 'error')
        return render_template('dashboard.html', stats={}, recent_notices=[])

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('auth.login'))
