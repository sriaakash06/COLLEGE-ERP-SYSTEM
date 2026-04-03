from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback

timetable_bp = Blueprint('timetable', __name__)

@timetable_bp.route('/data')
@login_required
def timetable_data():
    try:
        db = get_firestore()
        timetable_data = []
        
        if current_user.role == 'admin':
            tt_docs = db.collection('timetable').where('status', '==', 'Active').stream()
            for doc in tt_docs:
                entry = doc.to_dict()
                entry['id'] = doc.id
                timetable_data.append(entry)
                
        elif current_user.role == 'faculty':
            faculty_docs = db.collection('faculty').where('user_id', '==', current_user.id).limit(1).get()
            if len(faculty_docs) > 0:
                faculty_id = faculty_docs[0].id
                tt_docs = db.collection('timetable').where('faculty_id', '==', faculty_id).where('status', '==', 'Active').stream()
                for doc in tt_docs:
                    entry = doc.to_dict()
                    entry['id'] = doc.id
                    timetable_data.append(entry)
                    
        elif current_user.role == 'student':
            student_docs = db.collection('students').where('user_id', '==', current_user.id).limit(1).get()
            if len(student_docs) > 0:
                student_id = student_docs[0].id
                enroll_docs = db.collection('enrollments').where('student_id', '==', student_id).where('status', '==', 'Active').limit(1).get()
                
                if len(enroll_docs) > 0:
                    enroll_data = enroll_docs[0].to_dict()
                    course_id = enroll_data.get('course_id')
                    semester = enroll_data.get('semester', '1')
                    
                    tt_docs = db.collection('timetable').where('course_id', '==', course_id).where('semester', '==', semester).where('status', '==', 'Active').stream()
                    for doc in tt_docs:
                        entry = doc.to_dict()
                        entry['id'] = doc.id
                        timetable_data.append(entry)
        
        # Enrich data with joins
        enriched_data = []
        for entry in timetable_data:
            # Subject info
            s_doc = db.collection('subjects').document(entry.get('subject_id')).get()
            if s_doc.exists:
                s_data = s_doc.to_dict()
                entry['subject_name'] = s_data.get('name')
                entry['subject_code'] = s_data.get('code')
                
            # Course info
            c_doc = db.collection('courses').document(entry.get('course_id')).get()
            if c_doc.exists:
                c_data = c_doc.to_dict()
                entry['course_name'] = c_data.get('name')
                
                # Department info
                d_doc = db.collection('departments').document(c_data.get('department_id')).get()
                if d_doc.exists:
                    entry['department_name'] = d_doc.to_dict().get('name')
            
            # Faculty info
            f_doc = db.collection('faculty').document(entry.get('faculty_id')).get()
            if f_doc.exists:
                f_data = f_doc.to_dict()
                u_doc = db.collection('users').document(f_data.get('user_id')).get()
                if u_doc.exists:
                    entry['faculty_name'] = u_doc.to_dict().get('name')
            
            enriched_data.append(entry)
            
        # Group by day
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        grouped_timetable = {day: [] for day in days}
        
        for entry in enriched_data:
            day = entry.get('day_of_week')
            if day in grouped_timetable:
                grouped_timetable[day].append(entry)
        
        # Sort each day by start_time
        for day in days:
            grouped_timetable[day].sort(key=lambda x: x.get('start_time', ''))
            
        return jsonify({
            'success': True,
            'timetable': grouped_timetable,
            'days': days
        }), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@timetable_bp.route('/')
@login_required
def timetable():
    try:
        return render_template('timetable/timetable.html', timetable={}, days=[])
    except Exception as e:
        import traceback
        traceback.print_exc()
        flash('Error loading timetable', 'danger')
        return render_template('timetable/timetable.html', timetable={}, days=[])


