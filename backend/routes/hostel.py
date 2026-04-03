from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from db import get_firestore
from firebase_admin import firestore
from routes.auth import role_required
import traceback
from datetime import datetime

hostel_bp = Blueprint('hostel', __name__)

@hostel_bp.route('/data')
@login_required
def hostel_data():
    try:
        db = get_firestore()
        # Get all hostels
        hostels_docs = db.collection('hostel').stream()
        hostels = []
        for doc in hostels_docs:
            h = doc.to_dict()
            h['id'] = doc.id
            hostels.append(h)
            
        # Get allocations with status 'Allocated'
        allocations_docs = db.collection('hostel_allocation').where('status', '==', 'Allocated').stream()
        allocations = []
        for doc in allocations_docs:
            a = doc.to_dict()
            a['id'] = doc.id
            
            # Enrich with student data for UI
            s_doc = db.collection('students').document(a.get('student_id')).get()
            if s_doc.exists:
                s_data = s_doc.to_dict()
                a['reg_no'] = s_data.get('reg_no')
                u_doc = db.collection('users').document(s_data.get('user_id')).get()
                if u_doc.exists:
                    a['student_name'] = u_doc.to_dict().get('name')
                    
            allocations.append(a)
            
        rooms_list = []
        total_rooms_count = 0
        
        def get_room_allocations(hostel_id, room_no):
            return [a for a in allocations if a.get('hostel_id') == hostel_id and str(a.get('room_no')) == str(room_no)]

        for h in hostels:
            h_rooms = int(h.get('total_rooms', 0))
            h_capacity = int(h.get('capacity_per_room', 1))
            total_rooms_count += h_rooms
            
            for r in range(1, h_rooms + 1):
                room_num = str(r)
                room_allocs = get_room_allocations(h['id'], r)
                occupied_count = len(room_allocs)
                
                rooms_list.append({
                    'room_number': room_num,
                    'block_name': h.get('name'),
                    'capacity': h_capacity,
                    'occupied': occupied_count,
                    'available': h_capacity - occupied_count,
                    'room_type': h.get('type', 'Standard'),
                    'hostel_id': h['id'],
                    'students': room_allocs
                })

        total_students = len(allocations)
        occupied_rooms_count = sum(1 for r in rooms_list if r['occupied'] > 0)
        available_rooms_count = total_rooms_count - occupied_rooms_count
        
        stats = {
            'total_rooms': total_rooms_count,
            'occupied_rooms': occupied_rooms_count,
            'available_rooms': available_rooms_count,
            'total_students': total_students
        }
        
        return jsonify({
            'success': True,
            'stats': stats,
            'rooms': rooms_list,
            'hostels': hostels,
            'allocations': allocations
        }), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@hostel_bp.route('/')
@login_required
def hostel():
    try:
        return render_template('hostel/hostel.html', stats={}, rooms=[])
    except Exception as e:
        traceback.print_exc()
        flash('Error loading hostels', 'danger')
        return render_template('hostel/hostel.html', stats={}, rooms=[])


@hostel_bp.route('/add', methods=['POST'])
@login_required
@role_required('admin')
def add_hostel_json():
    try:
        db = get_firestore()
        data = request.json
        hostel_data = {
            'name': data['name'],
            'type': data['type'],
            'total_rooms': int(data['total_rooms']),
            'capacity_per_room': int(data['capacity_per_room']),
            'address': data.get('address', ''),
            'phone': data.get('phone', ''),
            'email': data.get('email', ''),
            'created_at': firestore.SERVER_TIMESTAMP
        }
        db.collection('hostel').add(hostel_data)
        return jsonify({'success': True, 'message': 'Hostel added successfully'}), 201
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@hostel_bp.route('/allocate', methods=['POST'])
@login_required
@role_required('admin')
def allocate_room_json():
    try:
        db = get_firestore()
        data = request.json
        student_id = data['student_id']
        hostel_id = data['hostel_id']
        room_no = data['room_no']
        
        # Check if student is already allocated
        existing = db.collection('hostel_allocation').where('student_id', '==', student_id).where('status', '==', 'Allocated').limit(1).get()
        if len(existing) > 0:
            return jsonify({'success': False, 'message': 'Student is already allocated to a room'}), 400
        
        # Check room capacity
        hostel_doc = db.collection('hostel').document(hostel_id).get()
        if not hostel_doc.exists:
            return jsonify({'success': False, 'message': 'Hostel not found'}), 404
            
        capacity = hostel_doc.to_dict().get('capacity_per_room', 1)
        current_allocs = db.collection('hostel_allocation').where('hostel_id', '==', hostel_id).where('room_no', '==', room_no).where('status', '==', 'Allocated').get()
        
        if len(current_allocs) >= capacity:
            return jsonify({'success': False, 'message': 'Room is at full capacity'}), 400

        alloc_data = {
            'student_id': student_id,
            'hostel_id': hostel_id,
            'room_no': room_no,
            'bed_no': data.get('bed_no', ''),
            'status': 'Allocated',
            'allocation_date': datetime.now().strftime('%Y-%m-%d'),
            'created_at': firestore.SERVER_TIMESTAMP
        }
        db.collection('hostel_allocation').add(alloc_data)
        return jsonify({'success': True, 'message': 'Room allocated successfully'})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@hostel_bp.route('/allocations')
@login_required
@role_required('admin')
def allocations():
    try:
        alloc_docs = db.collection('hostel_allocation').where('status', '==', 'Allocated').stream()
        allocations_list = []
        
        for doc in alloc_docs:
            a = doc.to_dict()
            a['id'] = doc.id
            
            # Fetch hostel name
            h_doc = db.collection('hostel').document(a.get('hostel_id')).get()
            if h_doc.exists:
                h_data = h_doc.to_dict()
                a['hostel_name'] = h_data.get('name')
                a['hostel_type'] = h_data.get('type')
            
            # Fetch student/user info
            s_doc = db.collection('students').document(a.get('student_id')).get()
            if s_doc.exists:
                s_data = s_doc.to_dict()
                a['reg_no'] = s_data.get('reg_no')
                u_doc = db.collection('users').document(s_data.get('user_id')).get()
                if u_doc.exists:
                    u_data = u_doc.to_dict()
                    a['student_name'] = u_data.get('name')
                    a['student_email'] = u_data.get('email')
                    
            allocations_list.append(a)
            
        # Sort by hostel name and room no
        allocations_list.sort(key=lambda x: (x.get('hostel_name', ''), str(x.get('room_no', ''))))
        
        return render_template('hostel/allocations.html', allocations=allocations_list)
        
    except Exception as e:
        print(f"Allocations error: {e}")
        flash('Error loading allocations', 'danger')
        return render_template('hostel/allocations.html', allocations=[])

@hostel_bp.route('/vacate/<allocation_id>', methods=['POST'])
@login_required
@role_required('admin')
def vacate_room_json(allocation_id):
    try:
        db = get_firestore()
        db.collection('hostel_allocation').document(allocation_id).update({
            'status': 'Vacated',
            'vacate_date': datetime.now().strftime('%Y-%m-%d'),
            'updated_at': firestore.SERVER_TIMESTAMP
        })
        return jsonify({'success': True, 'message': 'Room vacated successfully'})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500
