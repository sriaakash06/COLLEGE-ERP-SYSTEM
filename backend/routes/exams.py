from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback

exams_bp = Blueprint('exams', __name__)

@exams_bp.route('/data')
@login_required
@role_required('admin', 'faculty', 'staff')
def exams_data():
    try:
        db = get_firestore()
        exams_list = []
        
        # Query exams
        exams_ref = db.collection('examinations')
        
        if current_user.role == 'admin':
            query = exams_ref.order_by('exam_date', direction=firestore.Query.DESCENDING).stream()
        else:
            # Faculty filter (simulated join)
            query = exams_ref.order_by('exam_date', direction=firestore.Query.DESCENDING).stream()

        for doc in query:
            e_data = doc.to_dict()
            e_data['id'] = doc.id
            
            # Fetch subject name
            sub_doc = db.collection('subjects').document(e_data.get('subject_id')).get()
            if sub_doc.exists:
                e_data['subject_name'] = sub_doc.to_dict().get('name')
                
            # Fetch course name
            course_doc = db.collection('courses').document(e_data.get('course_id')).get()
            if course_doc.exists:
                e_data['course_name'] = course_doc.to_dict().get('name')
                
            # Fetch creator name
            user_doc = db.collection('users').document(e_data.get('created_by')).get()
            if user_doc.exists:
                e_data['created_by_name'] = user_doc.to_dict().get('name')
                
            exams_list.append(e_data)
            
        return jsonify({'success': True, 'exams': exams_list}), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@exams_bp.route('/save', methods=['POST'])
@login_required
@role_required('admin', 'faculty')
def save_exam_api():
    try:
        db = get_firestore()
        data = request.json
        exam_data = {
            'name': data.get('name'),
            'subject_id': data.get('subject_id'),
            'course_id': data.get('course_id'),
            'semester': int(data.get('semester', 1)),
            'exam_type': data.get('exam_type'),
            'max_marks': float(data.get('max_marks', 100)),
            'exam_date': data.get('exam_date'),
            'start_time': data.get('start_time'),
            'duration_minutes': int(data.get('duration_minutes', 60)),
            'venue': data.get('venue', ''),
            'instructions': data.get('instructions', ''),
            'status': 'Scheduled',
            'created_by': current_user.id,
            'created_at': firestore.SERVER_TIMESTAMP
        }
        db.collection('examinations').document().set(exam_data)
        return jsonify({'success': True, 'message': 'Exam scheduled successfully'}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@exams_bp.route('/update/<exam_id>', methods=['POST'])
@login_required
@role_required('admin', 'faculty')
def update_exam_api(exam_id):
    try:
        db = get_firestore()
        data = request.json
        exam_ref = db.collection('examinations').document(exam_id)
        if not exam_ref.get().exists:
            return jsonify({'success': False, 'message': 'Exam not found'}), 404
            
        update_data = {
            'name': data.get('name'),
            'subject_id': data.get('subject_id'),
            'course_id': data.get('course_id'),
            'semester': int(data.get('semester', 1)),
            'exam_type': data.get('exam_type'),
            'max_marks': float(data.get('max_marks', 100)),
            'exam_date': data.get('exam_date'),
            'start_time': data.get('start_time'),
            'duration_minutes': int(data.get('duration_minutes', 60)),
            'venue': data.get('venue', ''),
            'instructions': data.get('instructions', ''),
            'status': data.get('status', 'Scheduled'),
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        exam_ref.update(update_data)
        return jsonify({'success': True, 'message': 'Exam updated successfully'}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@exams_bp.route('/results/<exam_id>/data')
@login_required
def exam_results_data(exam_id):
    try:
        db = get_firestore()
        # Fetch results and student names
        results = []
        results_query = db.collection('exam_results').where('exam_id', '==', exam_id).stream()
        for doc in results_query:
            res = doc.to_dict()
            res['id'] = doc.id
            st_doc = db.collection('students').document(res.get('student_id')).get()
            if st_doc.exists:
                res['reg_no'] = st_doc.to_dict().get('reg_no')
                u_doc = db.collection('users').document(st_doc.to_dict().get('user_id')).get()
                if u_doc.exists:
                    res['student_name'] = u_doc.to_dict().get('name')
            results.append(res)
        return jsonify({'success': True, 'results': results}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@exams_bp.route('/save-marks', methods=['POST'])
@login_required
@role_required('admin', 'faculty')
def save_marks_api():
    try:
        db = get_firestore()
        data = request.json
        exam_id = data.get('exam_id')
        marks_list = data.get('marks', []) # List of {student_id, marks_obtained, grade, remarks}
        
        for entry in marks_list:
            sid = entry.get('student_id')
            if sid:
                doc_id = f"{exam_id}_{sid}"
                res_data = {
                    'exam_id': exam_id,
                    'student_id': sid,
                    'marks_obtained': float(entry.get('marks_obtained', 0)),
                    'grade': entry.get('grade', ''),
                    'remarks': entry.get('remarks', ''),
                    'updated_at': firestore.SERVER_TIMESTAMP
                }
                db.collection('exam_results').document(doc_id).set(res_data, merge=True)
        return jsonify({'success': True, 'message': 'Marks updated successfully'}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@exams_bp.route('/my-results/data')
@login_required
@role_required('student')
def my_results_data():
    try:
        db = get_firestore()
        st_docs = db.collection('students').where('user_id', '==', current_user.id).limit(1).get()
        if not st_docs: return jsonify({'success': False, 'message': 'Student record not found'}), 404
        
        student_id = st_docs[0].id
        results = []
        res_query = db.collection('exam_results').where('student_id', '==', student_id).stream()
        for doc in res_query:
            res = doc.to_dict()
            ex_doc = db.collection('examinations').document(res.get('exam_id')).get()
            if ex_doc.exists:
                ex = ex_doc.to_dict()
                res.update({
                    'exam_name': ex.get('name'),
                    'exam_type': ex.get('exam_type'),
                    'max_marks': ex.get('max_marks'),
                    'exam_date': ex.get('exam_date')
                })
                sub_doc = db.collection('subjects').document(ex.get('subject_id')).get()
                if sub_doc.exists:
                    res['subject_name'] = sub_doc.to_dict().get('name')
            results.append(res)
        return jsonify({'success': True, 'results': results}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@exams_bp.route('/')
@login_required
def exams_view():
    return render_template('exams/exams.html', exams=[])