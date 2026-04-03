from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback

fees_bp = Blueprint('fees', __name__)

@fees_bp.route('/data')
@login_required
def fees_data():
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
            
        return jsonify({'success': True, 'fees': fees_list}), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@fees_bp.route('/')
@login_required
def fees():
    try:
        return render_template('fees/fees.html', fees=[])
    except Exception as e:
        traceback.print_exc()
        flash('Error loading cloud fees data', 'error')
        return render_template('fees/fees.html', fees=[])


@fees_bp.route('/add', methods=['POST'])
@login_required
@role_required('admin')
def add_fee_json():
    db = get_firestore()
    try:
        data = request.json
        fee_data = {
            'student_id': data['student_id'],
            'fee_type': data['fee_type'],
            'amount': float(data['amount']),
            'due_date': data['due_date'],
            'academic_year': data['academic_year'],
            'semester': data.get('semester', ''),
            'remarks': data.get('remarks', ''),
            'status': 'Pending',
            'created_at': firestore.SERVER_TIMESTAMP
        }
        db.collection('fees').document().set(fee_data)
        return jsonify({'success': True, 'message': 'Fee record added successfully'}), 201
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@fees_bp.route('/pay/<fee_id>', methods=['POST'])
@login_required
@role_required('admin')
def mark_paid_json(fee_id):
    try:
        db = get_firestore()
        data = request.json
        update_data = {
            'status': 'Paid',
            'paid_date': firestore.SERVER_TIMESTAMP,
            'payment_method': data.get('payment_method', 'Cash'),
            'transaction_id': data.get('transaction_id', ''),
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        db.collection('fees').document(fee_id).update(update_data)
        return jsonify({'success': True, 'message': 'Payment recorded successfully'})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500