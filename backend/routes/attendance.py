from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback
from datetime import datetime

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/data')
def attendance_data():
    try:
        db = get_firestore()
        today_str = datetime.now().strftime('%Y-%m-%d')
        
        # Stats based on today's attendance
        attendance_ref = db.collection('attendance')
        today_query = attendance_ref.where('date', '==', today_str).stream()
        
        present_today = 0
        absent_today = 0
        on_leave = 0
        
        for doc in today_query:
            status = doc.to_dict().get('status')
            if status == 'Present': present_today += 1
            elif status == 'Absent': absent_today += 1
            elif status == 'Leave': on_leave += 1
            
        stats = {
            'present_today': present_today,
            'absent_today': absent_today,
            'on_leave': on_leave,
            'attendance_rate': round((present_today / (present_today + absent_today) * 100)) if (present_today + absent_today) > 0 else 0
        }
        
        # Recent records
        records = []
        is_student = getattr(current_user, 'role', None) == 'student'
        if is_student:
            # Get student record
            student_docs = db.collection('students').where('user_id', '==', current_user.id).limit(1).get()
            if student_docs:
                sid = student_docs[0].id
                query = attendance_ref.where('student_id', '==', sid).order_by('date', direction=firestore.Query.DESCENDING).limit(50).stream()
            else:
                query = []
        else:
            query = attendance_ref.order_by('date', direction=firestore.Query.DESCENDING).limit(50).stream()

        for doc in query:
            att_data = doc.to_dict()
            att_data['id'] = doc.id
            
            # Fetch student name
            st_doc = db.collection('students').document(att_data.get('student_id')).get()
            if st_doc.exists:
                su_doc = db.collection('users').document(st_doc.to_dict().get('user_id')).get()
                if su_doc.exists:
                    att_data['student_name'] = su_doc.to_dict().get('name')
            
            # Fetch subject name
            sub_doc = db.collection('subjects').document(att_data.get('subject_id', '')).get()
            if sub_doc.exists:
                att_data['subject_name'] = sub_doc.to_dict().get('name')
                
            # Fetch marked by name
            faculty_id = att_data.get('faculty_id')
            if faculty_id and faculty_id != 'admin':
                fac_doc = db.collection('faculty').document(faculty_id).get()
                if fac_doc.exists:
                    fu_doc = db.collection('users').document(fac_doc.to_dict().get('user_id')).get()
                    if fu_doc.exists:
                        att_data['marked_by_name'] = fu_doc.to_dict().get('name')
            else:
                att_data['marked_by_name'] = 'Admin'

            records.append(att_data)
            
        return jsonify({'stats': stats, 'attendance': records}), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@attendance_bp.route('/fetch-students', methods=['POST'])
@login_required
@role_required('admin', 'faculty')
def fetch_students_api():
    try:
        db = get_firestore()
        data = request.json
        subject_id = data.get('subject_id')
        date = data.get('date')
        
        if not subject_id or not date:
            return jsonify({'success': False, 'message': 'Subject and date are required'}), 400

        # Get subject details
        subject_doc = db.collection('subjects').document(subject_id).get()
        if not subject_doc.exists:
            return jsonify({'success': False, 'message': 'Subject not found'}), 404
        
        subject = subject_doc.to_dict()
        subject['id'] = subject_doc.id
        
        # Get students enrolled in this course
        students = []
        st_query = db.collection('students').where('course_id', '==', subject.get('course_id')).stream()
        for s_doc in st_query:
            s_data = s_doc.to_dict()
            u_doc = db.collection('users').document(s_data.get('user_id')).get()
            if u_doc.exists:
                s_data['name'] = u_doc.to_dict().get('name')
            s_data['id'] = s_doc.id
            students.append(s_data)
        
        # Existing attendance check
        existing_map = {}
        att_query = db.collection('attendance').where('subject_id', '==', subject_id).where('date', '==', date).stream()
        for a_doc in att_query:
            ad = a_doc.to_dict()
            existing_map[ad.get('student_id')] = ad.get('status')
            
        return jsonify({
            'success': True,
            'subject': subject,
            'students': students,
            'existing': existing_map
        }), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@attendance_bp.route('/save', methods=['POST'])
@login_required
@role_required('admin', 'faculty')
def save_attendance_api():
    try:
        db = get_firestore()
        data = request.json
        subject_id = data.get('subject_id')
        date = data.get('date')
        attendance_list = data.get('attendance', []) # List of {student_id: status}
        
        # Faculty ID
        faculty_id = 'admin'
        if current_user.role == 'faculty':
            fac_docs = db.collection('faculty').where('user_id', '==', current_user.id).limit(1).get()
            if fac_docs:
                faculty_id = fac_docs[0].id
        
        for record in attendance_list:
            sid = record.get('student_id')
            status = record.get('status')
            if sid and status:
                doc_id = f"{subject_id}_{sid}_{date.replace('-', '')}"
                att_data = {
                    'student_id': sid,
                    'subject_id': subject_id,
                    'faculty_id': faculty_id,
                    'date': date,
                    'status': status,
                    'updated_at': firestore.SERVER_TIMESTAMP
                }
                db.collection('attendance').document(doc_id).set(att_data, merge=True)
        
        return jsonify({'success': True, 'message': 'Attendance saved successfully'}), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@attendance_bp.route('/subjects')
@login_required
@role_required('admin', 'faculty')
def get_subjects():
    try:
        db = get_firestore()
        subjects = []
        sub_query = db.collection('subjects').stream()
        for doc in sub_query:
            s = doc.to_dict()
            s['id'] = doc.id
            c_doc = db.collection('courses').document(s.get('course_id')).get()
            if c_doc.exists:
                s['course_name'] = c_doc.to_dict().get('name')
            subjects.append(s)
        return jsonify({'success': True, 'subjects': subjects}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@attendance_bp.route('/')
@login_required
def attendance():
    return render_template('attendance/attendance.html', stats={}, attendance=[])
