from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback

exams_bp = Blueprint('exams', __name__)

@exams_bp.route('/')
@login_required
@role_required('admin', 'faculty', 'staff')
def exams():
    try:
        db = get_firestore()
        exams_list = []
        
        # Query exams
        exams_ref = db.collection('examinations')
        
        if current_user.role == 'admin':
            query = exams_ref.order_by('exam_date', direction=firestore.Query.DESCENDING).stream()
        else:
            # Faculty filter (simulated join)
            # In a real app, we'd filter by subjects taught by faculty
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
            
        return render_template('exams/exams.html', exams=exams_list)
        
    except Exception as e:
        traceback.print_exc()
        flash('Error loading cloud exams data', 'error')
        return render_template('exams/exams.html', exams=[])

@exams_bp.route('/add', methods=['GET', 'POST'])
@login_required
@role_required('admin', 'faculty')
def add_exam():
    db = get_firestore()
    if request.method == 'POST':
        try:
            exam_data = {
                'name': request.form['name'],
                'subject_id': request.form['subject_id'],
                'course_id': request.form['course_id'],
                'semester': int(request.form['semester'] or 1),
                'exam_type': request.form['exam_type'],
                'max_marks': float(request.form['max_marks']),
                'exam_date': request.form['exam_date'],
                'start_time': request.form['start_time'],
                'duration_minutes': int(request.form['duration_minutes']),
                'venue': request.form.get('venue', ''),
                'instructions': request.form.get('instructions', ''),
                'status': 'Scheduled',
                'created_by': str(current_user.id),
                'created_at': firestore.SERVER_TIMESTAMP
            }
            db.collection('examinations').document().set(exam_data)
            flash('Assessment schedule deployed to academic cloud!', 'success')
            return redirect(url_for('exams.exams'))
        except Exception as e:
            traceback.print_exc()
            flash('Error synchronizing assessment parameters', 'error')
            
    # Get courses and subjects for selection
    courses = []
    subjects = []
    try:
        courses_query = db.collection('courses').order_by('name').stream()
        for doc in courses_query:
            c = doc.to_dict()
            c['id'] = doc.id
            courses.append(c)
            
        subs_query = db.collection('subjects').order_by('name').stream()
        for doc in subs_query:
            s = doc.to_dict()
            s['id'] = doc.id
            subjects.append(s)
    except:
        pass
    return render_template('exams/add_exam.html', courses=courses, subjects=subjects)

@exams_bp.route('/edit/<exam_id>', methods=['GET', 'POST'])
@login_required
@role_required('admin', 'faculty')
def edit_exam(exam_id):
    db = get_firestore()
    exam_ref = db.collection('examinations').document(exam_id)
    
    if request.method == 'POST':
        try:
            exam_data = {
                'name': request.form['name'],
                'subject_id': request.form['subject_id'],
                'course_id': request.form['course_id'],
                'semester': int(request.form['semester'] or 1),
                'exam_type': request.form['exam_type'],
                'max_marks': float(request.form['max_marks']),
                'exam_date': request.form['exam_date'],
                'start_time': request.form['start_time'],
                'duration_minutes': int(request.form['duration_minutes']),
                'venue': request.form.get('venue', ''),
                'instructions': request.form.get('instructions', ''),
                'status': request.form.get('status', 'Scheduled'),
                'updated_at': firestore.SERVER_TIMESTAMP
            }
            exam_ref.update(exam_data)
            flash('Assessment parameters updated and synchronized', 'success')
            return redirect(url_for('exams.exams'))
        except Exception as e:
            traceback.print_exc()
            flash('Error updating assessment synchronize protocol', 'error')

    # Get data
    exam_doc = exam_ref.get()
    if not exam_doc.exists:
        return redirect(url_for('exams.exams'))
    exam = exam_doc.to_dict()
    exam['id'] = exam_doc.id
    
    courses = []
    subjects = []
    try:
        courses_query = db.collection('courses').order_by('name').stream()
        for doc in courses_query:
            c = doc.to_dict()
            c['id'] = doc.id
            courses.append(c)
            
        subs_query = db.collection('subjects').order_by('name').stream()
        for doc in subs_query:
            s = doc.to_dict()
            s['id'] = doc.id
            subjects.append(s)
    except:
        pass
        
    return render_template('exams/edit_exam.html', exam=exam, courses=courses, subjects=subjects)

