from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback
from datetime import datetime

library_bp = Blueprint('library', __name__)

@library_bp.route('/')
@login_required
def library():
    try:
        db = get_firestore()
        books_list = []
        
        books_query = db.collection('library').where('status', '==', 'Available').order_by('book_title').stream()
        
        for doc in books_query:
            b_data = doc.to_dict()
            b_data['id'] = doc.id
            b_data['issued_copies'] = b_data.get('total_copies', 0) - b_data.get('available_copies', 0)
            books_list.append(b_data)
            
        return render_template('library/library.html', books=books_list)
        
    except Exception as e:
        traceback.print_exc()
        flash('Error loading cloud library data', 'error')
        return render_template('library/library.html', books=[])

@library_bp.route('/add_book', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def add_book():
    if request.method == 'POST':
        try:
            db = get_firestore()
            total_copies = int(request.form['total_copies'])
            book_data = {
                'book_title': request.form['book_title'],
                'author': request.form['author'],
                'isbn': request.form.get('isbn', ''),
                'publication': request.form.get('publication', ''),
                'category': request.form['category'],
                'total_copies': total_copies,
                'available_copies': total_copies,
                'location': request.form.get('location', ''),
                'status': 'Available',
                'created_at': firestore.SERVER_TIMESTAMP
            }
            db.collection('library').document().set(book_data)
            flash('Book added to cloud successfully!', 'success')
            return redirect(url_for('library.library'))
        except Exception as e:
            traceback.print_exc()
            flash('Error adding book to cloud', 'error')
    return render_template('library/add_book.html')

@library_bp.route('/issue_book/<book_id>', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def issue_book(book_id):
    db = get_firestore()
    if request.method == 'POST':
        try:
            student_id = request.form['student_id']
            due_date = request.form['due_date']
            
            # Atomic update for available copies
            book_ref = db.collection('library').document(book_id)
            
            @firestore.transactional
            def update_in_transaction(transaction, book_ref):
                snapshot = book_ref.get(transaction=transaction)
                available = snapshot.get('available_copies')
                
                if available <= 0:
                    return False
                
                # Create issuance record
                issuance_data = {
                    'book_id': book_id,
                    'student_id': student_id,
                    'due_date': due_date,
                    'status': 'Issued',
                    'issued_date': firestore.SERVER_TIMESTAMP
                }
                new_issuance_ref = db.collection('book_issuance').document()
                transaction.set(new_issuance_ref, issuance_data)
                
                # Update book
                transaction.update(book_ref, {'available_copies': available - 1})
                return True

            transaction = db.transaction()
            success = update_in_transaction(transaction, book_ref)
            
            if success:
                flash('Book issued in cloud successfully!', 'success')
                return redirect(url_for('library.issued_books'))
            else:
                flash('Book not available for issuance in cloud', 'danger')
                return redirect(url_for('library.library'))
                
        except Exception as e:
            traceback.print_exc()
            flash('Error issuing book in cloud', 'error')
            
    try:
        st_query = db.collection('students').stream()
        students = []
        for doc in st_query:
            s_data = doc.to_dict()
            u_doc = db.collection('users').document(s_data.get('user_id')).get()
            if u_doc.exists:
                s_data['name'] = u_doc.to_dict().get('name')
            s_data['id'] = doc.id
            students.append(s_data)
            
        book_doc = db.collection('library').document(book_id).get()
        if not book_doc.exists:
            return redirect(url_for('library.library'))
        book = book_doc.to_dict()
        
        return render_template('library/issue_book.html', book=book, book_id=book_id, students=students)
    except:
        return redirect(url_for('library.library'))

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
def return_book(issuance_id):
    try:
        db = get_firestore()
        iss_ref = db.collection('book_issuance').document(issuance_id)
        
        @firestore.transactional
        def process_return(transaction, iss_ref):
            snap = iss_ref.get(transaction=transaction)
            if not snap.exists: return
            
            iss_data = snap.to_dict()
            if iss_data.get('status') == 'Returned': return
            
            book_id = iss_data.get('book_id')
            book_ref = db.collection('library').document(book_id)
            book_snap = book_ref.get(transaction=transaction)
            
            # Update issuance
            transaction.update(iss_ref, {
                'status': 'Returned',
                'return_date': firestore.SERVER_TIMESTAMP
            })
            
            # Update book count
            if book_snap.exists:
                transaction.update(book_ref, {
                    'available_copies': book_snap.get('available_copies') + 1
                })
        
        transaction = db.transaction()
        process_return(transaction, iss_ref)
        flash('Book returned in cloud successfully!', 'success')
    except Exception as e:
        traceback.print_exc()
        flash('Error returning book in cloud', 'error')
    return redirect(url_for('library.issued_books'))