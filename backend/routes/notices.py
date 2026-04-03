from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback

notices_bp = Blueprint('notices', __name__)

@notices_bp.route('/')
@login_required
@role_required('admin')
def notices():
    try:
        db = get_firestore()
        notices_list = []
        
        # Fetch notices from Firestore
        notices_query = db.collection('notices').order_by('posted_date', direction=firestore.Query.DESCENDING).stream()
        
        for doc in notices_query:
            n_data = doc.to_dict()
            n_data['id'] = doc.id
            
            # Fetch poster name
            poster_doc = db.collection('users').document(n_data.get('posted_by')).get()
            if poster_doc.exists:
                n_data['posted_by_name'] = poster_doc.to_dict().get('name')
            else:
                n_data['posted_by_name'] = 'Unknown'
                
            notices_list.append(n_data)
            
        return render_template('notices/notices.html', notices=notices_list)
        
    except Exception as e:
        traceback.print_exc()
        flash('Error loading cloud notices data', 'error')
        return render_template('notices/notices.html', notices=[])

@notices_bp.route('/add', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def add_notice():
    if request.method == 'POST':
        try:
            db = get_firestore()
            notice_data = {
                'title': request.form['title'],
                'content': request.form['content'],
                'type': request.form['type'],
                'priority': request.form['priority'],
                'target_audience': request.form['target_audience'],
                'expiry_date': request.form.get('expiry_date', ''),
                'posted_by': str(current_user.id),
                'status': 'Active',
                'posted_date': firestore.SERVER_TIMESTAMP
            }
            
            db.collection('notices').document().set(notice_data)
            flash('Notice posted to cloud successfully!', 'success')
            return redirect(url_for('notices.notices'))
            
        except Exception as e:
            traceback.print_exc()
            flash('Error posting notice to cloud', 'error')
    
    return render_template('notices/add_notice.html')

@notices_bp.route('/edit/<notice_id>', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def edit_notice(notice_id):
    db = get_firestore()
    doc_ref = db.collection('notices').document(notice_id)
    
    if request.method == 'POST':
        try:
            update_data = {
                'title': request.form['title'],
                'content': request.form['content'],
                'type': request.form['type'],
                'priority': request.form['priority'],
                'target_audience': request.form['target_audience'],
                'expiry_date': request.form.get('expiry_date', ''),
                'status': request.form['status']
            }
            doc_ref.update(update_data)
            flash('Notice updated in cloud successfully!', 'success')
            return redirect(url_for('notices.notices'))
            
        except Exception as e:
            traceback.print_exc()
            flash('Error updating notice in cloud', 'error')
    
    try:
        doc = doc_ref.get()
        if not doc.exists:
            flash('Notice not found in cloud', 'danger')
            return redirect(url_for('notices.notices'))
            
        notice = doc.to_dict()
        notice['id'] = doc.id
        return render_template('notices/edit_notice.html', notice=notice)
        
    except Exception as e:
        traceback.print_exc()
        flash('Error loading notice from cloud', 'error')
        return redirect(url_for('notices.notices'))

@notices_bp.route('/delete/<notice_id>', methods=['POST'])
@login_required
@role_required('admin')
def delete_notice(notice_id):
    try:
        db = get_firestore()
        db.collection('notices').document(notice_id).delete()
        flash('Notice deleted from cloud successfully!', 'success')
    except Exception as e:
        traceback.print_exc()
        flash('Error deleting notice from cloud', 'error')
    
    return redirect(url_for('notices.notices'))

@notices_bp.route('/view/<notice_id>')
@login_required
def view_notice(notice_id):
    try:
        db = get_firestore()
        doc = db.collection('notices').document(notice_id).get()
        if not doc.exists:
            flash('Notice not found in cloud', 'danger')
            return redirect(url_for('auth.dashboard'))
        
        notice = doc.to_dict()
        notice['id'] = doc.id
        
        # Fetch poster name
        poster_doc = db.collection('users').document(notice.get('posted_by')).get()
        if poster_doc.exists:
            notice['posted_by_name'] = poster_doc.to_dict().get('name')
        
        return render_template('notices/view_notice.html', notice=notice)
        
    except Exception as e:
        traceback.print_exc()
        flash('Error loading notice from cloud', 'error')
        return redirect(url_for('auth.dashboard'))