@timetable_bp.route('/add', methods=['POST'])
@login_required
@role_required('admin')
def add_timetable_json():
    try:
        db = get_firestore()
        data = request.json
        tt_data = {
            'subject_id': data['subject_id'],
            'faculty_id': data['faculty_id'],
            'course_id': data['course_id'],
            'semester': data['semester'],
            'day_of_week': data['day_of_week'],
            'start_time': data['start_time'],
            'end_time': data['end_time'],
            'room_no': data.get('room_no', ''),
            'academic_year': data.get('academic_year', '2024-25'),
            'status': 'Active',
            'created_at': firestore.SERVER_TIMESTAMP
        }
        db.collection('timetable').add(tt_data)
        return jsonify({'success': True, 'message': 'Timetable entry added successfully'}), 201
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500
    
    # Get dropdown data
    try:
        # Courses
        courses_docs = db.collection('courses').stream()
        courses = []
        for doc in courses_docs:
            c = doc.to_dict()
            c['id'] = doc.id
            courses.append(c)
        courses.sort(key=lambda x: x.get('name', ''))
        
        # Subjects
        subjects_docs = db.collection('subjects').where('status', '==', 'Active').stream()
        subjects = []
        for doc in subjects_docs:
            s = doc.to_dict()
            s['id'] = doc.id
            # Add course name for context
            c_doc = db.collection('courses').document(s.get('course_id')).get()
            if c_doc.exists:
                s['course_name'] = c_doc.to_dict().get('name')
            subjects.append(s)
        subjects.sort(key=lambda x: (x.get('course_name', ''), x.get('semester', ''), x.get('name', '')))
        
        # Faculty
        faculty_docs = db.collection('faculty').where('status', '==', 'Active').stream()
        faculty_list = []
        for doc in faculty_docs:
            f = doc.to_dict()
            f['id'] = doc.id
            u_doc = db.collection('users').document(f.get('user_id')).get()
            if u_doc.exists:
                f['name'] = u_doc.to_dict().get('name')
            d_doc = db.collection('departments').document(f.get('department_id')).get()
            if d_doc.exists:
                f['department_name'] = d_doc.to_dict().get('name')
            faculty_list.append(f)
        faculty_list.sort(key=lambda x: x.get('name', ''))
        
    except Exception as e:
        print(f"Dropdown load error: {e}")
        courses = subjects = faculty_list = []
    
    return render_template('timetable/add_timetable.html', 
                         courses=courses, subjects=subjects, faculty=faculty_list)

@timetable_bp.route('/edit/<timetable_id>', methods=['POST'])
@login_required
@role_required('admin')
def edit_timetable_json(timetable_id):
    try:
        db = get_firestore()
        data = request.json
        update_data = {
            'subject_id': data['subject_id'],
            'faculty_id': data['faculty_id'],
            'course_id': data['course_id'],
            'semester': data['semester'],
            'day_of_week': data['day_of_week'],
            'start_time': data['start_time'],
            'end_time': data['end_time'],
            'room_no': data.get('room_no', ''),
            'academic_year': data.get('academic_year', '2024-25'),
            'status': data.get('status', 'Active'),
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        db.collection('timetable').document(timetable_id).update(update_data)
        return jsonify({'success': True, 'message': 'Timetable entry updated successfully'})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500
    
    # Get entry and dropdown data
    try:
        tt_doc = db.collection('timetable').document(timetable_id).get()
        if not tt_doc.exists:
            flash('Timetable entry not found', 'danger')
            return redirect(url_for('timetable.timetable'))
            
        timetable_entry = tt_doc.to_dict()
        timetable_entry['id'] = tt_doc.id
        
        # Reuse dropdown logic
        courses_docs = db.collection('courses').stream()
        courses = []
        for doc in courses_docs:
            c = doc.to_dict()
            c['id'] = doc.id
            courses.append(c)
        courses.sort(key=lambda x: x.get('name', ''))
        
        subjects_docs = db.collection('subjects').where('status', '==', 'Active').stream()
        subjects = []
        for doc in subjects_docs:
            s = doc.to_dict()
            s['id'] = doc.id
            c_doc = db.collection('courses').document(s.get('course_id')).get()
            if c_doc.exists:
                s['course_name'] = c_doc.to_dict().get('name')
            subjects.append(s)
        subjects.sort(key=lambda x: (x.get('course_name', ''), x.get('semester', ''), x.get('name', '')))
        
        faculty_docs = db.collection('faculty').where('status', '==', 'Active').stream()
        faculty_list = []
        for doc in faculty_docs:
            f = doc.to_dict()
            f['id'] = doc.id
            u_doc = db.collection('users').document(f.get('user_id')).get()
            if u_doc.exists:
                f['name'] = u_doc.to_dict().get('name')
            d_doc = db.collection('departments').document(f.get('department_id')).get()
            if d_doc.exists:
                f['department_name'] = d_doc.to_dict().get('name')
            faculty_list.append(f)
        faculty_list.sort(key=lambda x: x.get('name', ''))
        
        return render_template('timetable/edit_timetable.html', 
                             timetable_entry=timetable_entry,
                             courses=courses, subjects=subjects, faculty=faculty_list)
        
    except Exception as e:
        print(f"Edit timetable load error: {e}")
        flash('Error loading timetable entry', 'danger')
        return redirect(url_for('timetable.timetable'))

@timetable_bp.route('/delete/<timetable_id>', methods=['POST'])
@login_required
@role_required('admin')
def delete_timetable_json(timetable_id):
    try:
        db = get_firestore()
        db.collection('timetable').document(timetable_id).delete()
        return jsonify({'success': True, 'message': 'Timetable entry deleted successfully'})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500