@exams_bp.route('/results/<exam_id>')
@login_required
@role_required('admin', 'faculty', 'staff')
def exam_results(exam_id):
    try:
        db = get_firestore()
        exam_doc = db.collection('examinations').document(exam_id).get()
        if not exam_doc.exists:
            flash('Exam not found in cloud', 'danger')
            return redirect(url_for('exams.exams'))
            
        exam = exam_doc.to_dict()
        exam['id'] = exam_doc.id
        
        # Details
        sub_doc = db.collection('subjects').document(exam.get('subject_id')).get()
        if sub_doc.exists:
            exam['subject_name'] = sub_doc.to_dict().get('name')
        
        results = []
        results_query = db.collection('exam_results').where('exam_id', '==', exam_id).stream()
        for doc in results_query:
            res = doc.to_dict()
            res['id'] = doc.id
            
            # Fetch student details
            st_doc = db.collection('students').document(res.get('student_id')).get()
            if st_doc.exists:
                st_data = st_doc.to_dict()
                res['reg_no'] = st_data.get('reg_no')
                u_doc = db.collection('users').document(st_data.get('user_id')).get()
                if u_doc.exists:
                    res['student_name'] = u_doc.to_dict().get('name')
            results.append(res)
            
        return render_template('exams/results.html', exam=exam, results=results)
    except Exception as e:
        traceback.print_exc()
        flash('Error loading results from cloud', 'error')
        return redirect(url_for('exams.exams'))

@exams_bp.route('/add_results/<exam_id>', methods=['GET', 'POST'])
@login_required
@role_required('admin', 'faculty')
def add_results(exam_id):
    db = get_firestore()
    if request.method == 'POST':
        try:
            student_ids = request.form.getlist('student_id')
            marks = request.form.getlist('marks_obtained')
            grades = request.form.getlist('grade')
            remarks = request.form.getlist('remarks')
            
            for i in range(len(student_ids)):
                if student_ids[i] and marks[i]:
                    sid = student_ids[i]
                    doc_id = f"{exam_id}_{sid}"
                    res_data = {
                        'exam_id': exam_id,
                        'student_id': sid,
                        'marks_obtained': float(marks[i]),
                        'grade': grades[i] or '',
                        'remarks': remarks[i] or '',
                        'updated_at': firestore.SERVER_TIMESTAMP
                    }
                    db.collection('exam_results').document(doc_id).set(res_data, merge=True)
            
            flash('Results saved to cloud successfully!', 'success')
            return redirect(url_for('exams.exam_results', exam_id=exam_id))
        except Exception as e:
            traceback.print_exc()
            flash('Error saving results to cloud', 'error')
            
    try:
        exam_doc = db.collection('examinations').document(exam_id).get()
        if not exam_doc.exists:
            return redirect(url_for('exams.exams'))
        exam = exam_doc.to_dict()
        exam['id'] = exam_doc.id
        
        # Get students enrolled
        students = []
        st_query = db.collection('students').where('course_id', '==', exam.get('course_id')).stream()
        for doc in st_query:
            s_data = doc.to_dict()
            u_doc = db.collection('users').document(s_data.get('user_id')).get()
            if u_doc.exists:
                s_data['student_name'] = u_doc.to_dict().get('name')
            s_data['id'] = doc.id
            students.append(s_data)
            
        return render_template('exams/add_results.html', exam=exam, students=students)
    except:
        return redirect(url_for('exams.exams'))

@exams_bp.route('/my_results')
@login_required
@role_required('student')
def my_results():
    try:
        db = get_firestore()
        st_docs = db.collection('students').where('user_id', '==', current_user.id).limit(1).get()
        if not st_docs:
            flash('Student record not found', 'danger')
            return redirect(url_for('auth.dashboard'))
            
        student_id = st_docs[0].id
        results = []
        res_query = db.collection('exam_results').where('student_id', '==', student_id).stream()
        for doc in res_query:
            res = doc.to_dict()
            ex_doc = db.collection('examinations').document(res.get('exam_id')).get()
            if ex_doc.exists:
                ex = ex_doc.to_dict()
                res['exam_name'] = ex.get('name')
                res['exam_type'] = ex.get('exam_type')
                res['max_marks'] = ex.get('max_marks')
                res['exam_date'] = ex.get('exam_date')
                
                sub_doc = db.collection('subjects').document(ex.get('subject_id')).get()
                if sub_doc.exists:
                    res['subject_name'] = sub_doc.to_dict().get('name')
            results.append(res)
            
        return render_template('exams/my_results.html', results=results)
    except Exception as e:
        traceback.print_exc()
        flash('Error loading results from cloud', 'error')
        return render_template('exams/my_results.html', results=[])