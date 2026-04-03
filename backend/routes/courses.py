from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback

courses_bp = Blueprint('courses', __name__)

@courses_bp.route('/data')
@login_required
@role_required('admin', 'faculty', 'staff')
def courses_data():
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
            
        return jsonify({'success': True, 'courses': courses_list}), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@courses_bp.route('/')
@login_required
@role_required('admin', 'faculty', 'staff')
def courses():
    try:
        return render_template('courses/courses.html', courses=[])
    except Exception as e:
        traceback.print_exc()
        flash('Error loading cloud courses data', 'error')
        return render_template('courses/courses.html', courses=[])


@courses_bp.route('/add', methods=['POST'])
@login_required
@role_required('admin')
def add_course_json():
    db = get_firestore()
    try:
        data = request.json
        course_data = {
            'name': data['name'],
            'code': data['code'].upper(),
            'department_id': data['department_id'],
            'type': data.get('type', 'Undergraduate'),
            'duration_years': int(data.get('duration_years', 3)),
            'total_semesters': int(data.get('total_semesters', 6)),
            'description': data.get('description', ''),
            'eligibility': data.get('eligibility', ''),
            'fee_structure': float(data.get('fee_structure', 0)),
            'status': data.get('status', 'Active'),
            'created_at': firestore.SERVER_TIMESTAMP
        }
        db.collection('courses').document().set(course_data)
        return jsonify({'success': True, 'message': 'Course added successfully'}), 201
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@courses_bp.route('/departments/data')
@login_required
def departments_data():
    try:
        db = get_firestore()
        dept_list = []
        departments_query = db.collection('departments').order_by('name').stream()
        for doc in departments_query:
            d = doc.to_dict()
            d['id'] = doc.id
            dept_list.append(d)
        return jsonify({'success': True, 'departments': dept_list})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@courses_bp.route('/edit/<course_id>', methods=['POST'])
@login_required
@role_required('admin')
def edit_course_json(course_id):
    db = get_firestore()
    try:
        data = request.json
        update_data = {
            'name': data['name'],
            'code': data['code'].upper(),
            'department_id': data['department_id'],
            'type': data.get('type', 'Undergraduate'),
            'duration_years': int(data.get('duration_years', 3)),
            'total_semesters': int(data.get('total_semesters', 6)),
            'description': data.get('description', ''),
            'eligibility': data.get('eligibility', ''),
            'fee_structure': float(data.get('fee_structure', 0)),
            'status': data.get('status', 'Active')
        }
        db.collection('courses').document(course_id).update(update_data)
        return jsonify({'success': True, 'message': 'Course updated successfully'})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500
            
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

@courses_bp.route('/subjects/<course_id>/data')
@login_required
def course_subjects_data(course_id):
    try:
        db = get_firestore()
        subjects = []
        subjects_query = db.collection('subjects').where('course_id', '==', course_id).order_by('semester').stream()
        for doc in subjects_query:
            s = doc.to_dict()
            s['id'] = doc.id
            subjects.append(s)
        return jsonify({'success': True, 'subjects': subjects})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@courses_bp.route('/add_subject', methods=['POST'])
@login_required
@role_required('admin')
def add_subject_json():
    try:
        db = get_firestore()
        data = request.json
        subject_data = {
            'name': data['name'],
            'code': data['code'].upper(),
            'course_id': data['course_id'],
            'semester': int(data['semester']),
            'credits': int(data.get('credits', 3)),
            'type': data.get('type', 'Core'),
            'description': data.get('description', ''),
            'created_at': firestore.SERVER_TIMESTAMP
        }
        db.collection('subjects').document().set(subject_data)
        return jsonify({'success': True, 'message': 'Subject added successfully'})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

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

@courses_bp.route('/add_department', methods=['POST'])
@login_required
@role_required('admin')
def add_department_json():
    try:
        db = get_firestore()
        data = request.json
        dept_data = {
            'name': data['name'],
            'code': data['code'].upper(),
            'description': data.get('description', ''),
            'established_year': data.get('established_year', ''),
            'created_at': firestore.SERVER_TIMESTAMP
        }
        db.collection('departments').document().set(dept_data)
        return jsonify({'success': True, 'message': 'Department added successfully'})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500
