from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback

fees_bp = Blueprint('fees', __name__)

@fees_bp.route('/')
@login_required
def fees():
    try:
        db = get_firestore()
        fees_list = []
        
        fees_ref = db.collection('fees')
        
        if current_user.role == 'admin':
            query = fees_ref.order_by('due_date', direction=firestore.Query.DESCENDING).stream()
        elif current_user.role == 'student':
            st_docs = db.collection('students').where('user_id', '==', current_user.id).limit(1).get()
            if st_docs:
                sid = st_docs[0].id
                query = fees_ref.where('student_id', '==', sid).order_by('due_date', direction=firestore.Query.DESCENDING).stream()
            else:
                query = []
        else:
            query = []
            
        for doc in query:
            f_data = doc.to_dict()
            f_data['id'] = doc.id
            
            # Fetch student details
            st_doc = db.collection('students').document(f_data.get('student_id')).get()
            if st_doc.exists:
                st_data = st_doc.to_dict()
                f_data['reg_no'] = st_data.get('reg_no')
                u_doc = db.collection('users').document(st_data.get('user_id')).get()
                if u_doc.exists:
                    u_data = u_doc.to_dict()
                    f_data['student_name'] = u_data.get('name')
                    f_data['email'] = u_data.get('email')
                
            fees_list.append(f_data)
            
        return render_template('fees/fees.html', fees=fees_list)
        
    except Exception as e:
        traceback.print_exc()
        flash('Error loading cloud fees data', 'error')
        return render_template('fees/fees.html', fees=[])

@fees_bp.route('/add', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def add_fee():
    db = get_firestore()
    if request.method == 'POST':
        try:
            fee_data = {
                'student_id': request.form['student_id'],
                'fee_type': request.form['fee_type'],
                'amount': float(request.form['amount']),
                'due_date': request.form['due_date'],
                'academic_year': request.form['academic_year'],
                'semester': request.form.get('semester', ''),
                'remarks': request.form.get('remarks', ''),
                'status': 'Pending',
                'created_at': firestore.SERVER_TIMESTAMP
            }
            db.collection('fees').document().set(fee_data)
            flash('Fee record added to cloud successfully!', 'success')
            return redirect(url_for('fees.fees'))
        except Exception as e:
            traceback.print_exc()
            flash('Error adding fee record to cloud', 'error')
            
    # Get students
    students = []
    try:
        st_query = db.collection('students').stream()
        for doc in st_query:
            s_data = doc.to_dict()
            u_doc = db.collection('users').document(s_data.get('user_id')).get()
            if u_doc.exists:
                s_data['name'] = u_doc.to_dict().get('name')
            s_data['id'] = doc.id
            students.append(s_data)
    except:
        pass
    return render_template('fees/add_fee.html', students=students)

@fees_bp.route('/pay/<fee_id>', methods=['POST'])
@login_required
@role_required('admin')
def mark_paid(fee_id):
    try:
        db = get_firestore()
        update_data = {
            'status': 'Paid',
            'paid_date': firestore.SERVER_TIMESTAMP,
            'payment_method': request.form['payment_method'],
            'transaction_id': request.form.get('transaction_id', ''),
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        db.collection('fees').document(fee_id).update(update_data)
        flash('Fee marked as paid in cloud!', 'success')
    except Exception as e:
        traceback.print_exc()
        flash('Error updating fee in cloud', 'error')
    
    return redirect(url_for('fees.fees'))