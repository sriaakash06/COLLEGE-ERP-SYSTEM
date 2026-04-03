from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback

courses_bp = Blueprint('courses', __name__)

@courses_bp.route('/')
@login_required
@role_required('admin', 'faculty', 'staff')
def courses():
    try:
        db = get_firestore()
        courses_list = []
        
        # Faculty department logic
        dept_id = None
        if current_user.role != 'admin':
            faculty_doc = db.collection('faculty').where('user_id', '==', current_user.id).limit(1).get()
            if faculty_doc:
                dept_id = faculty_doc[0].to_dict().get('department_id')
        
        # Query courses
        courses_ref = db.collection('courses')
        if dept_id:
            query = courses_ref.where('department_id', '==', dept_id).stream()
        else:
            query = courses_ref.stream()

        for doc in query:
            c_data = doc.to_dict()
            c_data['id'] = doc.id
            
            # Fetch department name
            dept_doc = db.collection('departments').document(c_data.get('department_id')).get()
            if dept_doc.exists:
                c_data['department_name'] = dept_doc.to_dict().get('name')
            
            # Count enrolled students
            enrollments = db.collection('enrollments').where('course_id', '==', doc.id).where('status', '==', 'Active').stream()
            c_data['enrolled_students'] = len(list(enrollments))
            
            courses_list.append(c_data)
            
        return render_template('courses/courses.html', courses=courses_list)
        
    except Exception as e:
        traceback.print_exc()
        flash('Error loading cloud courses data', 'error')
        return render_template('courses/courses.html', courses=[])

