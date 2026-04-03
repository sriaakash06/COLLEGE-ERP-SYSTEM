from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback

notices_bp = Blueprint('notices', __name__)

@notices_bp.route('/data')
@login_required
def notices_data():
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
            
        return jsonify({'success': True, 'notices': notices_list}), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@notices_bp.route('/')
@login_required
@role_required('admin')
def notices():
    try:
        return render_template('notices/notices.html', notices=[])
    except Exception as e:
        traceback.print_exc()
        flash('Error loading cloud notices data', 'error')
        return render_template('notices/notices.html', notices=[])


@notices_bp.route('/add', methods=['POST'])
@login_required
@role_required('admin')
def add_notice_json():
    try:
        db = get_firestore()
        data = request.json
        notice_data = {
            'title': data['title'],
            'content': data['content'],
            'type': data.get('type', 'General'),
            'priority': data.get('priority', 'Normal'),
            'target_audience': data.get('target_audience', 'All'),
            'expiry_date': data.get('expiry_date', ''),
            'posted_by': str(current_user.id),
            'status': 'Active',
            'posted_date': firestore.SERVER_TIMESTAMP
        }
        db.collection('notices').add(notice_data)
        return jsonify({'success': True, 'message': 'Notice posted successfully'}), 201
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@notices_bp.route('/edit/<notice_id>', methods=['POST'])
@login_required
@role_required('admin')
def edit_notice_json(notice_id):
    try:
        db = get_firestore()
        data = request.json
        update_data = {
            'title': data['title'],
            'content': data['content'],
            'type': data.get('type', 'General'),
            'priority': data.get('priority', 'Normal'),
            'target_audience': data.get('target_audience', 'All'),
            'expiry_date': data.get('expiry_date', ''),
            'status': data.get('status', 'Active'),
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        db.collection('notices').document(notice_id).update(update_data)
        return jsonify({'success': True, 'message': 'Notice updated successfully'})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@notices_bp.route('/delete/<notice_id>', methods=['POST'])
@login_required
@role_required('admin')
def delete_notice_json(notice_id):
    try:
        db = get_firestore()
        db.collection('notices').document(notice_id).delete()
        return jsonify({'success': True, 'message': 'Notice deleted successfully'})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

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
