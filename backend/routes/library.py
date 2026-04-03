from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback
from datetime import datetime

library_bp = Blueprint('library', __name__)

@library_bp.route('/data')
@login_required
def library_data():
    try:
        db = get_firestore()
        books_list = []
        issued_list = []
        
        # Available books
        books_query = db.collection('library').where('status', '==', 'Available').order_by('book_title').stream()
        for doc in books_query:
            b_data = doc.to_dict()
            b_data['id'] = doc.id
            b_data['issued_copies'] = b_data.get('total_copies', 0) - b_data.get('available_copies', 0)
            books_list.append(b_data)
            
        # Issued books
        if current_user.role == 'admin':
            iss_query = db.collection('book_issuance').where('status', '==', 'Issued').stream()
        elif current_user.role == 'student':
            st_docs = db.collection('students').where('user_id', '==', current_user.id).limit(1).get()
            if st_docs:
                sid = st_docs[0].id
                iss_query = db.collection('book_issuance').where('student_id', '==', sid).where('status', '==', 'Issued').stream()
            else:
                iss_query = []
        else:
            iss_query = []
            
        today = datetime.now()
        for doc in iss_query:
            i_data = doc.to_dict()
            i_data['id'] = doc.id
            
            # Details
            book_doc = db.collection('library').document(i_data.get('book_id')).get()
            if book_doc.exists:
                b = book_doc.to_dict()
                i_data['book_title'] = b.get('book_title')
                i_data['author'] = b.get('author')
                
            st_doc = db.collection('students').document(i_data.get('student_id')).get()
            if st_doc.exists:
                st_data = st_doc.to_dict()
                i_data['reg_no'] = st_data.get('reg_no')
                u_doc = db.collection('users').document(st_data.get('user_id')).get()
                if u_doc.exists:
                    i_data['student_name'] = u_doc.to_dict().get('name')
            
            # Days remaining
            due_date_str = i_data.get('due_date')
            if due_date_str:
                due_date = datetime.strptime(due_date_str, '%Y-%m-%d')
                delta = due_date - today
                i_data['days_remaining'] = delta.days
            
            issued_list.append(i_data)
            
        return jsonify({
            'success': True, 
            'books': books_list,
            'issued_books': issued_list
        }), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@library_bp.route('/')
@login_required
def library():
    try:
        return render_template('library/library.html', books=[])
    except Exception as e:
        traceback.print_exc()
        flash('Error loading cloud library data', 'error')
        return render_template('library/library.html', books=[])


@library_bp.route('/add_book', methods=['POST'])
@login_required
@role_required('admin')
def add_book_json():
    try:
        db = get_firestore()
        data = request.json
        total_copies = int(data['total_copies'])
        book_data = {
            'book_title': data['book_title'],
            'author': data['author'],
            'isbn': data.get('isbn', ''),
            'publication': data.get('publication', ''),
            'category': data['category'],
            'total_copies': total_copies,
            'available_copies': total_copies,
            'location': data.get('location', ''),
            'status': 'Available',
            'created_at': firestore.SERVER_TIMESTAMP
        }
        db.collection('library').document().set(book_data)
        return jsonify({'success': True, 'message': 'Book added successfully'}), 201
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@library_bp.route('/issue_book/<book_id>', methods=['POST'])
@login_required
@role_required('admin')
def issue_book_json(book_id):
    db = get_firestore()
    try:
        data = request.json
        student_id = data['student_id']
        due_date = data['due_date']
        
        book_ref = db.collection('library').document(book_id)
        
        @firestore.transactional
        def update_in_transaction(transaction, book_ref):
            snapshot = book_ref.get(transaction=transaction)
            available = snapshot.get('available_copies')
            
            if available <= 0:
                return False
            
            issuance_data = {
                'book_id': book_id,
                'student_id': student_id,
                'due_date': due_date,
                'status': 'Issued',
                'issued_date': firestore.SERVER_TIMESTAMP
            }
            db.collection('book_issuance').document().set(issuance_data)
            transaction.update(book_ref, {'available_copies': available - 1})
            return True

        transaction = db.transaction()
        success = update_in_transaction(transaction, book_ref)
        
        if success:
            return jsonify({'success': True, 'message': 'Book issued successfully'})
        else:
            return jsonify({'success': False, 'message': 'Book not available'}), 400
                
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@library_bp.route('/issued_books')
@login_required
def issued_books():
    try:
        db = get_firestore()
        issued_list = []
        
        if current_user.role == 'admin':
            query = db.collection('book_issuance').where('status', '==', 'Issued').stream()
        elif current_user.role == 'student':
            st_docs = db.collection('students').where('user_id', '==', current_user.id).limit(1).get()
            if st_docs:
                sid = st_docs[0].id
                query = db.collection('book_issuance').where('student_id', '==', sid).where('status', '==', 'Issued').stream()
            else:
                query = []
        else:
            query = []
            
        today = datetime.now()
        for doc in query:
            i_data = doc.to_dict()
            i_data['id'] = doc.id
            
            # Details
            book_doc = db.collection('library').document(i_data.get('book_id')).get()
            if book_doc.exists:
                b = book_doc.to_dict()
                i_data['book_title'] = b.get('book_title')
                i_data['author'] = b.get('author')
                
            st_doc = db.collection('students').document(i_data.get('student_id')).get()
            if st_doc.exists:
                st_data = st_doc.to_dict()
                i_data['reg_no'] = st_data.get('reg_no')
                u_doc = db.collection('users').document(st_data.get('user_id')).get()
                if u_doc.exists:
                    i_data['student_name'] = u_doc.to_dict().get('name')
            
            # Days remaining
            due_date = datetime.strptime(i_data.get('due_date'), '%Y-%m-%d')
            delta = due_date - today
            i_data['days_remaining'] = delta.days
            
            issued_list.append(i_data)
            
        return render_template('library/issued_books.html', issued_books=issued_list)
    except Exception as e:
        traceback.print_exc()
        return render_template('library/issued_books.html', issued_books=[])

@library_bp.route('/return_book/<issuance_id>', methods=['POST'])
@login_required
@role_required('admin')
def return_book_json(issuance_id):
    try:
        db = get_firestore()
        iss_ref = db.collection('book_issuance').document(issuance_id)
        
        @firestore.transactional
        def process_return(transaction, iss_ref):
            snap = iss_ref.get(transaction=transaction)
            if not snap.exists: return False
            
            iss_data = snap.to_dict()
            if iss_data.get('status') == 'Returned': return False
            
            book_id = iss_data.get('book_id')
            book_ref = db.collection('library').document(book_id)
            book_snap = book_ref.get(transaction=transaction)
            
            transaction.update(iss_ref, {
                'status': 'Returned',
                'return_date': firestore.SERVER_TIMESTAMP
            })
            
            if book_snap.exists:
                transaction.update(book_ref, {
                    'available_copies': book_snap.get('available_copies') + 1
                })
            return True
        
        transaction = db.transaction()
        success = process_return(transaction, iss_ref)
        if success:
            return jsonify({'success': True, 'message': 'Book returned successfully'})
        return jsonify({'success': False, 'message': 'Invalid issuance or already returned'}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500