@courses_bp.route('/add', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def add_course():
    db = get_firestore()
    if request.method == 'POST':
        try:
            course_data = {
                'name': request.form['name'],
                'code': request.form['code'],
                'department_id': request.form['department_id'],
                'type': request.form['type'],
                'duration_years': request.form['duration_years'],
                'total_semesters': request.form['total_semesters'],
                'description': request.form['description'],
                'eligibility': request.form['eligibility'],
                'fee_structure': float(request.form.get('fee_structure', 0)),
                'status': request.form.get('status', 'Active'),
                'created_at': firestore.SERVER_TIMESTAMP
            }
            db.collection('courses').document().set(course_data)
            flash('Course added to cloud successfully!', 'success')
            return redirect(url_for('courses.courses'))
        except Exception as e:
            traceback.print_exc()
            flash('Error adding course to cloud', 'error')
    
    # Get departments
    departments = []
    try:
        dept_query = db.collection('departments').order_by('name').stream()
        for doc in dept_query:
            d = doc.to_dict()
            d['id'] = doc.id
            departments.append(d)
    except:
        pass
    return render_template('courses/add_course.html', departments=departments)

@courses_bp.route('/edit/<course_id>', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def edit_course(course_id):
    db = get_firestore()
    doc_ref = db.collection('courses').document(course_id)
    
    if request.method == 'POST':
        try:
            update_data = {
                'name': request.form['name'],
                'code': request.form['code'],
                'department_id': request.form['department_id'],
                'type': request.form['type'],
                'duration_years': request.form['duration_years'],
                'total_semesters': request.form['total_semesters'],
                'description': request.form['description'],
                'eligibility': request.form['eligibility'],
                'fee_structure': float(request.form.get('fee_structure', 0)),
                'status': request.form['status']
            }
            doc_ref.update(update_data)
            flash('Course updated in cloud successfully!', 'success')
            return redirect(url_for('courses.courses'))
        except Exception as e:
            traceback.print_exc()
            flash('Error updating course in cloud', 'error')
            
    try:
        doc = doc_ref.get()
        if not doc.exists:
            flash('Course not found in cloud', 'danger')
            return redirect(url_for('courses.courses'))
        course = doc.to_dict()
        course['id'] = doc.id
        
        departments = []
        dept_query = db.collection('departments').order_by('name').stream()
        for d_doc in dept_query:
            d = d_doc.to_dict()
            d['id'] = d_doc.id
            departments.append(d)
            
        return render_template('courses/edit_course.html', course=course, departments=departments)
    except Exception as e:
        traceback.print_exc()
        flash('Error loading course from cloud', 'error')
        return redirect(url_for('courses.courses'))

@courses_bp.route('/subjects/<course_id>')
@login_required
@role_required('admin', 'faculty', 'staff')
def course_subjects(course_id):
    try:
        db = get_firestore()
        course_doc = db.collection('courses').document(course_id).get()
        if not course_doc.exists:
            flash('Course not found in cloud', 'danger')
            return redirect(url_for('courses.courses'))
        
        course = course_doc.to_dict()
        course['id'] = course_doc.id
        
        subjects = []
        subjects_query = db.collection('subjects').where('course_id', '==', course_id).order_by('semester').stream()
        for doc in subjects_query:
            s = doc.to_dict()
            s['id'] = doc.id
            # Count exams
            exams = db.collection('examinations').where('subject_id', '==', doc.id).stream()
            s['exam_count'] = len(list(exams))
            subjects.append(s)
            
        return render_template('courses/subjects.html', course=course, subjects=subjects)
    except Exception as e:
        traceback.print_exc()
        flash('Error loading subjects from cloud', 'error')
        return redirect(url_for('courses.courses'))

@courses_bp.route('/add_subject/<course_id>', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def add_subject(course_id):
    db = get_firestore()
    if request.method == 'POST':
        try:
            subject_data = {
                'name': request.form['name'],
                'code': request.form['code'],
                'course_id': course_id,
                'semester': int(request.form['semester']),
                'credits': int(request.form['credits']),
                'type': request.form['type'],
                'description': request.form['description'],
                'created_at': firestore.SERVER_TIMESTAMP
            }
            db.collection('subjects').document().set(subject_data)
            flash('Subject added to cloud successfully!', 'success')
            return redirect(url_for('courses.course_subjects', course_id=course_id))
        except Exception as e:
            traceback.print_exc()
            flash('Error adding subject to cloud', 'error')
            
    try:
        course_doc = db.collection('courses').document(course_id).get()
        if not course_doc.exists:
            return redirect(url_for('courses.courses'))
        course = course_doc.to_dict()
        return render_template('courses/add_subject.html', course=course, course_id=course_id)
    except:
        return redirect(url_for('courses.courses'))

@courses_bp.route('/delete/<course_id>', methods=['POST'])
@login_required
@role_required('admin')
def delete_course(course_id):
    try:
        db = get_firestore()
        # Check active enrollments
        enrollments = db.collection('enrollments').where('course_id', '==', course_id).where('status', '==', 'Active').limit(1).get()
        if enrollments:
            flash('Cannot delete course with active cloud enrollments', 'danger')
            return redirect(url_for('courses.courses'))
            
        db.collection('courses').document(course_id).delete()
        flash('Course deleted from cloud successfully!', 'success')
    except Exception as e:
        traceback.print_exc()
        flash('Error deleting course from cloud', 'error')
    return redirect(url_for('courses.courses'))

@courses_bp.route('/departments')
@login_required
@role_required('admin', 'faculty', 'staff')
def departments():
    try:
        db = get_firestore()
        dept_list = []
        departments_query = db.collection('departments').order_by('name').stream()
        
        for doc in departments_query:
            d_data = doc.to_dict()
            d_data['id'] = doc.id
            
            # HOD name
            if d_data.get('hod_id'):
                hod_doc = db.collection('users').document(d_data.get('hod_id')).get()
                if hod_doc.exists:
                    d_data['hod_name'] = hod_doc.to_dict().get('name')
            
            # Course count
            courses_count = db.collection('courses').where('department_id', '==', doc.id).stream()
            d_data['course_count'] = len(list(courses_count))
            
            # Faculty count
            faculty_count = db.collection('faculty').where('department_id', '==', doc.id).where('status', '==', 'Active').stream()
            d_data['faculty_count'] = len(list(faculty_count))
            
            dept_list.append(d_data)
            
        return render_template('courses/departments.html', departments=dept_list)
    except Exception as e:
        traceback.print_exc()
        flash('Error loading departments from cloud', 'error')
        return render_template('courses/departments.html', departments=[])

@courses_bp.route('/add_department', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def add_department():
    if request.method == 'POST':
        try:
            db = get_firestore()
            dept_data = {
                'name': request.form['name'],
                'code': request.form['code'],
                'description': request.form['description'],
                'established_year': request.form['established_year'],
                'created_at': firestore.SERVER_TIMESTAMP
            }
            db.collection('departments').document().set(dept_data)
            flash('Department added to cloud successfully!', 'success')
            return redirect(url_for('courses.departments'))
        except Exception as e:
            traceback.print_exc()
            flash('Error adding department to cloud', 'error')
    return render_template('courses/add_department.html')
