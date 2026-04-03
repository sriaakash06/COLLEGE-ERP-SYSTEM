from flask import Blueprint, render_template, request, redirect, session, url_for, flash, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from db import mysql
import bcrypt
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
                flash('You do not have permission to access this page.', 'danger')
                return redirect(url_for('auth.dashboard'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@auth_bp.route('/', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        print(f"Login attempt: email={email}")
        
        try:
            cur = mysql.connection.cursor()
            cur.execute("SELECT id, name, email, password, role FROM users WHERE email=%s", (email,))
            user = cur.fetchone()
            cur.close()
            
            print(f"User found: {user is not None}")
            
            if user:
                print(f"User data: {user[0]}, {user[1]}, {user[2]}, {user[4]}")
                if bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):
                    print("Password verified successfully")
                    from models.user import User
                    user_obj = User(user[0], user[1], user[2], user[4])
                    login_user(user_obj)
                    
                    if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.is_json:
                        return jsonify({'success': True, 'redirect': url_for('auth.dashboard')})
                    flash('Login successful!', 'success')
                    return redirect(url_for('auth.dashboard'))
                else:
                    print("Password verification failed")
            else:
                print("No user found")
                
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.is_json:
                return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
            flash('Invalid email or password', 'danger')
            return render_template('login.html')
            
        except Exception as e:
            print(f"Login error: {e}")
            import traceback
            traceback.print_exc()
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.is_json:
                return jsonify({'success': False, 'message': 'Login failed'}), 500
            flash('Login failed. Please try again.', 'danger')
            return render_template('login.html')
    
    return render_template('login.html')

@auth_bp.route('/dashboard')
@login_required
def dashboard():
    try:
        cur = mysql.connection.cursor()
        
        # Get dashboard statistics based on user role
        if current_user.role == 'admin':
            # Admin can see all statistics
            cur.execute("SELECT COUNT(*) FROM students WHERE status='Active'")
            total_students = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM faculty WHERE status='Active'")
            total_faculty = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM courses WHERE status='Active'")
            total_courses = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM notices WHERE status='Active' AND expiry_date >= CURDATE()")
            active_notices = cur.fetchone()[0]
            
            stats = {
                'total_students': total_students,
                'total_faculty': total_faculty,
                'total_courses': total_courses,
                'active_notices': active_notices
            }
            
        elif current_user.role == 'student':
            # Student specific statistics
            cur.execute("SELECT COUNT(*) FROM attendance WHERE student_id=%s AND status='Present' AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)", (current_user.id,))
            attendance_days = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM fees WHERE student_id=%s AND status='Pending'", (current_user.id,))
            pending_fees = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM book_issuance WHERE student_id=%s AND status='Issued'", (current_user.id,))
            issued_books = cur.fetchone()[0]
            
            stats = {
                'attendance_days': attendance_days,
                'pending_fees': pending_fees,
                'issued_books': issued_books
            }
            
        elif current_user.role == 'faculty':
            # Faculty specific statistics
            cur.execute("SELECT COUNT(*) FROM subjects WHERE id IN (SELECT subject_id FROM timetable WHERE faculty_id=%s AND status='Active')", (current_user.id,))
            assigned_subjects = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM timetable WHERE faculty_id=%s AND status='Active'", (current_user.id,))
            scheduled_classes = cur.fetchone()[0]
            
            stats = {
                'assigned_subjects': assigned_subjects,
                'scheduled_classes': scheduled_classes
            }
        
        # Get recent notices for all users
        cur.execute("SELECT title, content, posted_date FROM notices WHERE status='Active' AND expiry_date >= CURDATE() ORDER BY posted_date DESC LIMIT 5")
        recent_notices = cur.fetchall()
        cur.close()
        
        return render_template('dashboard.html', stats=stats, recent_notices=recent_notices)
        
    except Exception as e:
        print(f"Dashboard error: {e}")
        flash('Error loading dashboard', 'danger')
        return render_template('dashboard.html', stats={}, recent_notices=[])

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('auth.login'))

@auth_bp.route('/profile')
@login_required
def profile():
    try:
        cur = mysql.connection.cursor()
        
        if current_user.role == 'student':
            cur.execute("""
                SELECT s.*, u.name, u.email, u.phone, c.name as course_name, d.name as department_name 
                FROM students s 
                JOIN users u ON s.user_id = u.id 
                LEFT JOIN student_enrollments se ON s.id = se.student_id 
                LEFT JOIN courses c ON se.course_id = c.id 
                LEFT JOIN departments d ON c.department_id = d.id 
                WHERE s.user_id = %s
            """, (current_user.id,))
            profile_data = cur.fetchone()
        elif current_user.role == 'faculty':
            cur.execute("""
                SELECT f.*, u.name, u.email, u.phone, d.name as department_name 
                FROM faculty f 
                JOIN users u ON f.user_id = u.id 
                JOIN departments d ON f.department_id = d.id 
                WHERE f.user_id = %s
            """, (current_user.id,))
            profile_data = cur.fetchone()
        else:
            cur.execute("SELECT name, email, phone FROM users WHERE id = %s", (current_user.id,))
            profile_data = cur.fetchone()
        
        cur.close()
        return render_template('profile.html', profile_data=profile_data)
        
    except Exception as e:
        print(f"Profile error: {e}")
        flash('Error loading profile', 'danger')
        return redirect(url_for('auth.dashboard'))
