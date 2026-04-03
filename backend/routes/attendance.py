from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback
from datetime import datetime

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/')
@login_required
def attendance():
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
        if current_user.role == 'student':
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
            sub_doc = db.collection('subjects').document(att_data.get('subject_id')).get()
            if sub_doc.exists:
                att_data['subject_name'] = sub_doc.to_dict().get('name')
                
            # Fetch marked by name
            fac_doc = db.collection('faculty').document(att_data.get('faculty_id')).get()
            if fac_doc.exists:
                fu_doc = db.collection('users').document(fac_doc.to_dict().get('user_id')).get()
                if fu_doc.exists:
                    att_data['marked_by_name'] = fu_doc.to_dict().get('name')
            elif att_data.get('faculty_id') == 'admin':
                att_data['marked_by_name'] = 'Admin'

            records.append(att_data)
            
        return render_template('attendance/attendance.html', stats=stats, attendance=records)
        
    except Exception as e:
        traceback.print_exc()
        flash('Error loading cloud attendance data', 'error')
        return render_template('attendance/attendance.html', stats={}, attendance=[])

@attendance_bp.route('/mark', methods=['GET', 'POST'])
@login_required
@role_required('admin', 'faculty')
def mark_attendance():
    db = get_firestore()
    try:
        if request.method == 'POST':
            if 'fetch_students' in request.form:
                subject_id = request.form.get('subject_id')
                date = request.form.get('date')
                
                if not subject_id or not date:
                    flash('Please select subject and date', 'warning')
                    return redirect(url_for('attendance.mark_attendance'))

                # Get subject and course details
                subject_doc = db.collection('subjects').document(subject_id).get()
                if not subject_doc.exists:
                    flash('Subject not found in cloud', 'danger')
                    return redirect(url_for('attendance.mark_attendance'))
                
                subject = subject_doc.to_dict()
                subject['id'] = subject_doc.id
                
                # Course name
                course_doc = db.collection('courses').document(subject.get('course_id')).get()
                if course_doc.exists:
                    subject['course_name'] = course_doc.to_dict().get('name')
                
                # Get students enrolled in this course and semester
                # Schema: 'students' collection should have course_id and semester
                students = []
                st_query = db.collection('students').where('course_id', '==', subject.get('course_id')).stream()
                for s_doc in st_query:
                    s_data = s_doc.to_dict()
                    # Check user name
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
                    
                return render_template('attendance/mark_attendance.html', 
                                       step='mark', 
                                       subject=subject, 
                                       students=students, 
                                       date=date,
                                       existing=existing_map)
            
            elif 'save_attendance' in request.form:
                subject_id = request.form.get('subject_id')
                date = request.form.get('date')
                student_ids = request.form.getlist('student_ids')
                
                # Faculty ID
                faculty_id = 'admin'
                if current_user.role == 'faculty':
                    fac_docs = db.collection('faculty').where('user_id', '==', current_user.id).limit(1).get()
                    if fac_docs:
                        faculty_id = fac_docs[0].id
                
                for sid in student_ids:
                    status = request.form.get(f'status_{sid}')
                    if status:
                        # Upsert in Firestore: deterministic ID: subject_student_date
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
                
                flash('Attendance marked in cloud successfully!', 'success')
                return redirect(url_for('attendance.attendance'))
        
        # Initial Subjects List
        subjects = []
        sub_query = db.collection('subjects').stream()
        for doc in sub_query:
            s = doc.to_dict()
            s['id'] = doc.id
            c_doc = db.collection('courses').document(s.get('course_id')).get()
            if c_doc.exists:
                s['course_name'] = c_doc.to_dict().get('name')
            subjects.append(s)
            
        return render_template('attendance/mark_attendance.html', step='select', subjects=subjects)
        
    except Exception as e:
        traceback.print_exc()
        flash('An error occurred in cloud sync', 'danger')
        return redirect(url_for('attendance.attendance'))
